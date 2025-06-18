// src/app/scores/page.tsx
'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/lib/supabaseClient';

type LeaderboardEntry = {
  user_id: string;
  first_name: string;
  profile_style: 'Joueur' | 'Sportif' | 'Aucune';
  esport: number;
  sport: number;
  total: number;
  modifiedTotal: number | null;
  movement: 'up' | 'down' | null;
};

export default function ScoresPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const computeModified = (
    style: LeaderboardEntry['profile_style'],
    esport: number,
    sport: number
  ): number | null => {
    if (style === 'Joueur') return Math.round(esport * 1.25 + sport * 0.5);
    if (style === 'Sportif') return Math.round(esport * 0.5 + sport * 1.25);
    return null;
  };

  useEffect(() => {
    (async () => {
      const { data: pts, error: ptsErr } = await supabase
        .from('user_points')
        .select('user_id, total_points, esports_points, sport_points');
      if (ptsErr || !pts) { console.error(ptsErr); setLoading(false); return; }
      const ids = pts.map(r => r.user_id);
      const { data: profs, error: profErr } = await supabase
        .from('profiles')
        .select('id, first_name, profile_style')
        .in('id', ids);
      if (profErr || !profs) { console.error(profErr); setLoading(false); return; }
      const map = Object.fromEntries(
        profs.map(p => [p.id, { first_name: p.first_name, profile_style: p.profile_style }])
      );

      const list: LeaderboardEntry[] = pts.map(r => {
        const { first_name = '—', profile_style = 'Aucune' } = map[r.user_id] || {};
        const esport = r.esports_points ?? 0;
        const sport = r.sport_points ?? 0;
        const total = r.total_points ?? 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = computeModified(profile_style as any, esport, sport);
        return {
          user_id: r.user_id,
          first_name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile_style: profile_style as any,
          esport,
          sport,
          total,
          modifiedTotal: mod,
          movement: null,
        };
      });

      list.sort((a, b) => {
  // si un joueur a un total modifié, on l’utilise ; sinon on retombe sur le total standard
  const aScore = a.modifiedTotal !== null ? a.modifiedTotal : a.total;
  const bScore = b.modifiedTotal !== null ? b.modifiedTotal : b.total;
  return bScore - aScore;
});
const prev = JSON.parse(localStorage.getItem('__prevLeaderboard__') || '[]') as string[];
const prevPos = Object.fromEntries(prev.map((id, i) => [id, i]));

list.forEach((e, idx) => {
  const prevIndex = prevPos[e.user_id];
  if (prevIndex === undefined || prevIndex === idx) {
    e.movement = null;
  } else if (idx < prevIndex) {
    e.movement = 'up';
  } else {
    e.movement = 'down';
  }
});

localStorage.setItem(
  '__prevLeaderboard__',
  JSON.stringify(list.map(e => e.user_id))
);

      setEntries(list);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Classement" bgClass="bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-500">
        <div className="flex items-center justify-center h-64">
          <p className="text-white">Chargement du classement…</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="" bgClass="bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-500">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Classement</h1>
        <div className="overflow-x-auto">
          <table className="min-w-[800px] mx-auto w-full table-auto bg-white/10 rounded-lg">
            <thead>
              <tr className="bg-white/20">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Joueur</th>
                <th className="px-4 py-3 text-center">Style</th>
                <th className="px-4 py-3 text-right">eSport</th>
                <th className="px-4 py-3 text-right">Sport</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Total modifié</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.user_id} className={i % 2 === 0 ? 'bg-white/5' : ''}>
                  <td className="px-4 py-2">#{i + 1} {e.movement === 'up' ? '🔼' : e.movement === 'down' ? '🔽' : ''}</td>
                  <td className="px-4 py-2">{e.first_name}</td>
                  <td className="px-4 py-2 text-center">{e.profile_style}</td>
                  <td className="px-4 py-2 text-right">{e.esport}</td>
                  <td className="px-4 py-2 text-right">{e.sport}</td>
                  <td className="px-4 py-2 text-right font-bold">{e.total}</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {e.modifiedTotal == null ? '—' : (
                      <span className={
                        e.modifiedTotal > e.total ? 'text-green-300' : e.modifiedTotal < e.total ? 'text-red-300' : 'text-white'
                      }>
                        {e.modifiedTotal}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
