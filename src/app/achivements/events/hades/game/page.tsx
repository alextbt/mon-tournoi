// src/app/achivements/events/hades/game/page.tsx
'use client';

import React from 'react';
import { Ubuntu } from 'next/font/google';

const ubuntu = Ubuntu({ subsets: ['latin'], weight: '400' });

export default function HadesGamePage() {
  return (
    <main className="relative min-h-screen">
      {/* Fond infernal identique à la page Hades */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-black to-gray-900" />

      {/* Contenu centré */}
      <div className="relative z-10 flex items-center justify-center h-screen px-4">
        <h1
          className={`${ubuntu.className} text-4xl md:text-5xl lg:text-6xl text-white text-center`}
        >
          L’événement sera disponible à partir du 25 juin.
        </h1>
      </div>
    </main>
  );
}
