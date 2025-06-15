// src/app/achivements/page.tsx
'use client';

import Link from 'next/link';

export default function AchivementsPage() {
  return (
    <main className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      {/* eSport panel */}
      <Link
        href="/achivements/gaming"
        className="flex-1 flex items-center justify-center bg-blue-900"
      >
        <div
          className="
            px-16 py-12 md:px-20 md:py-16 lg:px-24 lg:py-20
            text-5xl md:text-7xl lg:text-8xl font-extrabold text-white rounded-md
            bg-gradient-to-r from-cyan-400 to-blue-600
            shadow-[0_0_12px_rgba(0,200,255,0.7),0_0_30px_rgba(0,200,255,0.5)]
            hover:shadow-[0_0_30px_rgba(0,200,255,0.8),0_0_60px_rgba(0,200,255,0.6)]
            transition-shadow duration-300
          "
        >
          eSport
        </div>
      </Link>

      {/* Sport panel */}
      <Link
        href="/achivements/sport"
        className="flex-1 flex items-center justify-center bg-green-900"
      >
        <div
          className="
            px-16 py-12 md:px-20 md:py-16 lg:px-24 lg:py-20
            text-5xl md:text-7xl lg:text-8xl font-extrabold text-white rounded-md
            bg-gradient-to-r from-green-400 to-green-600
            shadow-[0_0_12px_rgba(72,255,120,0.7),0_0_30px_rgba(72,255,120,0.5)]
            hover:shadow-[0_0_30px_rgba(72,255,120,0.8),0_0_60px_rgba(72,255,120,0.6)]
            transition-shadow duration-300
          "
        >
          Sport
        </div>
      </Link>
    </main>
  );
}
