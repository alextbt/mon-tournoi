'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [, setUserSession] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(!!session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUserSession(!!session);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <main className="relative overflow-hidden bg-dusk flex items-center justify-center min-h-screen">
      <div className="absolute inset-0 bg-gradient-radial from-accent-purple/20 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 md:px-8 lg:px-16 space-y-8 md:space-y-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white text-center">Bienvenue au Grand Tournoi de l’Été</h1>
          <p className="text-lg text-white-700">
            Deux domaines, un seul grand gagnant !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Link href="/signup">
              <button className="btn-neon w-full sm:w-auto">S’inscrire au tournoi</button>
            </Link>
            <Link href="/achivements">
              <button className="btn-achievements w-full sm:w-auto">
                Réalisations et succès
              </button>
            </Link>
          </div>

          <div className="">
            <Link href="/rules">
              <button className="px-6 py-3 text-lg font-semibold rounded-full border-2 border-accent-pink text-accent-pink hover:bg-accent-pink/10 transition">
                Règles et informations du tournoi
              </button>
            </Link>
          </div>
        </div>
              {/* Nouveau bouton en bas à gauche */}
      <Link href="/issues">
        <button className="fixed bottom-4 left-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg transition neon-red">
          Problème ou demande ?
        </button>
      </Link>
    </main>
  );
}
