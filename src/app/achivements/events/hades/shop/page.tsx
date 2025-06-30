// src/app/achivements/events/hades/shop/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/lib/supabaseClient';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number; // coût en Gloire
  icon: string;
}

const shopItems: ShopItem[] = [
  { id: 'booster_10', name: 'Booster', description: 'Ajoute ', cost: 50, icon: '/icons/hades/booster.svg' },
  { id: 'stygius_skin', name: 'style hades', description: 'boost categorie esport', cost: 100, icon: '/icons/hades/stygius_skin.svg' },
  { id: 'zagreus_portrait', name: 'points', description: 'échange contre des points', cost: 75, icon: '/icons/hades/zagreus_portrait.svg' },
  // ... autres items à ajouter
];

export default function HadesShopPage() {
  const [glory, setGlory] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [purchased, setPurchased] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      // Récupère la Gloire actuelle de user_points
      const { data, error } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .single();
      if (!error && data) setGlory(data.total_points);
      // TODO: récupérer les items déjà achetés
      setLoading(false);
    })();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePurchase = async (item: ShopItem) => {
    if (item.cost > glory) {
      alert('Vous n\'avez pas assez de Gloire.');
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;
    // Exemple d'insertion dans une table hades_shop_purchases
    const { error } = await supabase
      .from('hades_shop_purchases')
      .insert([{ user_id: userId, item_id: item.id, purchased_at: new Date().toISOString() }]);
    if (error) {
      console.error('Erreur achat:', error);
      alert('Erreur lors de l\'achat.');
      return;
    }
    setPurchased(prev => [...prev, item.id]);
    setGlory(prev => prev - item.cost);
    alert(`Achat de "${item.name}" réussi !`);
  };

  if (loading) return <PageLayout title="Marché de Charon">Chargement…</PageLayout>;

  return (
    <PageLayout title="Marché de Charon">
      <div className="w-full px-6 py-12">
        <h1 className="text-4xl font-bold text-center text-gold mb-8">Marché de Charon</h1>
        <p className="text-center mb-6">Votre Gloire actuelle: <span className="font-semibold">{glory}</span></p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {shopItems.map(item => (
            <div key={item.id} className="bg-[#1a130e]/80 rounded-lg p-6 text-white flex flex-col items-center">
              <Image src={item.icon} alt={item.name} width={64} height={64} className="mb-4" />
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-sm text-gray-300 mb-4 text-center">{item.description}</p>
              
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}