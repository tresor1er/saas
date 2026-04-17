import { sanityClient } from '@/utils/sanity/client';
import { notFound } from 'next/navigation';

export const revalidate = 60;

const query = `*[_type == "post" && slug.current == $slug][0]`;

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await sanityClient.fetch(query, { slug: params.slug }).catch(() => null);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">{post.title}</h1>
      <div className="prose prose-invert lg:prose-xl">
        <p className="text-zinc-300">
           {/* Rendu fictif pour la démo - Normalement ici on utilise <PortableText value={post.body} /> */}
           Ceci est le contenu principal de l'article. Pour un rendu complet du riche texte Markdown/Sanity, intégrez la librairie `@portabletext/react`.
        </p>
      </div>
    </article>
  );
}
