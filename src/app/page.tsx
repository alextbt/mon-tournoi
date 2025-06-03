'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const [, setUser] = useState<unknown>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-200 to-white px-8 pt-[10vh] pb-12 relative">
      {/* Contenu centré au tiers de la page */}
      <div className="max-w-3xl mx-auto mt-[10vh] text-center">
        <h1 className="text-5xl font-extrabold text-purple-800 mb-4">Bienvenue au Grand Tournoi de l’Été</h1>
        <p className="text-lg text-purple-700 mb-10">
          Trois domaines, une équipe victorieuse et un seul grand gagnant !
        </p>

        <div className="flex justify-center gap-6 flex-wrap">
          {/* Bouton S'inscrire */}
          <Link href="/register">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg shadow-md transition">
              S’inscrire au tournoi
            </button>
          </Link>

          {/* Bouton Réalisations et succès */}
          <Link href="/achivements">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-lg shadow-md transition">
              Réalisations et succès
            </button>
          </Link>
        </div>

        {/* Bouton Règles */}
        <div className="mt-10">
          <Link href="/rules">
            <button className="bg-white text-purple-700 border border-purple-500 hover:bg-purple-100 px-6 py-2 rounded-full transition">
              📜 Voir les règles
            </button>
          </Link>
        </div>
      </div>

        <p className="text-sm text-center text-red-600 mt-4 max-w-xl mx-auto">
  Le site est toujours en cours de développement. Bugs, erreurs et crashs peuvent avoir lieu pendant la visite du site. 
  Les informations données (règles, catégories, fonctionnement) ne sont pas définitives et sont sujettes au changement. 
  Merci de votre compréhension.
</p>


      {/* Bouton Discord flottant en bas à droite */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 z-50">
        {/* Flèche animée vers le bouton */}
        <motion.span
          className="text-purple-600 text-3xl"
          animate={{ x: [0, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'loop' }}
        >
          ➡️
        </motion.span>

        {/* Bouton Discord */}
        <a
          href="https://discord.gg/TON-LIEN"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-full flex items-center shadow-md transition"
        >
          {/* Logo Discord */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 24 24"
            className="w-6 h-6 mr-2"
          >
            <path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.07.07 0 00-.075.035c-.21.375-.444.864-.608 1.248a18.194 18.194 0 00-5.487 0 12.71 12.71 0 00-.617-1.248.07.07 0 00-.075-.035 19.736 19.736 0 00-4.885 1.515.064.064 0 00-.03.027C2.064 9.045 1.522 13.64 1.8 18.198a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.07.07 0 00.075-.027c.462-.63.873-1.295 1.226-1.989a.07.07 0 00-.038-.097 13.23 13.23 0 01-1.888-.9.07.07 0 01-.006-.118c.127-.094.254-.19.375-.288a.07.07 0 01.073-.01c3.928 1.795 8.18 1.795 12.061 0a.07.07 0 01.075.009c.122.098.248.195.376.29a.07.07 0 01-.004.118 12.8 12.8 0 01-1.888.899.07.07 0 00-.039.097c.36.693.77 1.359 1.226 1.989a.07.07 0 00.075.027 19.87 19.87 0 005.994-3.03.082.082 0 00.03-.056c.38-5.385-.63-9.953-2.467-13.802a.061.061 0 00-.03-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.174 1.093 2.157 2.418 0 1.334-.955 2.419-2.157 2.419zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.174 1.093 2.157 2.418 0 1.334-.947 2.419-2.157 2.419z" />
          </svg>
          Rejoignez le serveur !
        </a>
      </div>
    </main>
  );
}
