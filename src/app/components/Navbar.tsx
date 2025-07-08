"use client";

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import '@/styles/navbar-3d-menu.css';

export default function Navbar() {
  const [userSession, setUserSession] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [achieveOpen, setAchieveOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const achieveRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  // Init session state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserSession(!!session));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setUserSession(!!session));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (achieveRef.current && !achieveRef.current.contains(e.target as Node)) {
        setAchieveOpen(false);
      }
      if (eventsRef.current && !eventsRef.current.contains(e.target as Node)) {
        setEventsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggleAchieve = () => {
    setAchieveOpen(open => !open);
    if (eventsOpen) setEventsOpen(false);
  };
  const toggleEvents = () => {
    setEventsOpen(open => !open);
    if (achieveOpen) setAchieveOpen(false);
  };

  const handleNavClick = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 w-full bg-opacity-20 backdrop-blur-md text-white px-4 py-2 flex items-center justify-between z-50">
      {/* Logo néon */}
      <Link href="/" className="title neon-logo text-xl font-bold">
        GTE | v1.3
      </Link>

      {/* Desktop navigation */}
      <nav className="hidden md:flex space-x-6 items-center">
        {/* Direct link */}
        <Link
          href="/scores"
          className="relative text-sm font-medium before:absolute before:-bottom-0.5 before:left-0 before:h-0.5 before:w-0 before:bg-white before:transition-all before:duration-200 hover:before:w-full"
        >
          Classement
        </Link>

        {/* Dropdown: Réalisations & succès */}
        <div className="relative" ref={achieveRef}>
          <button
            onClick={toggleAchieve}
            className="relative text-sm font-medium before:absolute before:-bottom-0.5 before:left-0 before:h-0.5 before:w-0 before:bg-white before:transition-all before:duration-200 hover:before:w-full"
          >
            Réalisations & succès
          </button>
          {achieveOpen && (
            <div className="absolute mt-2 rounded-lg py-2 w-56 bg-black/70 backdrop-blur-md border border-gray-800 shadow-lg text-white">
              <div className="px-4 text-xs text-gray-200 uppercase">eSport</div>
              <Link href="/achivements/gaming/lol" className="block px-4 py-1 hover:bg-white/20" onClick={toggleAchieve}>
                League of Legends
              </Link>
              <Link href="/achivements/gaming/valorant" className="block px-4 py-1 hover:bg-white/20" onClick={toggleAchieve}>
                Valorant
              </Link>
              <Link href="/achivements/gaming/chess" className="block px-4 py-1 hover:bg-white/20" onClick={toggleAchieve}>
                Échecs
              </Link>
              <div className="border-t border-white/30 my-1" />
              <div className="px-4 text-xs text-gray-200 uppercase">Sport</div>
              <Link href="/achivements/sport/musculation" className="block px-4 py-1 hover:bg-white/20" onClick={toggleAchieve}>
                Musculation
              </Link>
              <Link href="/achivements/sport/escalade" className="block px-4 py-1 hover:bg-white/20" onClick={toggleAchieve}>
                Escalade
              </Link>
              <Link href="/achivements/sport/cyclisme" className="block px-4 py-1 hover:bg-white/20" onClick={toggleAchieve}>
                Cyclisme
              </Link>
              <Link href="/achivements/sport/course" className="block px-4 py-1 hover:bg-white/20" onClick={toggleAchieve}>
                Course
              </Link>
            </div>
          )}
        </div>

        {/* Direct link */}
        <Link
          href="/achivements/special"
          className="relative text-sm font-medium before:absolute before:-bottom-0.5 before:left-0 before:h-0.5 before:w-0 before:bg-white before:transition-all before:duration-200 hover:before:w-full"
        >
          Réalisations spéciales
        </Link>

        {/* Dropdown: Events */}
        <div className="relative" ref={eventsRef}>
          <button
            onClick={toggleEvents}
            className="relative text-sm font-medium before:absolute before:-bottom-0.5 before:left-0 before:h-0.5 before:w-0 before:bg-white before:transition-all before:duration-200 hover:before:w-full"
          >
            Events
          </button>
          {eventsOpen && (
            <div className="absolute mt-2 rounded-lg py-2 w-56 bg-black/70 backdrop-blur-md border border-gray-800 shadow-lg text-white">
              <Link href="/achivements/events/steps" className="block px-4 py-1 hover:bg-white/20" onClick={toggleEvents}>
                Un grand pas pour l’humanité !
              </Link>
              <Link href="/achivements/events/hades" className="block px-4 py-1 hover:bg-white/20" onClick={toggleEvents}>
                Hadès
              </Link>
              <Link href="/achivements/events/sanctuary" className="block px-4 py-1 hover:bg-white/20" onClick={toggleEvents}>
                Le Sanctuaire
              </Link>
              <Link href="/achivements/events/spearofjustice" className="block px-4 py-1 hover:bg-white/20" onClick={toggleEvents}>
                Spear of Justice
              </Link>
              <Link href="/achivements/events/megalovania" className="block px-4 py-1 hover:bg-white/20" onClick={toggleEvents}>
                Megalovania
              </Link>
            </div>
          )}
        </div>

        {/* Direct links */}
        <Link
          href="/rules"
          className="relative text-sm font-medium before:absolute before:-bottom-0.5 before:left-0 before:h-0.5 before:w-0 before:bg-white before:transition-all before:duration-200 hover:before:w-full"
        >
          Règles
        </Link>
        <Link
          href="/roadmap"
          className="relative text-sm font-medium before:absolute before:-bottom-0.5 before:left-0 before:h-0.5 before:w-0 before:bg-white before:transition-all before:duration-200 hover:before:w-full"
        >
          Roadmap
        </Link>
        <Link
          href="/issues"
          className="relative text-sm font-medium before:absolute before:-bottom-0.5 before:left-0 before:h-0.5 before:w-0 before:bg-white before:transition-all before:duration-200 hover:before:w-full"
        >
          Aide
        </Link>
      </nav>

      {/* Profile & Mobile Toggle */}
      <div className="flex items-center space-x-2">
        <Link
          href={userSession ? '/profile' : '/login'}
          className="btn-neon px-4 py-1 text-sm hidden md:inline-block"
        >
          {userSession ? 'Mon profil' : 'Se connecter'}
        </Link>
        <button
          onClick={() => setMenuOpen(o => !o)}
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
            {['/scores','/achivements/gaming/lol','/achivements/gaming/valorant','/achivements/gaming/chess','/achivements/sport/musculation','/achivements/sport/escalade','/achivements/sport/cyclisme','/achivements/sport/course','/achivements/special','/achivements/events','/rules','/roadmap','/issues'].map(path => (
              <Link key={path} href={path} className="btn-nav text-sm block" onClick={handleNavClick}>
                {path.substring(path.lastIndexOf('/')+1).replace(/achivements|gaming\/|sport\//g, '').replace(/-/g, ' ').toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
