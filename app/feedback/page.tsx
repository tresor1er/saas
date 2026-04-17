export default function FeedbackPage() {
  return (
    <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="text-4xl font-extrabold text-white mb-4">Roadmap & Idées</h1>
      <p className="text-zinc-400 text-lg mb-8">
        Proposez vos fonctionnalités et votez pour la roadmap publique (Propulsé par Canny).
      </p>
      
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-8 h-[600px] flex items-center justify-center">
         <div className="text-center">
             <p className="text-zinc-500 mb-4">
                 Une fois votre `BoardToken` ajouté, le widget de vote interactif Canny remplacera ce bloc.
             </p>
             <div className="inline-block px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-md">
                 data-canny=true
             </div>
         </div>
      </div>
    </div>
  );
}
