'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="relative bg-purple-700 text-white px-4 py-3 shadow-md flex items-center justify-between">
      {/* Bouton retour (si pas sur la page d'accueil) */}
      {!isHome ? (
        <Link href="#" onClick={() => history.back()}>
          <button className="bg-purple-100 text-purple-800 px-3 py-1 rounded hover:bg-purple-200 transition text-sm sm:text-base">
            ← Retour
          </button>
        </Link>
      ) : (
        <div className="w-[90px]" /> // Espace réservé pour équilibrer
      )}

      {/* GTE centré sauf sur petits écrans avec les deux boutons */}
      <div className="absolute left-1/2 transform -translate-x-1/2 max-sm:hidden">
        <Link href="/" className="text-2xl font-extrabold tracking-wide">
          GTE
        </Link>
      </div>

      {/* Bouton classement à droite */}
      <Link href="/scores">
        <button className="bg-white text-purple-700 font-semibold px-4 py-2 rounded hover:bg-purple-100 transition text-sm sm:text-base">
          📊 Classement
        </button>
      </Link>
    </header>
  );
}
