// src/components/PageLayout.tsx
'use client';

import React, { ReactNode } from 'react';

export default function PageLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
  bgClass?: string;
}) {
  return (
    <main className="
      relative
      overflow-hidden
      bg-dusk
      min-h-screen
      w-full
      px-4 md:px-8 lg:px-16
    ">
      <div className="absolute inset-0 bg-gradient-radial from-accent-purple/20 to-transparent pointer-events-none" />

      {/* ← plus de max-w ni centrage horizontal fixe */}
      <div className="
        relative z-10
        w-full                /* pleine largeur */
        flex flex-col
        items-start           /* aligner à gauche */
        space-y-8 md:space-y-12
        py-16
      ">
        <h1 className="
          text-3xl md:text-4xl lg:text-5xl
          font-extrabold
          text-white
          text-left           /* titre aligné à gauche */
        ">
          {title}
        </h1>

        {children}
      </div>
    </main>
  );
}
