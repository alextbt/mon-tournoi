'use client';  // Assure-toi que ce composant est exécuté côté client

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Vérification des champs
    if (!username || !password) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    try {
      // Récupérer l'utilisateur de la base de données
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('name', username)  // Rechercher l'utilisateur par le 'name'
        .single();  // On s'attend à un seul utilisateur

      console.log('Utilisateur trouvé :', data);  // Afficher les données de l'utilisateur pour vérification

      if (error) {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
        console.error('Erreur Supabase:', error);  // Afficher l'erreur Supabase
        return;
      }

      // Comparer le mot de passe haché avec celui saisi par l'utilisateur
      const isPasswordCorrect = await bcrypt.compare(password, data.password);

      console.log('Mot de passe correct :', isPasswordCorrect);  // Afficher si le mot de passe est correct

      if (!isPasswordCorrect) {
        setError('Mot de passe incorrect');
        return;
      }

      setSuccess('Connexion réussie!');
      window.location.href = '/profile';  // Rediriger l'utilisateur vers sa page de profil

    } catch (error) {
      console.error('Erreur générale:', error);
      setError('Une erreur s\'est produite, veuillez réessayer.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded-md shadow-md">
      <h2 className="text-2xl font-semibold text-center">Connexion</h2>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nom d'utilisateur"
            className="mt-2 p-2 w-full border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="mt-2 p-2 w-full border rounded-md"
            required
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}

        <button
          type="submit"
          className="mt-4 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
};

export default Login;
