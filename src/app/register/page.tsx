'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Register() {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Vérifie que le nom est rempli
  if (!name.trim()) {
    alert("Le nom est requis !");
    return;
  }

  // Envoi vers Supabase
  const { error } = await supabase.from('players').insert([
    {
      name,
      team,
    },
  ]);

  if (error) {
    console.error('Erreur Supabase :', error.message);
    alert("Une erreur s'est produite lors de l'inscription.");
  } else {
    alert("Inscription réussie !");
    setName('');
    setTeam('');
  }
};


  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-purple-100 p-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Inscription au tournoi</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4 w-full max-w-sm">
        <div>
          <label className="block text-gray-700">Nom</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded text-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Équipe (optionnel)</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded text-black"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">S’inscrire</button>
      </form>
    </main>
  );
}
