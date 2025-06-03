'use client';

import Link from 'next/link';

type Game = {
  name: string;
  slug: string;
  bg: string;
};

const games: Game[] = [
  {
    name: 'League of Legends',
    slug: 'lol',
    bg: 'https://i.ytimg.com/vi/CsApDyIo80c/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLASAhIf2z9cbeH5v-nHCeRYx8ucbQ',
  },
  {
    name: 'Valorant',
    slug: 'valorant',
    bg: 'https://preview.redd.it/buzyn25jzr761.png?width=1000&format=png&auto=webp&s=c8a55973b52a27e003269914ed1a883849ce4bdc',
  },
  {
    name: '2XKO',
    slug: '2xko',
    bg: 'https://cdn2.steamgriddb.com/icon/155779839648e98ff79a757f89a8d258.png',
  },
  {
    name: 'Overwatch 2',
    slug: 'overwatch2',
    bg: 'https://images.seeklogo.com/logo-png/45/1/overwatch-2-logo-png_seeklogo-452596.png',
  },
  {
    name: 'Marvel Rivals',
    slug: 'marvel-rivals',
    bg: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Logo_Marvel_Rivals.png',
  },
];



export default function GamingHub() {
  return (
    <main className="min-h-screen bg-purple-50 p-8">
      <h1 className="text-4xl font-bold text-purple-700 text-center mb-10">
        Jeux vidéo – Succès
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {games.map((game) => (
          <Link key={game.slug} href={`/achivements/gaming/${game.slug}`}>
            <div
              className="relative h-48 rounded-xl shadow-md overflow-hidden bg-center bg-cover flex items-end justify-between p-4 hover:scale-105 transition"
              style={{ backgroundImage: `url(${game.bg})` }}
            >
              <div className="bg-black/60 backdrop-blur text-white p-3 rounded">
                <h2 className="text-lg font-bold">{game.name}</h2>
                <p className="text-sm">Points max : 0</p>
                <p className="text-sm">Succès : 0</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
