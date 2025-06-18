// src/app/achivements/sport/page.tsx
'use client';

import Link from 'next/link';
import PageLayout from '@/components/PageLayout';

type Sport = {
  name: string;
  slug: string;
  bg: string;
  successCount: number;
};

const SPORTS: Sport[] = [
  {
    name: 'Musculation',
    slug: 'musculation',
    bg: '🏋️',
    successCount: 0,
  },
  {
    name: 'Escalade',
    slug: 'escalade',
    bg: '🧗',
    successCount: 0,
  },
];

export default function SportHub() {
  return (
    <PageLayout title="Sports – Succès">
      <div className="w-full px-4 py-12">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-8">
          {SPORTS.map((sport) => {
            let ringColor = '';
            let accentText = '';
            if (sport.slug === 'musculation') {
              ringColor = 'ring-green-400';
              accentText = 'text-green-300';
            } else if (sport.slug === 'escalade') {
              ringColor = 'ring-yellow-400';
              accentText = 'text-yellow-300';
            }

            return (
              <Link
                key={sport.slug}
                href={`/achivements/sport/${sport.slug}`}
                className="block"
              >
                <div
                  className="
                    relative h-72 rounded-2xl overflow-hidden
                    transition-transform transform hover:scale-105
                    bg-center bg-cover
                  "
                  style={{ backgroundImage: `url(${sport.bg})` }}
                >
                  <div className="absolute inset-0 bg-black/60" />
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
                      {sport.name}
                    </h2>
                    <p className="text-sm text-white/80">
                      Succès:{' '}
                      <span className="font-semibold text-white">
                        {sport.successCount}
                      </span>
                    </p>
                  </div>
                </div>
                {/* Sous-titre en dessous selon le sport */}
                {sport.slug === 'musculation' && (
                  <p className="mt-2 text-center text-white/70">
                    L’exercice <strong>Course</strong> se trouve également dans la catégorie Musculation.
                  </p>
                )}
                {sport.slug === 'escalade' && (
                  <p className="mt-2 text-center text-white/70">
                    Escalade en bloc et en voie ici !
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
