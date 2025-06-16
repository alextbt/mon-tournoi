// src/app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type ProfileStyle = 'Aucune modification' | 'Joueur' | 'Sportif';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileStyle, setProfileStyle] = useState<ProfileStyle>('Aucune modification');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1) Création du compte
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, profile_style: profileStyle },
      },
    });

    if (signUpError) {
      setErrorMessage(signUpError.message);
      return;
    }

    // 2) INSÉRER dans profiles si data.user.id est défini
    const userId = data.user?.id;
    const userEmail = data.user?.email;
    if (userId && userEmail) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: userEmail,
            first_name: firstName,
            profile_style: profileStyle,
          },
        ]);
      if (profileError) {
        console.error('Erreur insert profiles:', profileError.message);
      }
    } else {
      console.warn('SignUp réussi mais pas de user.id/email retourné.');
    }

    // 3) Redirection
    router.push('/login');
  };

  return (
    <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-2">
          Rejoignez le Grand Tournoi de l’Été
        </h1>
        <p className="text-lg text-white/90 mb-12">
          Inscrivez-vous pour commencer à accumuler des points et relever des défis !
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Formulaire */}
          <div className="p-8 space-y-6">
            {errorMessage && (
              <p className="text-red-500 text-center">{errorMessage}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prénom / Pseudo */}
              <div>
                <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-700">
                  Prénom / Pseudo
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Ex : Alex"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-700"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="exemple@mail.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-700"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-700"
                />
              </div>

              {/* Style de profil */}
              <div>
                <label htmlFor="profileStyle" className="block mb-1 text-sm font-medium text-gray-700">
                  Style de profil
                  <span
                    className="ml-1 cursor-help text-gray-400"
                    title="Joueur : +25% points Jeux, -25% points Sport. Sportif : +25% points Sports, -50% points Jeux."
                  >?</span>
                </label>
                <select
                  id="profileStyle"
                  value={profileStyle}
                  onChange={(e) => setProfileStyle(e.target.value as ProfileStyle)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-700"
                >
                  <option value="Aucune modification">Aucune modification</option>
                  <option value="Joueur">Joueur</option>
                  <option value="Sportif">Sportif</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>

          {/* Bloc descriptif */}
          <div className="p-8 bg-gray-50 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Pourquoi s’inscrire ?
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li>✔ Accès à votre profil personnalisé</li>
              <li>✔ Enregistrement de vos réalisations et succès</li>
              <li>✔ Classement en temps réel et challenges</li>
              <li>✔ Bonus hebdomadaires à venir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
