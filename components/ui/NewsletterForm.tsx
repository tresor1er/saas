'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to subscribe');
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="my-10 w-full max-w-lg mx-auto bg-black border border-zinc-800 p-8 rounded-xl text-center">
      <h3 className="text-2xl font-bold text-white mb-2">Restez Informé</h3>
      <p className="text-zinc-400 mb-6">Rejoignez notre newsletter propulsée par Loops.</p>
      <form onSubmit={subscribe} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="Entrez votre email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-md bg-[#0a0a0a] border border-zinc-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
        />
        <Button type="submit" loading={status === 'loading'} className="whitespace-nowrap px-6">
          {status === 'success' ? 'Inscrit !' : 'S\'inscrire'}
        </Button>
      </form>
      {status === 'error' && <p className="text-red-500 text-sm mt-4">Erreur lors de l'inscription.</p>}
    </div>
  );
}
