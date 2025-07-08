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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const userId = session.user.id;

      const { data: ptsData } = await supabase
        .from('user_points')
        .select(
          `
          lol_points,
          valorant_points,
          chess_points,
          escalade_points,
          musculation_points,
          cyclisme_points,
          course_points,
          event_points,
          achievements_points,
          esports_points,
          sport_points,
          total_points
        `)
        .eq('user_id', userId)
        .maybeSingle();

      const {
        lol_points = 0,
        valorant_points = 0,
        chess_points = 0,
        escalade_points = 0,
        musculation_points = 0,
        cyclisme_points = 0,
        course_points = 0,
        event_points = 0,
        achievements_points = 0,
        esports_points = 0,
        sport_points = 0,
        total_points = 0,
      } = ptsData || {};

      // Sous-totaux
      setSubTotalEsport(esports_points);
      setSubTotalSport(sport_points);
      setSubTotalEvents(event_points);
      setSubTotalAchievements(achievements_points);
      setTotalPoints(total_points);

      // Détail points
      setBreakdown([
        { category: 'LoL', points: lol_points },
        { category: 'Valorant', points: valorant_points },
        { category: 'Échecs', points: chess_points },
        { category: 'Musculation', points: musculation_points },
        { category: 'Escalade', points: escalade_points },
        { category: 'Cyclisme', points: cyclisme_points },
        { category: 'Course', points: course_points },
      ]);

      // Profil
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

      // Réalisations
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
          list.push({ id: p.id, title: p.achievement, points: 0, achieved_at: p.created_at, status: 'pending' });
        }
      });
      processed?.forEach(p => {
        list.push({ id: p.id, title: p.achievement, points: p.points, achieved_at: p.achieved_at, status: p.result === 'accepted' ? 'accepted' : 'refused' });
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
  <main className="bg-dusk min-h-screen py-8 px-4 sm:px-6 lg:px-32">
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header utilisateur */}
      <div className="p-6 bg-white/15 backdrop-blur-md rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{firstName}</h1>
          <span className="text-white/80">|</span>
          <select
            value={profileStyle}
            onChange={handleStyleChange}
            className="bg-black/50 text-white placeholder-white/70 px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white/60 backdrop-blur-sm"
          >
            <option className="bg-black/80 text-white" value="Joueur">Joueur</option>
            <option className="bg-black/80 text-white" value="Sportif">Sportif</option>
            <option className="bg-black/80 text-white" value="Éthéré">Éthéré (si débloqué)</option>
            <option className="bg-black/80 text-white" value="Festif">Festif (si débloqué)</option>
            <option className="bg-black/80 text-white" value="Divin">Divin (si débloqué)</option>
            <option className="bg-black/80 text-white" value="Aucune modification">Aucune modification</option>
          </select>
        </div>
        <button
          onClick={handleLogout}
          className="bg-pink-500/80 hover:bg-pink-500 text-white font-medium px-5 py-2 rounded-full transition"
        >
          Déconnexion
        </button>
      </div>

      {/* Total général — mise en avant */}
      <div className="mx-auto w-full sm:w-1/2 lg:w-1/3 p-8 bg-pink-500/80 backdrop-blur-sm rounded-2xl shadow-2xl text-center text-white">
        <p className="text-sm uppercase tracking-widest">Total</p>
        <p className="mt-2 text-5xl md:text-6xl font-extrabold">{totalPoints}</p>
      </div>

      {/* Sous-totaux */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg text-center">
        {[
          { label: 'eSport', value: subTotalEsport },
          { label: 'Sport', value: subTotalSport },
          { label: 'Événements', value: subTotalEvents },
          { label: 'Réalisations', value: subTotalAchievements },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-sm text-white/70">{label}</p>
            <p className="mt-1 text-2xl md:text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Points par catégorie */}
      <section className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold text-white">Points par catégorie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 sm:gap-6">
          {breakdown.map(item => (
            <div
              key={item.category}
              className="p-4 sm:p-6 bg-white/5 hover:bg-white/10 transition rounded-lg text-center"
            >
              <p className="font-medium text-sm sm:text-base text-white">{item.category}</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-white">{item.points} pts</p>
            </div>
          ))}
        </div>
      </section>

      {/* Réalisations */}
      <section className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold text-white">Réalisations</h2>
        {achievements.length === 0 ? (
          <p className="text-white/70">Aucune réalisation.</p>
        ) : (
          <ul className="space-y-4">
            {achievements.map(a => (
              <li
                key={`${a.status}-${a.id}`}
                className="flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 transition rounded-xl"
              >
                <div>
                  <p className={
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
                    le {new Date(a.achieved_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={
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
      <section className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">Avantages spéciaux</h2>
        <p className="text-white/70">
          Ici vous pourrez voir et gérer vos perks, bonus et promotions spéciales.
        </p>
      </section>
    </div>
  </main>
);
}