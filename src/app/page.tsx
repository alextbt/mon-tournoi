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
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <main className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 min-h-screen">
      
      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center pt-24 md:pt-32 lg:pt-40 px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white max-w-3xl leading-tight">
          Bienvenue au Grand Tournoi de l’Été
        </h1>
        <p className="mt-4 text-lg md:text-xl text-white/80 max-w-xl mx-auto">
          Deux domaines, un seul grand gagnant !
        </p>
        <p className="mt-2 text-base md:text-lg text-white/70 max-w-md mx-auto">
          Inscrivez-vous et remportez des points à travers des réalisations et succès dans l’eSport et le Sport. Vous pouvez participer uniquement dans l’un ou l’autre, aucune obligation !
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/signup">
            <button className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full shadow-lg transition transform hover:scale-105">
              S’inscrire au tournoi
            </button>
          </Link>
          <Link href="/achivements">
            <button className="px-6 py-3 border-2 border-white/80 text-white/80 hover:text-white hover:border-white rounded-full transition">
              Réalisations et succès
            </button>
          </Link>
          <Link href="/achivements/events">
            <button className="px-6 py-3 border-2 border-white/80 text-white/80 hover:text-white hover:border-white rounded-full transition">
              Événements
            </button>
          </Link>
        </div>

        {/* Secondary CTA */}
        <Link href="/rules">
          <button className="mt-6 px-6 py-2 text-white border-2 border-white/60 hover:border-white hover:text-white rounded-full transition">
            Règles et informations du tournoi
          </button>
        </Link>

        {/* Scroll Cue - inline SVG */}
        <div className="mt-12 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Support Button */}
      <Link href="/issues">
        <button className="fixed bottom-4 left-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg transition">
          Problème ou demande ?
        </button>
      </Link>
    </main>
  );
}
