// src/app/achivements/events/megalovania/page.tsx
'use client';

import React from 'react';
import PageLayout from '@/components/PageLayout';

export default function hadestempoEventPage() {
  return (
    <PageLayout title="Hadès - Événement à venir">
      <div className="flex items-start justify-center min-h-screen w-full pt-24">
        <div className="mx-auto text-center px-4">
          <svg
            className="animate-spin h-16 w-16 text-slate-950 mx-auto mb-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <h1 className="text-3xl font-bold text-red-950 mb-2">Hadès arrive le 3 juillet !</h1>
          <p className="text-lg text-slate-950 mb-4">
            Remontez les enfers et affrontez les démons qui se dressent entre vous et la surface ! Et si vous tombez... revenez plus fort encore ! Obtenez des points en jouant au jeu mais aussi en réalisant 
            une première run record !
          </p>
          <p className="text-sm text-gray-300">
            Si vous rencontrez un problème ou avez des questions, contactez le support via l&apos;onglet AIDE.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}