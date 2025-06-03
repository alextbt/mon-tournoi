'use client';  // Ajoute cette ligne en haut du fichier

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);

  // Vérification simple des champs vides
  if (!username || !password) {
    setError("Tous les champs sont obligatoires");
    return;
  }

  try {
    // Insérer les informations dans la table Players
    const { data, error } = await supabase
      .from('players')
      .insert([
        { name: username, password }  // Remplace 'username' par 'name'
      ]);

    if (error) throw error;
    
    // Si l'inscription est réussie, redirige vers la page de login ou affiche un message de succès
    setSuccess('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
    setUsername('');
    setPassword('');
  } catch (error) {
    setError(error.message);
  }
};

  return (
    <div>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}
        <button type="submit">Créer un compte</button>
      </form>
    </div>
  );
};

export default SignUp;
