/** 
* UTILISATEURS
* Remarque : Cette table contient les données des utilisateurs. Les utilisateurs ne doivent pouvoir consulter et mettre à jour que leurs propres données.
*/
create table users (
  -- UUID provenant de auth.users
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  -- L'adresse de facturation du client, au format JSON.
  billing_address jsonb,
  -- Stocke les moyens de paiement du client.
  payment_method jsonb,
  -- Dates pour le suivi temporel et la suppression douce (soft delete)
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

/**
* Déclencheur (trigger) pour mettre à jour automatiquement updated_at
*/
create function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
create trigger on_users_updated
  before update on public.users
  for each row execute procedure public.handle_updated_at();
alter table users enable row level security;
create policy "Can view own user data." on users for select using (auth.uid() = id);
create policy "Can update own user data." on users for update using (auth.uid() = id);

/**
* Ce déclencheur (trigger) crée automatiquement une entrée utilisateur lorsqu'un nouvel utilisateur s'inscrit via Supabase Auth.
*/ 
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

/**
* CLIENTS
* Remarque : il s'agit d'une table privée contenant la correspondance entre les identifiants d'utilisateurs et les identifiants clients Stripe.
*/
create table customers (
  -- UUID provenant de auth.users
  id uuid references auth.users not null primary key,
  -- L'identifiant client de l'utilisateur dans Stripe. L'utilisateur ne doit pas pouvoir le modifier.
  stripe_customer_id text
);
alter table customers enable row level security;
-- Aucune politique (policy) car il s'agit d'une table privée à laquelle l'utilisateur ne doit pas avoir accès.

/** 
* PRODUITS
* Remarque : les produits sont créés et gérés dans Stripe et synchronisés dans notre BD via les webhooks de Stripe.
*/
create table products (
  -- L'identifiant du produit provenant de Stripe, ex. prod_1234.
  id text primary key,
  -- Indique si le produit est actuellement disponible à l'achat.
  active boolean,
  -- Le nom du produit, destiné à être affiché au client. Lorsqu'un produit est vendu via un abonnement, son nom apparaîtra sur les descriptions des éléments de ligne de la facture associée.
  name text,
  -- La description du produit, destinée à être affichée au client. Utilisez ce champ pour stocker, si vous le souhaitez, une explication détaillée du produit vendu pour vos propres besoins d'affichage.
  description text,
  -- L'URL de l'image du produit dans Stripe, destinée à être affichée au client.
  image text,
  -- Ensemble de paires clé-valeur, utilisé pour stocker des informations supplémentaires sur l'objet dans un format structuré.
  metadata jsonb
);
alter table products enable row level security;
create policy "Allow public read-only access." on products for select using (true);

/**
* PRIX
* Remarque : les prix sont créés et gérés dans Stripe et synchronisés dans notre BD via les webhooks de Stripe.
*/
create type pricing_type as enum ('one_time', 'recurring');
create type pricing_plan_interval as enum ('day', 'week', 'month', 'year');
create table prices (
  -- L'identifiant du prix provenant de Stripe, ex. price_1234.
  id text primary key,
  -- L'identifiant du produit auquel ce prix appartient.
  product_id text references products, 
  -- Indique si le prix peut être utilisé pour de nouveaux achats.
  active boolean,
  -- Une brève description du prix.
  description text,
  -- Le montant unitaire sous forme d'entier positif dans la plus petite unité de devise (par exemple, 100 centimes pour 1,00 $ US ou 100 pour 100 ¥, une devise sans décimale).
  unit_amount bigint,
  -- Code de devise ISO à trois lettres, en minuscules.
  currency text check (char_length(currency) = 3),
  -- La valeur 'one_time' (ponctuel) ou 'recurring' (récurrent) selon que ce prix correspond à un achat unique ou à un abonnement récurrent.
  type pricing_type,
  -- La fréquence à laquelle un abonnement est facturé. Soit 'day' (jour), 'week' (semaine), 'month' (mois) ou 'year' (année).
  interval pricing_plan_interval,
  -- Le nombre d'intervalles (spécifié dans l'attribut `interval`) entre les facturations d'abonnement. Par exemple, `interval=month` et `interval_count=3` facture tous les 3 mois.
  interval_count integer,
  -- Le nombre de jours d'essai par défaut lorsqu'on abonne un client à ce prix en utilisant [`trial_from_plan=true`](https://stripe.com/docs/api#create_subscription-trial_from_plan).
  trial_period_days integer,
  -- Ensemble de paires clé-valeur, utilisé pour stocker des informations supplémentaires sur l'objet dans un format structuré.
  metadata jsonb
);
alter table prices enable row level security;
create policy "Allow public read-only access." on prices for select using (true);

/**
* ABONNEMENTS
* Remarque : les abonnements sont créés et gérés dans Stripe et synchronisés dans notre BD via les webhooks de Stripe.
*/
create type subscription_status as enum ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');
create table subscriptions (
  -- L'identifiant d'abonnement de Stripe, ex. sub_1234.
  id text primary key,
  user_id uuid references auth.users not null,
  -- Le statut de l'objet d'abonnement, correspondant à l'un des types de `subscription_status` définis ci-dessus.
  status subscription_status,
  -- Ensemble de paires clé-valeur, utilisé pour stocker des informations supplémentaires sur l'objet dans un format structuré.
  metadata jsonb,
  -- L'identifiant du prix qui a créé cet abonnement.
  price_id text references prices,
  -- La quantité multipliée par le montant unitaire du prix donne le montant de l'abonnement. Peut être utilisé pour faire payer plusieurs places/sièges.
  quantity integer,
  -- Si vrai (true), l'abonnement a été annulé par l'utilisateur et sera supprimé à la fin de la période de facturation.
  cancel_at_period_end boolean,
  -- Heure à laquelle l'abonnement a été créé.
  created timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Début de la période actuelle pour laquelle l'abonnement a été facturé.
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Fin de la période en cours pour laquelle l'abonnement a été facturé. À la fin de cette période, une nouvelle facture sera créée.
  current_period_end timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Si l'abonnement est terminé, l'horodatage de la date de fin de l'abonnement.
  ended_at timestamp with time zone default timezone('utc'::text, now()),
  -- Une date dans le futur à laquelle l'abonnement sera automatiquement annulé.
  cancel_at timestamp with time zone default timezone('utc'::text, now()),
  -- Si l'abonnement a été annulé, la date de cette annulation. Si l'abonnement a été annulé avec `cancel_at_period_end`, `canceled_at` reflétera quand même la date de la demande d'annulation initiale, et non la fin de la période d'abonnement, moment où il passe automatiquement à l'état annulé.
  canceled_at timestamp with time zone default timezone('utc'::text, now()),
  -- Si l'abonnement a un essai (trial), la date de début de cet essai.
  trial_start timestamp with time zone default timezone('utc'::text, now()),
  -- Si l'abonnement a un essai, la date de fin de cet essai.
  trial_end timestamp with time zone default timezone('utc'::text, now())
);
alter table subscriptions enable row level security;
create policy "Can only view own subs data." on subscriptions for select using (auth.uid() = user_id);

/**
 * ABONNEMENTS EN TEMPS RÉEL
 * N'autoriser l'écoute en temps réel que sur les tables publiques.
 */
drop publication if exists supabase_realtime;
create publication supabase_realtime for table products, prices;

/**
 * INDEX DE PERFORMANCE
 * Accélère considérablement les recherches liées aux abonnements et produits.
 */
create index idx_subscriptions_user_id on subscriptions(user_id);
create index idx_subscriptions_price_id on subscriptions(price_id);
create index idx_prices_product_id on prices(product_id);