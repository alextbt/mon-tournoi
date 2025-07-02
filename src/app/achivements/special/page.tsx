// src/app/achivements/special/page.tsx
'use client';

import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/lib/supabaseClient';

export default function SpecialAchievementsPage() {
  const [firstName, setFirstName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMessage('Vous devez être connecté pour soumettre une réalisation.');
      return;
    }
    const userId = session.user.id;

    // On écrit désormais dans la table "achievements"
    const { error } = await supabase
      .from('achievements')
      .insert({
        user_id: userId,
        first_name: firstName.trim(),
        description: description.trim(),
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Erreur insertion:', error);
      setMessage('Erreur lors de l’enregistrement. Réessayez.');
    } else {
      setMessage('Réalisation spéciale soumise avec succès !');
      setFirstName('');
      setDescription('');
    }
  };

  return (
    <PageLayout title="Réalisation spéciale">
      <div className="mx-auto w-full sm:w-2/3 lg:w-1/2 px-4 py-12">
        <h1 className="text-3xl font-bold text-white text-center mb-4">
          Soumettre une réalisation spéciale
        </h1>
        {/* Sous-texte explicatif */}
        <p className="text-center text-gray-300 mb-6">
          Cette page vous permet de soumettre toutes vos réalisations spéciales :
          performances exceptionnelles ou défis hors norme. Votre demande sera
          examinée par un administrateur.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#1a130e]/80 p-6 rounded-lg">
          {message && <p className="text-center text-green-300">{message}</p>}
          <div>
            <label htmlFor="firstName" className="block text-white font-semibold mb-2">Prénom</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              placeholder="Votre prénom"
              className="w-full p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-white font-semibold mb-2">Réalisation</label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              placeholder="Décrivez votre performance spéciale"
              rows={5}
              className="w-full p-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
          >
            Soumettre la réalisation
          </button>
        </form>
      </div>
    </PageLayout>
  );
}
