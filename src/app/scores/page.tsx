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

  // Compute modified total based on profile style
  const computeModified = (
    style: LeaderboardEntry['profile_style'],
    esport: number,
    sport: number
  ): number | null => {
    if (style === 'Joueur') {
      // +25% esport, -50% sport
      return Math.round(esport * 1.25 + sport * 0.5);
    }
    if (style === 'Sportif') {
      // +25% sport, -50% esport
      return Math.round(esport * 0.5 + sport * 1.25);
    }
    return null; // Aucune modification
  };

  useEffect(() => {
    (async () => {
      // 1) Récupérer tous les points et styles de profil
      const { data: pts, error: ptsErr } = await supabase
        .from('user_points')
        .select('user_id, total_points, esports_points, sport_points');
      if (ptsErr || !pts) {
        console.error('Erreur fetch user_points:', ptsErr?.message);
        setLoading(false);
        return;
      }
      const userIds = pts.map(r => r.user_id);

      // 2) Récupérer prénoms et styles
      const { data: profs, error: profErr } = await supabase
        .from('profiles')
        .select('id, first_name, profile_style')
        .in('id', userIds);
      if (profErr || !profs) {
        console.error('Erreur fetch profiles:', profErr?.message);
        setLoading(false);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileMap = profs.reduce<Record<string, { first_name: string; profile_style: any }>>((m, p) => {
        m[p.id] = { first_name: p.first_name, profile_style: p.profile_style };
        return m;
      }, {});

      // 3) Construire la liste initiale
      const list: LeaderboardEntry[] = pts.map((r) => {
        const { first_name = '—', profile_style = 'Aucune' } = profileMap[r.user_id] || {};
        const esport = r.esports_points ?? 0;
        const sport = r.sport_points ?? 0;
        const total = r.total_points ?? 0;
        const modifiedTotal = computeModified(profile_style, esport, sport);
        return {
          user_id: r.user_id,
          first_name,
          profile_style,
          esport,
          sport,
          total,
          modifiedTotal,
          movement: null,
        };
      });

      // 4) Tri par total décroissant
      list.sort((a, b) => b.total - a.total);

      // 5) Flèches de mouvement selon le classement précédent
      const prev = JSON.parse(localStorage.getItem('__prevLeaderboard__') || '[]') as string[];
      const prevPos = prev.reduce<Record<string, number>>((m, id, i) => {
        m[id] = i;
        return m;
      }, {});
      list.forEach((e, idx) => {
        if (prevPos[e.user_id] === undefined) e.movement = null;
        else if (idx < prevPos[e.user_id]) e.movement = 'up';
        else if (idx > prevPos[e.user_id]) e.movement = 'down';
      });
      localStorage.setItem('__prevLeaderboard__', JSON.stringify(list.map(e => e.user_id)));

      setEntries(list);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Classement">
        <p className="text-center text-white py-16">Chargement du classement…</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Classement">
      <div className="max-w-4xl mx-auto overflow-x-auto px-4">
        <table className="w-full table-auto text-white text-base md:text-lg">
          <thead>
            <tr className="bg-bg-mid">
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3 text-left">Joueur</th>
              <th className="px-6 py-3 text-center">Style</th>
              <th className="px-6 py-3 text-right">eSport</th>
              <th className="px-6 py-3 text-right">Sport</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-right">Total modifié</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.user_id} className={i % 2 === 0 ? 'bg-bg-light' : undefined}>
                <td className="px-6 py-3 flex items-center gap-1">
                  <span className="font-semibold">#{i + 1}</span>
                  {e.movement === 'up' && <span className="text-green-400">🔼</span>}
                  {e.movement === 'down' && <span className="text-red-400">🔽</span>}
                </td>
                <td className="px-6 py-3">{e.first_name}</td>
                <td className="px-6 py-3 text-center">{e.profile_style}</td>
                <td className="px-6 py-3 text-right">{e.esport}</td>
                <td className="px-6 py-3 text-right">{e.sport}</td>
                <td className="px-6 py-3 text-right font-bold">{e.total}</td>
                <td className="px-6 py-3 text-right font-semibold">
                  {e.modifiedTotal === null ? (
                    <span className="text-white/50">—</span>
                  ) : (
                    <span className={
                      e.modifiedTotal! > e.total
                        ? 'text-green-400'
                        : e.modifiedTotal! < e.total
                        ? 'text-red-400'
                        : 'text-white'
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
    </PageLayout>
  );
}