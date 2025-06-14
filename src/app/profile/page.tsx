'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Achievement = {
  id: number;
  title: string;
  points: number;
  achieved_at: string;
};

type BreakdownItem = {
  category: string;
  points: number;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [rank, setRank] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // 1) Récupère la session
      const {
        data: { session },
        error: sessionErr,
      } = await supabase.auth.getSession();
      console.log('session', session, sessionErr);
      if (sessionErr || !session) {
        router.replace('/login');
        return;
      }
      const userId = session.user.id;

      // 2) Récupère le user complet (avec user_metadata)
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      console.log('user', user, userErr);

      // 3) Tenter d’utiliser le metadata
      let name = user?.user_metadata?.first_name;
      console.log('from metadata', name);

      // 4) Si metadata vide, on lit dans profiles
      if (!name) {
        const { data: profRow, error: profErr } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', userId)
          .maybeSingle();
        console.log('profiles row', profRow, profErr);
        name = profRow?.first_name ?? '';
      }
      setFirstName(name);

      // 3) Total des points
      const { data: ptsData, error: ptsErr } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .maybeSingle();
      if (ptsErr) console.error('Erreur points:', ptsErr.message);
      const total = ptsData?.total_points ?? 0;
      setTotalPoints(total);

      // 4) Calcul du rang
      const { count: higherCount } = await supabase
        .from('user_points')
        .select('*', { head: true, count: 'exact' })
        .gt('total_points', total);
      setRank((higherCount ?? 0) + 1);

      // 5) Breakdown par catégorie (jointure manuelle)
      const { data: rawSucc } = await supabase
        .from('user_successes')
        .select('success_id')
        .eq('user_id', userId);
      const ids = (rawSucc as { success_id: number }[] | null)
        ?.map(r => r.success_id) || [];
      if (ids.length) {
        const { data: succData, error: succErr } = await supabase
          .from('successes')
          .select('category, points')
          .in('id', ids);
        if (succErr) {
          console.error('Erreur successes:', succErr.message);
          setBreakdown([]);
        } else {
          const map: Record<string, number> = {};
          (succData as { category: string; points: number }[]).forEach(s => {
            map[s.category] = (map[s.category] || 0) + s.points;
          });
          setBreakdown(
            Object.entries(map).map(([category, points]) => ({
              category,
              points,
            }))
          );
        }
      }

      // 6) Réalisations détaillées
      const { data: rawAch, error: achErr } = await supabase
        .from('user_achievements')
        .select('achievement_id, achieved_at, achievements ( title, points )')
        .eq('user_id', userId);
      if (achErr) console.error('Erreur achievements:', achErr.message);
      setAchievements(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rawAch as any[] | null || []).map(u => ({
          id: u.achievement_id,
          title: u.achievements.title,
          points: u.achievements.points,
          achieved_at: u.achieved_at,
        }))
      );

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
        {/* Header gradient */}
        <div className="relative bg-gradient-to-r from-purple-700 to-pink-600 p-8 flex items-center justify-between">
          <div className="flex items-baseline space-x-3">
            <h1 className="text-3xl font-bold text-white">{firstName}</h1>
            <span className="text-white/80 text-lg">| Position #{rank}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition"
          >
            Déconnexion
          </button>
        </div>

        {/* Stats top */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-mid p-6">
          <div className="text-center">
            <p className="text-sm text-white/70">Total des points</p>
            <p className="text-2xl font-extrabold text-white">
              {totalPoints}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/70">Nombre de catégories</p>
            <p className="text-2xl font-extrabold text-white">
              {breakdown.length}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <section className="bg-bg-light p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-2">
            Points par catégorie
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {breakdown.map(item => (
              <div
                key={item.category}
                className="p-4 bg-bg-mid rounded-lg text-white text-center"
              >
                <p className="font-medium">{item.category}</p>
                <p className="mt-1 text-lg font-bold">
                  {item.points} pts
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Réalisations */}
        <section className="bg-bg-mid p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-2">
            Réalisations validées
          </h2>
          {achievements.length === 0 ? (
            <p className="text-white/70">
              Aucune réalisation pour l’instant.
            </p>
          ) : (
            <ul className="space-y-3">
              {achievements.map(a => (
                <li
                  key={a.id}
                  className="flex justify-between p-4 bg-bg-light rounded-lg text-white"
                >
                  <div>
                    <p>{a.title}</p>
                    <p className="text-sm text-white/70">
                      le{' '}
                      {new Date(a.achieved_at).toLocaleDateString(
                        'fr-FR'
                      )}
                    </p>
                  </div>
                  <span className="font-semibold">+{a.points} pts</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
