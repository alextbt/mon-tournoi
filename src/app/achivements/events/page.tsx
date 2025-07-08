// src/app/achivements/events/page.tsx
'use client';

import Link from 'next/link';

export default function EventsPage() {
  // on pourrait extraire ces données plus haut, ou depuis l’API
  const EVENTS = [
    {
      id: 'moonwalk',
      href: '/achivements/events/steps',
      title: "Un grand pas pour l'humanité !",
      desc: 'Marchez et gagnez des points !',
      deadline: '8 juillet',
      color: 'green',
    },
    {
      id: 'hades',
      href: '/achivements/events/hades',
      title: 'Bienvenue dans les Enfers',
      desc: 'Remontez les Enfers et gagnez des points dans Hadès !',
      deadline: '24 juillet',
      color: 'red',
    },
    {
      id: 'sanctuary',
      href: '/achivements/events/sanctuary',
      title: 'Le Sanctuaire',
      desc: 'Effectuez des défis spéciaux quotidiens et tentez votre chance !',
      deadline: '30 juillet',
      color: 'blue',
    },
    {
      id: 'spear',
      href: '/achivements/events/spearofjustice',
      title: 'Spear of Justice',
      desc: 'Déviez les flèches à l’infini pour remporter des points !',
      deadline: '21 juillet',
      color: 'green',
    },
    {
      id: 'megalovania',
      href: '/achivements/events/megalovania',
      title: 'Megalovania',
      desc: 'Battez Sans dans un combat complexe et gagnez des points !',
      deadline: '28 juillet',
      color: 'blue',
    },
  ];

return (
  <main className="relative min-h-screen overflow-x-hidden">
    {/* Fond dégradé */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-purple-400 to-purple-600" />

    {/* Container centré */}
    <div className="relative max-w-4xl mx-auto px-4 py-20">
      {/* Card glassmorphism renforcée */}
      <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl p-12 space-y-12">

        {/* Titre & description */}
        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-extrabold text-violet-600 drop-shadow-md">
            Événements à durée limitée
          </h1>
          <p className="text-lg text-white px-6">
            Cette page est dédiée aux événements limités, qui peuvent toucher à tout et n&apos;importe quoi. La participation dans ces événements rapporte des points, avantages, indices et autres. Vous n&apos;êtes pas obligés de participer au moindre de ces événements. Et bien sûr, ces événements sont limités : faites attention aux dates et horaires de fin de l&apos;événement !
          </p>
        </div>

        {/* Grille d’événements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {EVENTS.map(ev => (
            <div key={ev.id} className="flex flex-col items-center space-y-4">

              {/* Carte événement */}
              <Link
                href={ev.href}
                className={`
                  w-56 h-48 rounded-xl
                  bg-white/30 backdrop-blur-lg
                  border-l-4 border-${ev.color}-500
                  shadow-lg transition hover:bg-white/40
                `}
              >
                <div className="flex items-center justify-center h-full">
                  <span className={`text-xl font-semibold text-${ev.color}-600 drop-shadow-sm`}>
                    {ev.title}
                  </span>
                </div>
              </Link>

              {/* Légendes */}
              <div className="space-y-1 text-center">
                <p className="text-md text-white">{ev.desc}</p>
                <p className="text-md text-violet-800">
                  Disponible jusqu’au{' '}
                  <strong className="text-violet-900">{ev.deadline}</strong>
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  </main>
);
}