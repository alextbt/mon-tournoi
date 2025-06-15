'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PageLayout from '@/components/PageLayout';

type LeaderboardEntry = {
  user_id: string;
  total_points: number;
  first_name: string;
};

export default function ScoresPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Récupère points + prénom (via relation profiles)
      const { data, error } = await supabase
        .from('user_points')
        .select('user_id, total_points, profiles(first_name)')
        .order('total_points', { ascending: false });

      if (error) {
        console.error('Erreur Supabase :', error.message);
        setEntries([]);
      } else {
        // data est de type Array<{ user_id: string; total_points: number; profiles: { first_name: string }[] }>
        const mapped: LeaderboardEntry[] = (data || []).map(row => ({
          user_id: row.user_id,
          total_points: row.total_points,
          first_name: row.profiles[0]?.first_name ?? '—',
        }));
        setEntries(mapped);
      }

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Classement">
        <p className="text-center py-16 text-white">Chargement…</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Classement">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Classement général</h1>

        <table className="w-full table-auto text-left border-collapse">
          <thead>
            <tr className="border-b border-white/30">
              <th className="py-2 px-4">#</th>
              <th className="py-2 px-4">Prénom</th>
              <th className="py-2 px-4">Points</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, idx) => (
              <tr
                key={e.user_id}
                className={idx % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}
              >
                <td className="py-2 px-4 font-medium text-white">{idx + 1}</td>
                <td className="py-2 px-4 text-white">{e.first_name}</td>
                <td className="py-2 px-4 font-semibold text-accent-purple">
                  {e.total_points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
