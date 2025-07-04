'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [userSession, setUserSession] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [achieveOpen, setAchieveOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const achieveRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) =>
      setUserSession(!!session)
    );
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) =>
      setUserSession(!!session)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (achieveRef.current && !achieveRef.current.contains(e.target as Node)) {
        setAchieveOpen(false);
      }
      if (eventsRef.current && !eventsRef.current.contains(e.target as Node)) {
        setEventsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  const toggleAchieve = () => {
    setAchieveOpen(o => !o);
    if (eventsOpen) setEventsOpen(false);
  };
  const toggleEvents = () => {
    setEventsOpen(o => !o);
    if (achieveOpen) setAchieveOpen(false);
  };

  return (
    <header className="sticky top-0 w-full bg-black bg-opacity-50 backdrop-blur-md text-white px-6 py-4 flex items-center justify-between z-50">
      <div className="flex items-center space-x-8">
        <Link href="/" className="title">
          GTE | v1.2
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-4 items-center">
          <Link href="/scores" className="btn-nav text-sm">Classement</Link>
          <div className="relative" ref={achieveRef}>
            <button
              onClick={toggleAchieve}
              className="btn-nav text-sm flex items-center"
            >
              Réalisations & succès
              <span className="ml-1">▾</span>
            </button>
            {achieveOpen && (
              <div className="absolute mt-2 bg-black bg-opacity-50 backdrop-blur-md rounded-lg py-2 w-48">
                <div className="px-2 text-xs text-gray-400 uppercase">eSport</div>
                <Link href="/achivements/gaming/lol" className="block px-4 py-1 hover:bg-bg-light text-amber-400" onClick={() => setAchieveOpen(false)}>
                  League of Legends
                </Link>
                <Link href="/achivements/gaming/valorant" className="block px-4 py-1 hover:bg-bg-light text-red-600" onClick={() => setAchieveOpen(false)}>
                  Valorant
                </Link>
                <Link href="/achivements/gaming/chess" className="block px-4 py-1 hover:bg-bg-light text-white" onClick={() => setAchieveOpen(false)}>
                  Échecs
                </Link>
                <div className="border-t border-gray-700 my-1"></div>
                <div className="px-2 text-xs text-gray-400 uppercase">Sport</div>
                <Link href="/achivements/sport/musculation" className="block px-4 py-1 hover:bg-bg-light text-cyan-100" onClick={() => setAchieveOpen(false)}>
                  Musculation
                </Link>
                <Link href="/achivements/sport/escalade" className="block px-4 py-1 hover:bg-bg-light text-fuchsia-700" onClick={() => setAchieveOpen(false)}>
                  Escalade
                </Link>
                <Link href="/achivements/sport/cyclisme" className="block px-4 py-1 hover:bg-bg-light text-stone-300" onClick={() => setAchieveOpen(false)}>
                  Cyclisme
                </Link>
                <Link href="/achivements/sport/course" className="block px-4 py-1 hover:bg-bg-light text-emerald-600" onClick={() => setAchieveOpen(false)}>
                  Course
                </Link>
              </div>
            )}
          </div>
          <Link href="/achivements/special" className="btn-nav text-sm">Réalisations spéciales</Link>
          <div className="relative" ref={eventsRef}>
            <button
              onClick={toggleEvents}
              className="btn-nav-event text-sm flex items-center"
            >
              Events
              <span className="ml-1">▾</span>
            </button>
            {eventsOpen && (
              <div className="absolute mt-2 bg-black bg-opacity-50 backdrop-blur-md rounded-lg py-2 w-48">
                <Link href="/achivements/events/steps" className="block px-4 py-1 hover:bg-bg-light text-green-600" onClick={() => setEventsOpen(false)}>
                  Un grand pas pour l&apos;humanité !
                </Link>
                <Link href="/achivements/events/hades" className="block px-4 py-1 hover:bg-bg-light text-red-700" onClick={() => setEventsOpen(false)}>
                  Hadès
                </Link>
                <Link href="/achivements/events/sanctuary" className="block px-4 py-1 hover:bg-bg-light text-blue-600" onClick={() => setEventsOpen(false)}>
                  Le Sanctuaire
                </Link>
                <Link href="/achivements/events/spearofjustice" className="block px-4 py-1 hover:bg-bg-light text-green-500" onClick={() => setEventsOpen(false)}>
                  Spear of Justice
                </Link>
                <Link href="/achivements/events/megalovania" className="block px-4 py-1 hover:bg-bg-light text-white" onClick={() => setEventsOpen(false)}>
                  Megalovania
                </Link>
              </div>
            )}
          </div>
          <Link href="/rules" className="btn-nav text-sm">Règles</Link>
          <Link href="/roadmap" className="btn-nav text-sm">Roadmap</Link>
          <Link href="/issues" className="btn-nav text-sm">Aide</Link>
        </nav>
      </div>
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
            <Link href="/achivements/gaming/lol" className="btn-nav text-sm block" onClick={handleNavClick}>
              League of Legends
            </Link>
            <Link href="/achivements/gaming/valorant" className="btn-nav text-sm block" onClick={handleNavClick}>
              Valorant
            </Link>
            <Link href="/achivements/gaming/chess" className="btn-nav text-sm block" onClick={handleNavClick}>
              Échecs
            </Link>
            <Link href="/achivements/sport/musculation" className="btn-nav text-sm block" onClick={handleNavClick}>
              Musculation
            </Link>
            <Link href="/achivements/sport/escalade" className="btn-nav text-sm block" onClick={handleNavClick}>
              Escalade
            </Link>
            <Link href="/achivements/sport/cyclisme" className="btn-nav text-sm block" onClick={handleNavClick}>
              Cyclisme
            </Link>
            <Link href="/achivements/sport/course" className="btn-nav text-sm block" onClick={handleNavClick}>
              Course
            </Link>
            <Link href="/achivements/special" className="btn-nav text-sm block" onClick={handleNavClick}>
              Réalisations spéciales
            </Link>
            <Link href="/achivements/events" className="btn-nav text-sm block" onClick={handleNavClick}>
              Events
            </Link>
            <Link href="/rules" className="btn-nav text-sm block" onClick={handleNavClick}>
              Règles
            </Link>
            <Link href="/roadmap" className="btn-nav text-sm block" onClick={handleNavClick}>
              Roadmap
            </Link>
            <Link href="/issues" className="btn-nav text-sm block" onClick={handleNavClick}>
              Aide
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
