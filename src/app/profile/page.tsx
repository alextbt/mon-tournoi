'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type UAchievementRow = {
  achievement_id: number;
  achievements: {
    title: string;
    points: number;
  };
  achieved_at: string;
};

type ProfileAchievement = {
  id: number;
  title: string;
  points: number;
  achieved_at: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [points, setPoints] = useState(0);
  const [achievements, setAchievements] = useState<ProfileAchievement[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // 1. Vérifier la session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      const user = session.user;
      setEmail(user.email ?? '');

      // 2. Récupérer les points
      const { data: ptsData, error: ptsError } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', user.id)
        .single();

      if (ptsError) {
        console.error('Erreur points:', ptsError.message);
      }
      // on force le typage ici
      const total = (ptsData as { total_points: number } | null)?.total_points ?? 0;
      setPoints(total);

      // 3. Récupérer les réalisations validées
      const { data: doneData, error: uaError } = await supabase
        .from('user_achievements')
        .select('achievement_id, achieved_at, achievements ( title, points )')
        .eq('user_id', user.id);

      if (uaError) {
        console.error('Erreur réalisations:', uaError.message);
      }

      // on cast le résultat brut en UAchievementRow[]
      const rows = (doneData as UAchievementRow[] | null) ?? [];

      // mapping vers le type d'affichage
      setAchievements(
        rows.map((ua) => ({
          id: ua.achievement_id,
          title: ua.achievements.title,
          points: ua.achievements.points,
          achieved_at: ua.achieved_at,
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
    <div className="relative max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profil de {email}</h1>
      <p className="mb-4">Points cumulés : <strong>{points}</strong></p>

      <h2 className="text-xl font-semibold mb-2">Réalisations validées</h2>
      {achievements.length === 0 ? (
        <p>Aucune réalisation pour l’instant.</p>
      ) : (
        <ul className="list-disc list-inside space-y-1 mb-8">
          {achievements.map((a) => (
            <li key={a.id}>
              {a.title} (+{a.points} pts) — le{' '}
              {new Date(a.achieved_at).toLocaleDateString('fr-FR')}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleLogout}
        className="absolute bottom-4 right-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
      >
        Déconnexion
      </button>
    </div>
  );
}
