// src/app/achivements/events/page.tsx
'use client';

import Link from 'next/link';

export default function EventsPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Fond lever de soleil */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-purple-400 to-purple-600" />
      <div className="relative max-w-4xl mx-auto px-4 py-20 text-center space-y-12">
        <h1 className="text-5xl font-extrabold text-violet-600">Événements à durée limitée</h1>
        <p className="text-lg text-violet-500 px-6">
          Cette page est dédiée aux événements limités, qui peuvent toucher à tout et n&apos;importe quoi. La participation dans ces événements rapporte des points, avantages, indices et autres. Vous n&apos;êtes pas obligés de participer au moindre de ces événements. Et bien sûr, ces événements sont limités : faites attention aux dates et horaires de fin de l&apos;événement !
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 justify-center">
          {/* Néon naturel & verdâtre */}
          <div className="flex flex-col items-center space-y-2">
            <Link
              href="/achivements/events/steps"
              className="inline-flex items-center justify-center w-56 h-48 rounded-xl bg-green-500 text-white font-semibold text-xl transition shadow-[0_0_20px_rgba(72,187,120,0.9)] hover:shadow-[0_0_40px_rgba(72,187,120,1)]"
            >
              Un grand pas pour l&apos;humanité !
            </Link>
            <p className="text-md text-green-600">Marchez et gagnez des points !</p>
            <p className="text-md text-green-700">Événement disponible jusqu&apos;au <strong>8 juillet !</strong></p>
          </div>
          {/* Néon infernal, rouge et noir */}
          <div className="flex flex-col items-center space-y-2">
            <Link
              href="/achivements/events/hades"
              className="inline-flex items-center justify-center w-56 h-48 rounded-xl bg-gradient-to-br from-red-900 to-black text-white font-semibold text-xl transition shadow-[0_0_20px_rgba(220,38,38,0.9)] hover:shadow-[0_0_40px_rgba(220,38,38,1)]"
            >
              Bienvenue dans les Enfers
            </Link>
            <p className="text-md text-red-600">Remontez les Enfers et gagnez des points dans Hadès !</p>
            <p className="text-md text-red-700">Événement disponible à partir du <strong>3 juillet !</strong></p>
          </div>
          {/* Néon mystique, bleuté */}
          <div className="flex flex-col items-center space-y-2">
            <Link
              href="/achivements/events/sanctuary"
              className="inline-flex items-center justify-center w-56 h-48 rounded-xl bg-blue-700 text-white font-semibold text-xl transition shadow-[0_0_20px_rgba(59,130,246,0.9)] hover:shadow-[0_0_40px_rgba(59,130,246,1)]"
            >
              Le Sanctuaire
            </Link>
            <p className="text-md text-blue-600">Effectuez des défis spéciaux quotidiens et venez tentez votre chance au Sanctuaire !</p>
            <p className="text-md text-blue-700">Événement disponible jusqu&apos;au <strong>30 juillet !</strong></p>
          </div>
        </div>
      </div>
    </main>
  );
}
