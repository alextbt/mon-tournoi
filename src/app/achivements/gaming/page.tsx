// src/app/achivements/gaming/page.tsx
'use client';

import Link from 'next/link';
import PageLayout from '@/components/PageLayout';

type Game = {
  name: string;
  slug: string;
  bg: string;
  difficulty: string;
  totalPoints: number;
  successCount: number;
};

const GAMES: Game[] = [
  {
    name: 'League of Legends',
    slug: 'lol',
    bg: 'https://i.ytimg.com/vi/CsApDyIo80c/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLASAhIf2z9cbeH5v-nHCeRYx8ucbQ',
    difficulty: 'Moyen',
    totalPoints: 2427,     // <— défini manuellement
    successCount: 55,     // <— défini manuellement
  },
  {
    name: 'Valorant',
    slug: 'valorant',
    bg: 'https://preview.redd.it/buzyn25jzr761.png?width=1000&format=png&auto=webp&s=c8a55973b52a27e003269914ed1a883849ce4bdc',
    difficulty: 'Facile',
    totalPoints: 0,     // <— défini manuellement
    successCount: 0,     // <— défini manuellement
  },
];

export default function GamingHub() {
  return (
    <PageLayout title="Jeux vidéo – Succès">
      <div className="w-full px-4 py-12">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-8">
          {GAMES.map((game) => {
            // anneau + accent couleur par jeu
            const ringColor = game.slug === 'lol' ? 'ring-yellow-400' : 'ring-red-500';
            const accentText = game.slug === 'lol' ? 'text-yellow-300' : 'text-red-300';

            return (
              <Link
                key={game.slug}
                href={`/achivements/gaming/${game.slug}`}
                className="block"
              >
                <div
                  className={`
                    relative h-72 rounded-2xl overflow-hidden
                    transition-transform transform hover:scale-105
                    bg-center bg-cover
                  `}
                  style={{ backgroundImage: `url(${game.bg})` }}
                >
                  {/* overlay sombre */}
                  <div className="absolute inset-0 bg-black/60" />

                  {/* panneau d’infos (tout manuel) */}
                  <div
                    className={`
                      absolute bottom-4 left-4 right-4
                      bg-black/50 backdrop-blur-sm
                      ring-2 ${ringColor}
                      p-5 rounded-lg
                      flex flex-col gap-1
                    `}
                  >
                    <h2 className={`text-2xl font-bold ${accentText}`}>
                      {game.name}
                    </h2>
                    <p className="text-sm text-white/80">
                      Points max:{' '}
                      <span className={`font-semibold ${accentText}`}>
                        {game.totalPoints}
                      </span>
                    </p>
                    <p className="text-sm text-white/80">
                      Succès:{' '}
                      <span className={`font-semibold ${accentText}`}>
                        {game.successCount}
                      </span>
                    </p>
                    <p className="text-sm text-white/80">
                      Difficulté:{' '}
                      <span className={`font-semibold ${accentText}`}>
                        {game.difficulty}
                      </span>
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
