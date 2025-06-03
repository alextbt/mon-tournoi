'use client';

import Link from 'next/link';

export default function AchivementsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-100 to-white p-8">
      <div className="text-center mt-16">
        <h1 className="text-4xl font-bold text-indigo-700 mb-8">
          Réalisations et succès
        </h1>

        <p className="text-gray-600 mb-12 text-lg">
          Choisis une catégorie pour découvrir les défis, points et trophées.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link href="/achivements/gaming">
            <div className="bg-white p-6 rounded-lg shadow-md hover:bg-indigo-100 transition text-center">
              <div className="text-5xl mb-2">🎮</div>
              <h2 className="text-xl font-semibold text-indigo-700">Jeux</h2>
            </div>
          </Link>

          <Link href="/achivements/sport">
            <div className="bg-white p-6 rounded-lg shadow-md hover:bg-green-100 transition text-center">
              <div className="text-5xl mb-2">🏃‍♂️</div>
              <h2 className="text-xl font-semibold text-green-700">Sports</h2>
            </div>
          </Link>

          <Link href="/achivements/culture">
            <div className="bg-white p-6 rounded-lg shadow-md hover:bg-yellow-100 transition text-center">
              <div className="text-5xl mb-2">📚</div>
              <h2 className="text-xl font-semibold text-yellow-700">Culture générale</h2>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
