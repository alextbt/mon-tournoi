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
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('Utilisateur');
  const [profileStyle, setProfileStyle] = useState<'Joueur' | 'Sportif' | 'Aucune modification'>('Aucune modification');

  const [totalPoints, setTotalPoints] = useState(0);
  const [subTotalEsport, setSubTotalEsport] = useState(0);
  const [subTotalSport, setSubTotalSport] = useState(0);
  const [subTotalEvents, setSubTotalEvents] = useState(0);
  const [subTotalAchievements, setSubTotalAchievements] = useState(0);

  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // changer de style de profil
  const handleStyleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = e.target.value as typeof profileStyle;
    setProfileStyle(newStyle);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase
      .from('profiles')
      .update({ profile_style: newStyle })
      .eq('id', session.user.id);
  };

  useEffect(() => {
    (async () => {
      // 1) session & utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const userId = session.user.id;

      // 2) load user_points (avec cycling_points et chess_points)
      const { data: ptsData } = await supabase
        .from('user_points')
        .select(`
          lol_points,
          valorant_points,
          chess_points,
          escalade_points,
          escalade_voie_points,
          musculation_points,
          cyclisme_points,
          event_points,
          achievements_points,
          total_points
        `)
        .eq('user_id', userId)
        .maybeSingle();

      const {
        lol_points = 0,
        valorant_points = 0,
        chess_points = 0,
        escalade_points = 0,
        escalade_voie_points = 0,
        musculation_points = 0,
        cyclisme_points = 0,
        event_points = 0,
        achievements_points = 0,
        total_points = 0,
      } = ptsData || {};

      // Sous-totaux
      setSubTotalEsport(lol_points + valorant_points + chess_points);
      setSubTotalSport(escalade_points + escalade_voie_points + musculation_points + cyclisme_points);
      setSubTotalEvents(event_points);
      setSubTotalAchievements(achievements_points);
      setTotalPoints(total_points);

      // Breakdown de toutes les catégories
      setBreakdown([
        { category: 'LoL', points: lol_points },
        { category: 'Valorant', points: valorant_points },
        { category: 'Échecs', points: chess_points },
        { category: 'Musculation', points: musculation_points },
        { category: 'Escalade', points: escalade_points + escalade_voie_points },
        { category: 'Cyclisme', points: cyclisme_points },
      ]);

      // 3) load profile name + style
      const { data: profRow } = await supabase
        .from('profiles')
        .select('first_name, profile_style')
        .eq('id', userId)
        .maybeSingle();
      if (profRow) {
        setFirstName(profRow.first_name || 'Utilisateur');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setProfileStyle(profRow.profile_style as any || 'Aucune modification');
      }

      // 4) pending & processed achievements
      const { data: pending } = await supabase
        .from('achievements')
        .select('id, achievement, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      const { data: processed } = await supabase
        .from('user_achievements')
        .select('id, achievement, points, achieved_at, result')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });

      const processedSet = new Set(processed?.map(p => p.achievement));
      const list: Achievement[] = [];

      pending?.forEach(p => {
        if (!processedSet.has(p.achievement)) {
          list.push({
            id: p.id,
            title: p.achievement,
            points: 0,
            achieved_at: p.created_at,
            status: 'pending',
          });
        }
      });
      processed?.forEach(p => {
        list.push({
          id: p.id,
          title: p.achievement,
          points: p.points,
          achieved_at: p.achieved_at,
          status: p.result === 'accepted' ? 'accepted' : 'refused',
        });
      });

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
    <main className="bg-dusk min-h-screen py-8 px-6 xl:px-32 2xl:px-48">
      <div className="w-full bg-bg-mid rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-700 to-pink-600 p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-4xl font-bold text-white">{firstName}</h1>
            <span className="text-white/80">|</span>
            <select
              value={profileStyle}
              onChange={handleStyleChange}
              className="bg-white/20 text-white px-3 py-1 rounded-lg focus:outline-none"
            >
              <option value="Joueur">Joueur</option>
              <option value="Sportif">Sportif</option>
              <option value="Éthéré">Éthéré (si débloqué dans l’événement Sanctuaire)</option>
              <option value="Festif">Festif (si débloqué dans l’événement Sanctuaire)</option>
              <option value="Divin">Divin (si débloqué dans l’événement Sanctuaire)</option>
            </select>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/20 text-white px-5 py-2 rounded-lg hover:bg-white/30 transition"
          >
            Déconnexion
          </button>
        </div>

        {/* Totaux */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 bg-bg-mid p-8 text-center">
          <div>
            <p className="text-sm text-purple-400/70">Total</p>
            <p className="text-5xl font-extrabold text-white">{totalPoints}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">eSport</p>
            <p className="text-2xl font-bold text-white">{subTotalEsport}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Sport</p>
            <p className="text-2xl font-bold text-white">{subTotalSport}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Événements</p>
            <p className="text-2xl font-bold text-white">{subTotalEvents}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Réalisations</p>
            <p className="text-2xl font-bold text-white">{subTotalAchievements}</p>
          </div>
        </div>

        {/* Breakdown */}
        <section className="bg-bg-light p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-white">Points par catégorie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-6">
            {breakdown.map(item => (
              <div
                key={item.category}
                className="p-6 bg-bg-mid rounded-xl text-white text-center"
              >
                <p className="font-medium">{item.category}</p>
                <p className="mt-2 text-2xl font-bold">{item.points} pts</p>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="bg-bg-mid p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-white">Réalisations</h2>
          {achievements.length === 0 ? (
            <p className="text-white/70">Aucune réalisation.</p>
          ) : (
            <ul className="space-y-4">
              {achievements.map(a => (
                <li
                  key={`${a.status}-${a.id}`}
                  className="flex justify-between items-center p-4 bg-bg-light rounded-xl"
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
                      {a.title}{' '}
                      {a.status === 'pending'
                        ? '(en attente)'
                        : a.status === 'accepted'
                        ? '(accepté)'
                        : '(refusé)'}
                    </p>
                    <p className="text-sm text-white/70">
                      le{' '}
                      {new Date(a.achieved_at).toLocaleDateString('fr-FR')}
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

        {/* Avantages spéciaux */}
        <section className="bg-bg-light p-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Avantages spéciaux
          </h2>
          <p className="text-white/70">
            Ici vous pourrez voir et gérer vos perks, bonus et promotions spéciales.
          </p>
        </section>
      </div>
    </main>
  );
}
