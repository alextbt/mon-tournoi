// src/app/achivements/sport/cyclisme/page.tsx
'use client';
import React from 'react';
import PageLayout from '@/components/PageLayout';

export default function CyclingPage() {
  return (
    <PageLayout title="">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center px-4">
          <svg
            className="animate-spin h-12 w-12 text-primary mx-auto mb-4"
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
          <p className="text-xl text-text-muted">Page Cyclisme en préparation...</p>
          <p className="text-red-600 text-xl mt-4">Si la page ne charge pas, envoyez un rapport d&apos;erreur sur l&apos;onglet AIDE. J&apos;essaierai de vous aider au plus vite. Merci de votre patience.</p>
        </div>
      </div>
    </PageLayout>
  );
}
