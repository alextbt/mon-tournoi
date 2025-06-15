'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [userSession, setUserSession] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) =>
      setUserSession(!!session)
    );
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) =>
      setUserSession(!!session)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // Ferme le menu mobile puis navigue
  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 w-full bg-black bg-opacity-50 backdrop-blur-md text-white px-6 py-4 flex items-center justify-between z-50">
      {/* Left: Logo + Desktop nav */}
      <div className="flex items-center space-x-8">
        <Link href="/" className="text-2xl font-extrabold text-accent-purple drop-shadow-neon">
          GTE | v1.0
        </Link>
        <nav className="hidden md:flex space-x-4">
          <Link href="/scores" className="btn-nav text-sm">Classement</Link>
          <Link href="/achivements" className="btn-nav text-sm">Réalisations & succès</Link>
          <Link href="/rules" className="btn-nav text-sm">Règles</Link>
          <Link href="/roadmap" className="btn-nav text-sm">Roadmap</Link>
          <Link href="https://discord.gg/mFwggMsqPx" className="btn-nav text-sm">Discord</Link>
        </nav>
      </div>

      {/* Right: Desktop profile/login + Mobile hamburger */}
      <div className="flex items-center">
        <Link
          href={userSession ? '/profile' : '/login'}
          className="btn-neon text-sm hidden md:inline-block"
        >
          {userSession ? 'Mon profil' : 'Se connecter'}
        </Link>

        <button
          onClick={() => setMenuOpen(open => !open)}
          className="md:hidden ml-2 p-2 rounded focus:outline-none"
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black bg-opacity-50 backdrop-blur-md py-4 z-40">
          <div className="flex flex-col items-start px-6 space-y-3">
            <Link href="/scores" className="btn-nav text-sm block" onClick={handleNavClick}>
              Classement
            </Link>
            <Link href="/achivements" className="btn-nav text-sm block" onClick={handleNavClick}>
              Réalisations & succès
            </Link>
            <Link href="/rules" className="btn-nav text-sm block" onClick={handleNavClick}>
              Règles
            </Link>
            <Link href="/roadmap" className="btn-nav text-sm block" onClick={handleNavClick}>
              Roadmap
            </Link>
            <Link href="https://discord.gg/mFwggMsqPx" className="btn-nav text-sm block" onClick={handleNavClick}>
              Discord
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
