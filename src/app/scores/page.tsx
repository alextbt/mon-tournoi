'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/lib/supabaseClient';

type LeaderboardEntry = {
  user_id: string;
  first_name: string;
  profile_style: 'Joueur' | 'Sportif' | 'Éthéré' | 'Festif' | 'Divin' | 'Aucune modification';
  esport: number;
  sport: number;
  events: number;
  realisations: number;
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
  sport: number,
  events: number,
  realisations: number
): number | null => {
  switch (style) {
    case 'Joueur':
      return Math.round(esport * 1.25 + sport * 0.5   + events   + realisations);
    case 'Sportif':
      return Math.round(esport * 0.5  + sport * 1.25  + events   + realisations);
    case 'Éthéré':
      return Math.round(esport * 1.05 + sport * 1.05  + events * 1.5 + realisations);
    case 'Festif':
      return Math.round(esport * 1.10 + sport * 1.10  + events * 1.75 + realisations);
    case 'Divin':
      return Math.round(esport * 0.80 + sport * 0.80  + events * 2.5 + realisations);
    case 'Aucune modification':
      return null;
    default:
      return null;
  }
};

  useEffect(() => {
    (async () => {
      try {
        // 1) Récupérer les profils
        const { data: profs, error: profErr } = await supabase
          .from('profiles')
          .select('id, first_name, profile_style');
        if (profErr || !profs) throw profErr;

        const ids = profs.map(p => p.id);

        // 2) Récupérer les points sans calcul : esports, sport, events, réalisations, total
const { data: ptsData, error: ptsErr } = await supabase
  .from('user_points')
  .select(
    'user_id, esports_points, sport_points, event_points, achievements_points, total_points'
  )
  .in('user_id', ids);

        if (ptsErr || !ptsData) throw ptsErr;

        const ptsMap = Object.fromEntries(
          ptsData.map(r => [r.user_id, r])
        );

        // 3) Construire la liste
        const list: LeaderboardEntry[] = profs.map(p => {
          const r = ptsMap[p.id] || { esports_points: 0, sport_points: 0, event_points: 0, achievements_points: 0, total_points: 0 };
          const esport = r.esports_points;
          const sport = r.sport_points;
          const events = r.event_points;
          const realisations = r.achievements_points;
          const total = r.total_points;
          const modifiedTotal = computeModified(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            p.profile_style as any,
            esport,
            sport,
            events,
            realisations
          );
          return {
            user_id: p.id,
            first_name: p.first_name || '—',
            profile_style: (p.profile_style as LeaderboardEntry['profile_style']) || 'Aucune modification',
            esport,
            sport,
            events,
            realisations,
            total,
            modifiedTotal,
            movement: null,
          };
        });

        // 4) Trier et calculer mouvement
        list.sort((a, b) => {
          const aScore = a.modifiedTotal ?? a.total;
          const bScore = b.modifiedTotal ?? b.total;
          return bScore - aScore;
        });
        const prev = JSON.parse(localStorage.getItem('__prevLeaderboard__') || '[]') as string[];
        const prevPos = Object.fromEntries(prev.map((id, i) => [id, i]));
        list.forEach((e, idx) => {
          const old = prevPos[e.user_id];
          e.movement = old === undefined || old === idx ? null : idx < old ? 'up' : 'down';
        });
        localStorage.setItem('__prevLeaderboard__', JSON.stringify(list.map(e => e.user_id)));

        setEntries(list);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
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
      <h2 className="text-base text-white text-center mb-6">
        Le classement peut prendre un petit moment avant de s&apos;actualiser.
      </h2>

      {/* Wrapper frosted-glass + overflow */}
      <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-x-auto">
        <table className="min-w-[900px] mx-auto w-full table-auto text-white">
          <thead className="sticky top-0 bg-white/20 backdrop-blur-sm border-b border-white/30">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Joueur</th>
              <th className="px-4 py-3 text-center">Style</th>
              <th className="px-4 py-3 text-right">eSport</th>
              <th className="px-4 py-3 text-right">Sport</th>
              <th className="px-4 py-3 text-right">Événements</th>
              <th className="px-4 py-3 text-right">Réalisations</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right sticky right-0 bg-white/20 backdrop-blur-sm">
                Total modifié
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const isCurrentUser = e.first_name === 'Alex';
              return (
                <tr
                  key={e.user_id}
                  className={`
                    ${isCurrentUser ? 'bg-green-500/20' : ''}
                    ${i % 2 === 0 ? 'bg-white/10' : 'bg-white/5'}
                    hover:bg-white/20 transition-colors
                  `}
                >
                  <td className="px-4 py-2">
                    #{i + 1}{' '}
                    {e.movement === 'up' ? '🔼' : e.movement === 'down' ? '🔽' : ''}
                  </td>
                  <td className="px-4 py-2">{e.first_name}</td>
                  <td className="px-4 py-2 text-center">{e.profile_style}</td>
                  <td className="px-4 py-2 text-right">{e.esport}</td>
                  <td className="px-4 py-2 text-right">{e.sport}</td>
                  <td className="px-4 py-2 text-right">{e.events}</td>
                  <td className="px-4 py-2 text-right">{e.realisations}</td>
                  <td className="px-4 py-2 text-right font-bold">{e.total}</td>
                  <td
                    className="
                      px-4 py-2 text-right font-semibold
                      sticky right-0
                      bg-white/10 backdrop-blur-md
                    "
                  >
                    {e.modifiedTotal == null
                      ? '—'
                      : (
                        <span
                          className={
                            e.modifiedTotal > e.total
                              ? 'text-green-300'
                              : e.modifiedTotal < e.total
                                ? 'text-red-300'
                                : 'text-white'
                          }
                        >
                          {e.modifiedTotal}
                        </span>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </PageLayout>
);
}