// src/app/achivements/gaming/hades/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  points: number;
}

type HadesRun = {
  id: number;
  user_id: string;
  rooms_completed: number;
  run_at: string;
};

const achievementDefs: Achievement[] = [
  { id: 'escaped_tartarus', title: 'Échappé du Tartare', description: 'Traversez le Tartare', unlocked: false, points: 0 },
  { id: 'escaped_asphodel', title: 'Échappé de l\'Asphodèle', description: 'Traversez l\'Asphodèle', unlocked: false, points: 0 },
  { id: 'arms_collector', title: 'Arms Collector', description: 'Débloquez chaque arme infernale', unlocked: false, points: 0 },
  { id: 'friends_in_high_places', title: 'Friends in High Places', description: 'Utilisez Greater Call', unlocked: false, points: 0 },
  { id: 'escaped_elysium', title: 'Échappé de l\'Élysée', description: 'Traversez l\'Élysée', unlocked: false, points: 0 },
  { id: 'chthonic_colleagues', title: 'Chthonic Colleagues', description: 'Réalisez la prophétie Chthonic Colleagues', unlocked: false, points: 0 },
  { id: 'is_there_no_escape', title: 'N\'y a-t-il Aucune Issue ?', description: 'Échappez-vous des Enfers', unlocked: false, points: 0 },
  { id: 'death_dealer', title: 'Death Dealer', description: 'Battez Thanatos avec 15+ éliminations', unlocked: false, points: 0 },
  // ... Ajouter les autres succès Steam ici ...
];

const externalImageLoader = ({ src }: { src: string }) => src;
const DEFAULT_CHARACTER = 'Zagreus';
const DEFAULT_WEAPON = 'Stygius';

export default function HadesPage() {
  const [, setRuns] = useState<HadesRun[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(achievementDefs);
  const [rooms, setRooms] = useState('');
  const [loading, setLoading] = useState(true);

  // Toggle achievement
  const toggleAchievement = (id: string) => {
    setAchievements(prev =>
      prev.map(a =>
        a.id === id ? { ...a, unlocked: !a.unlocked } : a
      )
    );
  };

  // fetch runs
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      const { data: dbRuns } = await supabase
        .from('hades_runs')
        .select('*')
        .eq('user_id', userId)
        .order('run_at', { ascending: false });
      setRuns(dbRuns || []);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roomsCount = parseInt(rooms, 10);
    if (isNaN(roomsCount) || roomsCount <= 0) {
      alert('Veuillez saisir un nombre de salles valide (> 0)');
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;
    await supabase.from('hades_runs').insert([
      { user_id: userId, character: DEFAULT_CHARACTER, weapon: DEFAULT_WEAPON, rooms_completed: roomsCount, run_at: new Date().toISOString() }
    ]);
    setRooms('');
    const { data: dbRuns } = await supabase
      .from('hades_runs')
      .select('*')
      .eq('user_id', userId)
      .order('run_at', { ascending: false });
    setRuns(dbRuns || []);
  };

  const gloryTotal = achievements.reduce((sum, a) => a.unlocked ? sum + a.points : sum, 0);

  if (loading) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-900 via-black to-black text-white">
      Chargement…
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-900 via-black to-black flex flex-col items-center justify-start py-4">
      {/* Fixed header below navbar */}
      <div className="w-full bg-red-800 text-white py-4 px-6 flex justify-between items-center fixed top-20 z-50">
        <div className="flex items-center space-x-2">
          <Image src="/images/hades-god.png" alt="Hades" width={32} height={32} />
          <span className="text-2xl font-bold">Gloire: {gloryTotal}</span>
        </div>
        <Link href="/achivements/events/hades/shop" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg">
          Marché de Charon
        </Link>
      </div>

      {/* Spacer for header */}
      <div className="h-24 w-full"></div>

      {/* Enlarged title image */}
      <header className="text-center text-white mb-8 w-full">
        <div className="mx-auto inline-block">
          <Image
            loader={externalImageLoader}
            unoptimized
            src="https://upload.wikimedia.org/wikipedia/commons/1/13/Hades_logo.png"
            alt="Hades Logo"
            width={400}
            height={200}
            className="mx-auto"
          />
        </div>
      </header>

      {/* Content full width */}
      <div className="w-full px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* First-run form, reduced height */}
        <section className="bg-black/60 backdrop-blur-sm rounded-2xl px-8 pt-8 pb-4 text-white">
          <h2 className="text-3xl font-semibold mb-2">Enregistrer votre première run</h2>
          <p className="text-sm text-gray-300 mb-4">Comptez le nombre de salles complétées en jouant votre première run !</p>
          <form onSubmit={handleSubmit} className="space-y-4 mb-4">
            <div>
              <label className="block mb-1">Salles terminées</label>
              <input
                type="number"
                min="1"
                placeholder="Nombre de salles"
                value={rooms}
                onChange={e => setRooms(e.target.value)}
                className="w-full p-3 rounded bg-gray-800 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center px-6 py-2 bg-red-700 hover:bg-red-800 rounded-xl font-bold items-center"
            >
              Enregistrer
            </button>
          </form>
        </section>

        {/* Achievements & Glory */}
        <section className="bg-[#1a130e]/80 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-semibold mb-6 text-center">Succès & Gloire</h2>
          <ul className="space-y-6">
            {achievements.map(a => (
              <li
                key={a.id}
                className={`p-5 rounded-xl flex justify-between items-center border-2 ${a.unlocked ? 'border-gold bg-black/30' : 'border-gray-700 bg-gray-900/50'}`}
              >
                <div className="flex items-center space-x-4">
                  <Image
                    loader={externalImageLoader}
                    unoptimized
                    src={`/icons/hades/${a.id}.svg`}
                    alt={a.title}
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  <div>
                    <p className="font-semibold text-lg flex items-center space-x-2">
                      <span>{a.title}</span>
                      <button
                        onClick={() => toggleAchievement(a.id)}
                        className="text-sm bg-primary px-2 py-1 rounded"
                      >
                        {a.unlocked ? 'Annuler' : 'Valider'}
                      </button>
                    </p>
                    <p className="text-_CLEAR_FIELD198 text-gray-300">{a.description}</p>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${a.unlocked ? 'text-gold' : 'text-gray-600'}`}>+{a.points} Gloire</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
