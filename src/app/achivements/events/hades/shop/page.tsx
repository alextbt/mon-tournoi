// src/app/achivements/events/hades/shop/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface ShopItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserPurchase = {
  id: number;
  item_id: number;
  purchased_at: string;
};

export default function HadesShopPage() {
  const [items] = useState<ShopItem[]>([
    { id: 1, name: 'Bonus Esport', description: 'Gain de points eSport +50', cost: 20, icon: '/icons/trophy-esport.png' },
    { id: 2, name: 'Pack Sport', description: 'Gain de points Sport +50', cost: 20, icon: '/icons/trophy-sport.png' },
    { id: 3, name: 'Ticket Cyclisme', description: 'Inscription gratuite à une course cycliste', cost: 30, icon: '/icons/bike.png' },

    { id: 5, name: 'Portrait Tournoi', description: 'Portrait personnalisé sur le site', cost: 25, icon: '/icons/portrait.png' },
  ]);
  const [glory, setGlory] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;

      // fetch user glory
      const { data: up } = await supabase
        .from('user_points')
        .select('glory')
        .eq('user_id', userId)
        .single();

      setGlory(up?.glory || 0);
      setLoading(false);
    })();
  }, []);

  const handleBuy = async (item: ShopItem) => {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    if (glory < item.cost) {
      alert('Pas assez de gloire !');
      return;
    }

    // deduct glory
    const newGlory = glory - item.cost;
    await supabase
      .from('user_points')
      .upsert({ user_id: userId, glory: newGlory }, { onConflict: 'user_id' });

    // record purchase
    await supabase
      .from('user_hades_purchases')
      .insert({ user_id: userId, item_id: item.id });

    setGlory(newGlory);
    alert(`Vous avez acheté ${item.name} !`);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Chargement…</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-900 via-black to-black flex flex-col items-center pt-24 px-4">
      {/* Header sous navbar, aligné à gauche comme /game */}
      <header className="w-full bg-red-800 text-white py-4 px-6 fixed top-20 z-40">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-3 sm:mb-0">
            <Image
              loader={({ src }) => src}
              unoptimized
              src="https://cdn2.steamgriddb.com/icon/851300ee84c2b80ed40f51ed26d866fc/32/256x256.png"
              alt="Hades Symbol"
              width={40}
              height={40}
            />
            <span className="text-2xl font-bold">Gloire: {glory}</span>
          </div>
          <Link href="/achivements/events/hades/game">
            <button className="bg-gray-200 text-black hover:bg-stone-400 font-semibold px-6 py-2 rounded-lg">
            ← Retour au jeu
            </button>
          </Link>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-24" />

      {/* Shop grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {items.map(item => (
          <div key={item.id} className="bg-[#1a130e]/80 rounded-2xl p-6 text-center">
            <Image src={item.icon} loader={({ src }) => src} unoptimized alt={item.name} width={80} height={80} className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
            <p className="text-sm text-gray-300 mb-4">{item.description}</p>
            <div className="flex justify-center items-center space-x-2 mb-2">
              <span className="text-lg font-bold">Coût:</span>
              <span className="text-lg">{item.cost} Gloire</span>
            </div>
            <button
              onClick={() => handleBuy(item)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
            >
              Acheter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
