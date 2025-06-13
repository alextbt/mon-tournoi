'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Définition du type pour le style de profil incluant l'option neutre
type ProfileStyle = 'Aucune modification' | 'Joueur' | 'Sportif';

export default function Signup() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [profileStyle, setProfileStyle] = useState<ProfileStyle>('Aucune modification');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { profile_style: profileStyle }
  }
});

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-md mt-8">
      <h1 className="text-2xl font-semibold mb-4">Créer un compte</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Style de profil */}
        <div>
          <label htmlFor="profileStyle" className="block text-sm font-medium">
            Style de profil
            <span
              className="ml-2 text-gray-500 cursor-help"
              title="Choisir Joueur / Sportif augmente de 25% les points obtenus dans cette catégorie, mais réduit de 50% les points obtenus dans les autres catégories."
            >
              ?
            </span>
          </label>
          <select
            id="profileStyle"
            value={profileStyle}
            onChange={(e) => setProfileStyle(e.target.value as ProfileStyle)}
            className="w-full p-2 border rounded-md"
          >
            <option value="Aucune modification">Aucune modification</option>
            <option value="Joueur">Joueur</option>
            <option value="Sportif">Sportif</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          S&apos;inscrire
        </button>
      </form>
    </div>
  );
}
