// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Achievement = {
  id: number;
  title: string;
  points: number;
  achieved_at: string;
  status: 'pending' | 'accepted' | 'refused';
};

type BreakdownItem = {
  category: string;
  points: number;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [subTotalEsport, setSubTotalEsport] = useState(0);
  const [subTotalSport, setSubTotalSport] = useState(0);
  const [subTotalAchievements, setSubTotalAchievements] = useState(0);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // 1) Session & user
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session) {
        router.replace('/login');
        return;
      }
      const userId = session.user.id;

      // 2) Load aggregated points
      const { data: ptsData, error: ptsErr } = await supabase
        .from('user_points')
        .select(
          'lol_points, valorant_points, escalade_points, escalade_voie_points, musculation_points, achievements_points, total_points'
        )
        .eq('user_id', userId)
        .maybeSingle();
      if (ptsErr) console.error('Erreur user_points:', ptsErr.message);
      const {
        lol_points = 0,
        valorant_points = 0,
        escalade_points = 0,
        escalade_voie_points = 0,
        musculation_points = 0,
        achievements_points = 0,
        total_points = 0,
      } = ptsData || {};

      setSubTotalEsport(lol_points + valorant_points);
      setSubTotalSport(escalade_points + escalade_voie_points + musculation_points);
      setSubTotalAchievements(achievements_points);
      setTotalPoints(total_points);

      setBreakdown([
        { category: 'LoL', points: lol_points },
        { category: 'Valorant', points: valorant_points },
        { category: 'Musculation', points: musculation_points },
        { category: 'Escalade', points: escalade_points + escalade_voie_points },
        { category: 'Réalisations', points: achievements_points },
      ]);

      // 3) Profile name
      const { data: profRow, error: profErr } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .maybeSingle();
      if (profErr) console.error('Erreur profile:', profErr.message);
      setFirstName(profRow?.first_name ?? 'Utilisateur');

      // 4) Pending achievements
      const { data: pending, error: pendErr } = await supabase
        .from('achievements')
        .select('id, achievement, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (pendErr) console.error('Erreur pending achievements:', pendErr.message);

      // 5) Processed achievements
      const { data: processed, error: procErr } = await supabase
        .from('user_achievements')
        .select('id, achievement, points, achieved_at, result')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });
      if (procErr) console.error('Erreur user_achievements:', procErr.message);

      // 6) Combine and filter
      const processedMap = new Set<string>();
      if (processed) {
        for (const v of processed) {
          processedMap.add(v.achievement);
        }
      }
      const list: Achievement[] = [];

      // include only pending not yet processed
      if (pending) {
        for (const p of pending) {
          if (!processedMap.has(p.achievement)) {
            list.push({
              id: p.id,
              title: p.achievement,
              points: 0,
              achieved_at: p.created_at,
              status: 'pending',
            });
          }
        }
      }

      // add processed
      if (processed) {
        for (const v of processed) {
          list.push({
            id: v.id,
            title: v.achievement,
            points: v.points,
            achieved_at: v.achieved_at,
            status: v.result === 'accepted' ? 'accepted' : 'refused',
          });
        }
      }
      setAchievements(list);

      setLoading(false);
    })();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement profil…</p>
      </div>
    );
  }

  return (
    <main className="bg-dusk min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-bg-mid rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-700 to-pink-600 p-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">{firstName}</h1>
          <button
            onClick={handleLogout}
            className="bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition"
          >
            Déconnexion
          </button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-bg-mid p-6">
          <div className="text-center">
            <p className="text-sm text-white/70">Total des points</p>
            <p className="text-2xl font-extrabold text-white">{totalPoints}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-white/70">Sous-total eSport</p>
            <p className="text-xl font-bold text-white">{subTotalEsport}</p>
            <p className="text-sm text-white/70 mt-2">Sous-total Sport</p>
            <p className="text-xl font-bold text-white">{subTotalSport}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-white/70">Sous-total Réalisations</p>
            <p className="text-xl font-bold text-white">{subTotalAchievements}</p>
          </div>
        </div>

        {/* Breakdown */}
        <section className="bg-bg-light p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-2">Points par catégorie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {breakdown.map(item => (
              <div
                key={item.category}
                className="p-4 bg-bg-mid rounded-lg text-white text-center"
              >
                <p className="font-medium">{item.category}</p>
                <p className="mt-1 text-lg font-bold">{item.points} pts</p>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="bg-bg-mid p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-2">Réalisations</h2>
          {achievements.length === 0 ? (
            <p className="text-white/70">Aucune réalisation.</p>
          ) : (
            <ul className="space-y-3">
              {achievements.map(a => (
                <li
                  key={`${a.status}-${a.id}`}  
                  className="flex justify-between p-4 bg-bg-light rounded-lg"
                >
                  <div>
                    <p
                      className={
                        a.status === 'pending'
                          ? 'italic text-white/70'
                          : a.status === 'accepted'
                          ? 'text-green-300'
                          : 'text-red-300'
                      }
                    >
                      {a.title} {' '}
                      {a.status === 'pending'
                        ? '(en attente)'
                        : a.status === 'accepted'
                        ? '(accepté)'
                        : '(refusé)'}
                    </p>
                    <p className="text-sm text-white/70">
                      le {new Date(a.achieved_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span
                    className={
                      a.status === 'pending'
                        ? 'text-yellow-300'
                        : a.status === 'accepted'
                        ? 'font-semibold text-green-300'
                        : 'font-semibold text-red-300'
                    }
                  >
                    {a.status === 'pending'
                      ? '—'
                      : a.status === 'accepted'
                      ? `+${a.points} pts`
                      : '✖'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
