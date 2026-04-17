-- Création du bucket 'avatars' s'il n'existe pas
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Politique de sécurité : Tout le monde peut lire les avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Politique de sécurité : Seuls les utilisateurs authentifiés peuvent uploader
create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
