'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Player = {
  id: string;
  name: string;
  team?: string;
  points?: number;
};

export default function Scores() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('points', { ascending: false });

      if (error) {
        console.error('Erreur Supabase :', error.message);
      } else {
        setPlayers(data || []);
      }

      setLoading(false);
    };

    fetchPlayers();
  }, []);

  return (
    <main className="min-h-screen bg-green-100 p-8">
      <h1 className="text-3xl font-bold text-green-700 text-center mb-6">Classement des joueurs</h1>

      {loading ? (
        <p className="text-center text-gray-600">Chargement...</p>
      ) : players.length === 0 ? (
        <p className="text-center text-gray-600">Aucun joueur inscrit pour l’instant.</p>
      ) : (
        <ul className="max-w-md mx-auto space-y-4">
          {players.map((player) => (
            <li key={player.id} className="bg-white p-4 rounded shadow">
              <div className="text-xl font-semibold text-green-800">{player.name}</div>
              {player.team && <div className="text-gray-600">Équipe : {player.team}</div>}
              <div className="mt-2 text-sm text-gray-700">Points : {player.points ?? 0}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
