// src/app/achivements/events/hades/page.tsx
'use client';

import Link from 'next/link'

export default function HadesEventPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Fond infernal rouge/noir */}
      <div className="absolute inset-0 bg-gradient-to-br from-black to-red-900" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 space-y-12 text-center">
        {/* Titre */}
        <h1 className="text-5xl font-extrabold text-red-400 drop-shadow-lg">
          Bienvenue dans les Enfers
        </h1>

        {/* Sous-titre */}
        <p className="text-lg text-gray-200 max-w-2xl mx-auto">
          Cet événement est dédié au jeu vidéo <span className="font-semibold text-red-300">Hadès</span>. 
          Il faut avoir le jeu pour participer. Voici les disponibilités du jeu :
        </p>

        {/* Boutons d’achats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <a
            href="https://store.steampowered.com/app/1145360/Hades/"
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 rounded-lg bg-red-700 text-white font-semibold text-lg transition shadow-[0_0_10px_rgba(220,38,38,0.75)] hover:shadow-[0_0_20px_rgba(220,38,38,1)]"
          >
            Steam
          </a>
          <a
            href="https://apps.apple.com/app/hades/id1502048819"
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 rounded-lg bg-red-700 text-white font-semibold text-lg transition shadow-[0_0_10px_rgba(220,38,38,0.75)] hover:shadow-[0_0_20px_rgba(220,38,38,1)]"
          >
            App Store
          </a>
          <a
            href="https://www.xbox.com/en-us/games/store/hades/9P8DL6W0JBB8"
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 rounded-lg bg-red-700 text-white font-semibold text-lg transition shadow-[0_0_10px_rgba(220,38,38,0.75)] hover:shadow-[0_0_20px_rgba(220,38,38,1)]"
          >
            Xbox Store
          </a>
          <a
            href="https://store.playstation.com/fr-fr/product/EP0700-CUSA27195_00-HADES00000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 rounded-lg bg-red-700 text-white font-semibold text-lg transition shadow-[0_0_10px_rgba(220,38,38,0.75)] hover:shadow-[0_0_20px_rgba(220,38,38,1)]"
          >
            PlayStation Store
          </a>
          <a
            href="https://store.playstation.com/en-us/product/UP2125-PPSA03355_00-3466019145463410"
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 rounded-lg bg-red-700 text-white font-semibold text-lg transition shadow-[0_0_10px_rgba(220,38,38,0.75)] hover:shadow-[0_0_20px_rgba(220,38,38,1)]"
          >
            Epic Games Store
          </a>
          <a
            href="https://www.nintendo.com/games/detail/hades-switch/"
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 rounded-lg bg-red-700 text-white font-semibold text-lg transition shadow-[0_0_10px_rgba(220,38,38,0.75)] hover:shadow-[0_0_20px_rgba(220,38,38,1)]"
          >
            Nintendo eShop
          </a>
          <a
            href="https://www.netflix.com/fr/game/81636738?s=i&trkid=260452134&vlang=fr"
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 rounded-lg bg-red-700 text-white font-semibold text-lg transition shadow-[0_0_10px_rgba(220,38,38,0.75)] hover:shadow-[0_0_20px_rgba(220,38,38,1)]"
          >
            Netflix iOS
          </a>
        </div>
        <p className="text-lg text-gray-200 max-w-2xl mx-auto">
          Si vous n&apos;avez pas le jeu, que vous ne souhaitez pas l&apos;achetez, ou que vous ne disposez pas d&apos;un compte Netflix sur iOS, ce n&apos;est pas un problème. 
          Cet événement est facultatif au même titre que l&apos;est la catégorie eSport. Sinon, cliquez ici pour continuer.
        </p>
        <Link href="/achivements/events/hades/game">
  <button
    className="
      w-24 h-24      /* taille fixe pour ton bouton */
      bg-[url('https://ih1.redbubble.net/image.2466343126.6094/raf,360x360,075,t,fafafa:ca443f4786.jpg')]
      bg-cover bg-center
      rounded-full
      shadow-[0_0_10px_rgba(220,38,38,0.75)]
      hover:shadow-[0_0_20px_rgba(220,38,38,1)]
    "
  />
</Link>


      </div>
    </main>
  );
}
