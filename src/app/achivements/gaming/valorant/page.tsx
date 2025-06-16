// src/app/achivements/gaming/valorant/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/lib/supabaseClient';

export default function ValorantPage() {
  const [loading, setLoading] = useState(true);

  // Récupération total parties
  const [totalGamePoints, setTotalGamePoints] = useState(0);

  // Enregistrement de la partie
  const [playerName, setPlayerName] = useState('');
  const [agent, setAgent] = useState('');
  const [kills, setKills] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [lastGamePoints, setLastGamePoints] = useState<number | null>(null);

  // Enregistrement du nom Valorant
  const [account, setAccount] = useState('');
  const [msg, setMsg] = useState('');

  const router = useRouter();

  // Ajuste le total de points dans user_points
  const adjustPoints = async (delta: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    const { data: ptsData } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', userId)
      .maybeSingle();
    const oldTotal = ptsData?.total_points ?? 0;
    const newTotal = oldTotal + delta;

    await supabase
      .from('user_points')
      .upsert({ user_id: userId, total_points: newTotal }, { onConflict: 'user_id' });
  };

  // Chargement initial du total points parties
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const userId = session.user.id;

      // Total points sur game_records pour Valorant
      const { data: games } = await supabase
        .from('game_records')
        .select('points')
        .eq('user_id', userId)
        .eq('game', 'Valorant');
      const total = (games ?? []).reduce((sum, r) => sum + Math.max(r.points, 0), 0);
      setTotalGamePoints(total);

      setLoading(false);
    })();
  }, []);

  // Enregistrer une partie récente
  const handleRecordGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const delta = Math.max(kills - deaths, 0);
    setLastGamePoints(delta);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('game_records').insert([
      {
        user_id: session.user.id,
        player_first_name: playerName,
        character_name: agent,
        k: kills,
        d: deaths,
        points: delta,
        game: 'Valorant',
      },
    ]);

    await adjustPoints(delta);
  };

  // Sauvegarder le nom Valorant
  const handleSaveAccount = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/login');
      return;
    }

    const { error } = await supabase
      .from('user_game_accounts')
      .upsert(
        { user_id: session.user.id, game: 'Valorant', account_name: account },
        { onConflict: 'user_id,game' }
      );
    if (error) {
      console.error('Erreur upsert account Valorant:', error.message);
    } else {
      setMsg('Nom VALORANT enregistré !');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (loading) {
    return (
      <PageLayout
        title="Valorant – Réalisations & succès"
        bgClass={`
          bg-gradient-to-br from-[#111214] via-[#1f1f20] to-[#111214]
        `}
      >
        <p className="text-center text-white py-16">Chargement…</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Valorant – Réalisations & succès"
      bgClass={`
        bg-gradient-to-br from-[#111214] via-[#1f1f20] to-[#111214]
      `}
    >
      <div className="relative z-10 w-full flex flex-col md:flex-row gap-8 px-4 py-12">
        {/* Colonne gauche – Enregistrer partie & compte */}
        <div className="w-full md:basis-3/5 flex flex-col gap-8">
          {/* Enregistrer une partie récente */}
          <section className="bg-black bg-opacity-50 backdrop-blur-sm ring-2 ring-red-500 p-8 rounded-xl shadow-xl">
            <h2 className="text-3xl font-semibold text-red-400 mb-6">
              Enregistrer une partie récente
            </h2>
            <form onSubmit={handleRecordGame} className="space-y-6">
              <div>
                <label className="block text-white mb-2">Prénom du joueur</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                  placeholder="Ex : Alex"
                  className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Agent joué</label>
                <input
                  type="text"
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  required
                  placeholder="Ex : Jett"
                  className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-white mb-2">Kills (K)</label>
                  <input
                    type="number"
                    value={kills}
                    onChange={(e) => setKills(+e.target.value)}
                    min={0}
                    className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-white mb-2">Deaths (D)</label>
                  <input
                    type="number"
                    value={deaths}
                    onChange={(e) => setDeaths(+e.target.value)}
                    min={0}
                    className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
              >
                Enregistrer la partie
              </button>
            </form>
            <p className="mt-4 text-white/70 text-sm">
              Points = <code>K – D</code> (seules les valeurs positives sont ajoutées).
            </p>
            {lastGamePoints !== null && (
              <p className="mt-3 text-white">
                Dernière partie : <strong>+{lastGamePoints} pts</strong>
              </p>
            )}
            <p className="mt-1 text-white/80">
              Total points parties : <strong>{totalGamePoints}</strong>
            </p>
          </section>

          {/* Enregistrer nom Valorant */}
          <section className="bg-black bg-opacity-50 backdrop-blur-sm ring-2 ring-red-500 p-6 rounded-xl shadow-xl">
            <h3 className="text-2xl font-medium text-red-400 mb-4">
              Nom de joueur VALORANT
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="Ex : Jett#1234"
                className="flex-1 p-3 rounded bg-gray-800 text-white focus:outline-none"
              />
              <button
                onClick={handleSaveAccount}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
              >
                Sauvegarder
              </button>
            </div>
            {msg && <p className="mt-3 text-red-300">{msg}</p>}
          </section>
        </div>

        {/* Colonne droite – Succès (à venir) */}
        <section className="w-full md:basis-2/5 bg-black bg-opacity-50 backdrop-blur-sm ring-2 ring-red-500 p-8 rounded-xl shadow-xl">
          <h2 className="text-3xl font-semibold text-red-400 mb-6">
            Succès VALORANT
          </h2>
          <p className="text-white/70">Les succès arrivent bientôt !</p>
        </section>
      </div>
    </PageLayout>
  );
}
