import { sanityClient } from '@/utils/sanity/client';
import Link from 'next/link';

export const revalidate = 60; // ISR validation time

const query = `*[_type == "post"] | order(publishedAt desc) { _id, title, slug, excerpt }`;

export default async function BlogPage() {
  // If sanity is not fully set up with a real ID, we catch the error and show empty list
  const posts = await sanityClient.fetch(query).catch(() => []);

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="text-4xl font-extrabold text-white text-center">Le Blog SaaS</h1>
      <p className="text-zinc-400 text-center mt-4 mb-12">Propulsé par Sanity CMS</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 ? (
          <div className="col-span-full text-center p-12 border border-zinc-800 rounded-xl bg-[#0a0a0a]">
            <p className="text-zinc-400">
               Aucun article publié pour le moment. Une fois votre `NEXT_PUBLIC_SANITY_PROJECT_ID` configuré, vos articles s'afficheront ici.
            </p>
          </div>
        ) : (
          posts.map((post: any) => (
             <Link key={post._id} href={`/blog/${post.slug.current}`} className="block">
               <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-xl hover:border-cyan-500 hover:shadow-neon transition-all h-full">
                  <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                  <p className="text-zinc-500">{post.excerpt}</p>
               </div>
             </Link>
          ))
        )}
      </div>
    </div>
  );
}
