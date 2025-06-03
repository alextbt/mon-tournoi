'use client';

import Link from 'next/link';

type Sport = {
  name: string;
  slug: string;
  emoji: string;
};

const sports: Sport[] = [
  { name: 'Course', slug: 'course', emoji: '🏃‍♂️' },
  { name: 'Musculation', slug: 'musculation', emoji: '🏋️' },
  { name: 'Escalade', slug: 'escalade', emoji: '🧗' },
];

export default function SportHub() {
  return (
    <main className="min-h-screen bg-green-50 p-8">
      <h1 className="text-4xl font-bold text-green-700 text-center mb-10">
        Sports – Succès
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {sports.map((sport) => (
          <Link key={sport.slug} href={`/achivements/sport/${sport.slug}`}>
            <div className="bg-white rounded-xl shadow-md p-6 hover:bg-green-100 transition text-center">
              <div className="text-5xl mb-2">{sport.emoji}</div>
              <h2 className="text-xl font-bold text-green-800">{sport.name}</h2>
              <p className="text-sm text-gray-600 mt-1">Succès disponibles : 0</p>
              <p className="text-sm text-gray-600">Points max : 0</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
