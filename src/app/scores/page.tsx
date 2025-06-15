'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type LeaderboardEntry = {
  user_id: string;
  total_points: number;
  profiles: { first_name: string } | null;
};

export default function ScoresPage() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    (async () => {
      // On joint la table profiles pour avoir first_name
      const { data, error } = await supabase
        .from('user_points')
        .select('user_id, total_points, profiles ( first_name )')
        .order('total_points', { ascending: false });

      if (error) {
        console.error('Erreur Supabase :', error.message);
      } else {
        setEntries(data || []);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement du classement…</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Classement</h1>
      <ul className="space-y-2">
        {entries.map((e, i) => {
          const name = e.profiles?.first_name ?? e.user_id;
          return (
            <li
              key={e.user_id}
              className="flex justify-between bg-bg-mid p-4 rounded"
            >
              <span>
                #{i + 1} — {name}
              </span>
              <span className="font-semibold">{e.total_points} pts</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
