// src/app/issues/page.tsx (IssuesPage)

'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/lib/supabaseClient';

export default function IssuesPage() {
  const [issueType, setIssueType] = useState<'Problème' | 'Idées ou modifications'>('Problème');
  const [description, setDescription] = useState('');
  const maxLength = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    // Insérer la demande dans la table dédiée
    await supabase.from('issues').insert({
      user_id: session.user.id,
      type: issueType,
      description,
    });
    setIssueType('Problème');
    setDescription('');
  };

  return (
    <PageLayout bgClass="bg-gradient-to-br from-red-900 via-red-800 to-red-900" title={''}>
      <div className="fixed inset-0 flex items-center justify-center bg-red-900/60">
        <form
          onSubmit={handleSubmit}
          className="w-11/12 max-w-4xl max-h-[95vh] bg-red-800 bg-opacity-75 p-12 rounded-lg shadow-lg flex flex-col justify-between"
        >
          <h2 className="text-2xl text-white font-bold mb-6 text-center">Signaler un problème ou suggérer une idée.</h2>
          <div className="mb-8">
            <label className="block text-white mb-2">Type</label>
            <select
              value={issueType}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={e => setIssueType(e.target.value as any)}
              className="w-full p-3 rounded bg-red-900 text-white"
            >
              <option>Problème</option>
              <option>Idées ou modifications</option>
            </select>
          </div>
          <div className="flex-1 mb-8">
            <label className="block text-white mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={maxLength}
              rows={10}
              className="w-full h-full p-3 rounded bg-red-900 text-white focus:outline-none resize-none"
            />
            <p className="text-white/70 text-sm mt-2">{description.length}/{maxLength} caractères</p>
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-white text-red-700 rounded font-semibold hover:bg-white/90 transition"
          >
            Envoyer
          </button>
          <h3>Vous devez être connecté pour formuler une demande.</h3>
        </form>
      </div>
    </PageLayout>
  );
}
