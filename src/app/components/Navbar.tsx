'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [userSession, setUserSession] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserSession(!!session));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setUserSession(!!session));
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 w-full bg-black bg-opacity-50 backdrop-blur-md text-white px-6 py-4 flex items-center justify-between z-50">
      {/* Left: Logo and nav links */}
      <div className="flex items-center space-x-8">
        <Link href="/" className="text-2xl font-extrabold text-accent-purple drop-shadow-neon">
          GTE
        </Link>
        <nav className="flex space-x-4">
          <Link href="/scores" className="btn-nav text-sm">
            Classement
          </Link>
          <Link href="/achievements" className="btn-nav text-sm">
            Réalisations & succès
          </Link>
          <Link href="/rules" className="btn-nav text-sm">
            Règles
          </Link>
        </nav>
      </div>

      {/* Right: Login/Profile */}
      <Link href={userSession ? '/profile' : '/login'} className="btn-neon text-sm">
        {userSession ? 'Mon profil' : 'Se connecter'}
      </Link>
    </header>
  );
}
