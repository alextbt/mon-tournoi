'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.push('/profile');
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-2">
          Connexion
        </h1>
        <p className="text-lg text-white/90 mb-12">
          Connectez-vous pour accéder à votre profil, suivre vos points et relever de nouveaux défis !
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Formulaire de connexion */}
          <div className="p-8 space-y-6">
            {errorMessage && (
              <p className="text-red-500 text-center">{errorMessage}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="exemple@mail.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Bouton et lien vers inscription */}
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                >
                  Se connecter
                </button>
                <Link
                  href="/signup"
                  className="text-purple-600 hover:underline text-sm"
                >
                  Créer un compte
                </Link>
              </div>
            </form>
          </div>

          {/* Bloc avantages */}
          <div className="p-8 bg-gray-50 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Un problème de connexion ? Un mot de passe oublié ?
            </h2>
            <ul className="space-y-3 text-gray-700 text-left">
              <li>N&apos;hésitez pas à demander de l&apos;aide sur le Discord dédié.</li>
              <li>✔ Suivi de vos points et réalisations</li>
              <li>✔ Classement en temps réel</li>
              <li>✔ Défis et succès exclusifs</li>
              <li>✔ À venir : bonus hebdomadaires et plus encore</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
