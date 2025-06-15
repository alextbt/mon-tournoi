// src/app/achivements/gaming/lol/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';

type Success = {
  id: number;
  category: string;
  title: string;
  description: string;
  points: number;
};
type UserSuccess = { success_id: number };

export default function LolPage() {
  const [loading, setLoading] = useState(true);

  // Succès et état
  const [successes, setSuccesses] = useState<Success[]>([]);
  const [doneIds, setDoneIds] = useState<Set<number>>(new Set());

  // Compte LoL
  const [account, setAccount] = useState('');
  const [msg, setMsg] = useState('');

  // Enregistrement de parties
  const [playerName, setPlayerName] = useState('');
  const [character, setCharacter] = useState('');
  const [kills, setKills] = useState<number>(0);
  const [deaths, setDeaths] = useState<number>(0);
  const [lastGamePoints, setLastGamePoints] = useState<number | null>(null);
  const [totalGamePoints, setTotalGamePoints] = useState<number>(0);

  // Ajuster total points
  const adjustPoints = async (delta: number) => {
    const { data: { session } } = await supabase.auth.getSession();
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
      .upsert(
        { user_id: userId, total_points: newTotal },
        { onConflict: 'user_id', returning: 'minimal' }
      );
  };

  // Chargement initial
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const userId = session.user.id;

      // 1) Succès LoL
      const { data: rawSuccesses } = await supabase
        .from('successes')
        .select('*')
        .eq('category', 'LoL')
        .order('points', { ascending: true });
      setSuccesses(rawSuccesses || []);

      // 2) Succès validés
      const { data: rawUser } = await supabase
        .from('user_successes')
        .select('success_id')
        .eq('user_id', userId);
      setDoneIds(new Set((rawUser || []).map((u: UserSuccess) => u.success_id)));

      // 3) Compte LoL
      const { data: accData } = await supabase
        .from('user_game_accounts')
        .select('account_name')
        .eq('user_id', userId)
        .eq('game', 'LoL')
        .maybeSingle();
      setAccount(accData?.account_name ?? '');

        // 4) Total points parties
      const { data: games } = await supabase
        .from('achievements')
        .select('points')
        .eq('game', 'LoL')
        .eq('user_id', userId);
      const total = (games || []).reduce((sum, g) => sum + Math.max(g.points, 0), 0);
      setTotalGamePoints(total);
      setLoading(false);
    })();
  }, []);

  // Valider / annuler succès
  const handleValidate = async (suc: Success) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('user_successes').insert({
      user_id: session.user.id,
      success_id: suc.id,
    });
    await adjustPoints(suc.points);
    setDoneIds((prev) => new Set(prev).add(suc.id));
  };
  const handleUnvalidate = async (suc: Success) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase
      .from('user_successes')
      .delete()
      .eq('user_id', session.user.id)
      .eq('success_id', suc.id);
    await adjustPoints(-suc.points);
    setDoneIds((prev) => {
      const next = new Set(prev);
      next.delete(suc.id);
      return next;
    });
  };

  // Enregistrer une partie
  const handleRecordGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const delta = Math.max(kills - deaths, 0);
    setLastGamePoints(delta);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('achievements').insert([
      {
        user_id: session.user.id,
        game: 'LoL',
        player_first_name: playerName,
        character_name: character,
        k: kills,
        d: deaths,
        points: delta,
      },
    ]);

    setTotalGamePoints((prev) => prev + delta);
  };

  if (loading) {
    return (
      <PageLayout title="League of Legends – Réalisations & succès">
        <p className="text-center text-white py-16">Chargement…</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="League of Legends – Réalisations & succès">
      <div className="flex flex-col md:flex-row gap-8 px-4 py-12">
        {/* Colonne gauche – occupe plus d’espace */}
        <div className="w-full md:w-1/2 flex flex-col gap-8">
          {/* Enregistrer une partie récente */}
          <section className="bg-bg-mid p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-6">
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
                  className="w-full p-3 rounded bg-bg-light text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Personnage joué</label>
                <input
                  type="text"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  required
                  placeholder="Ex : Ahri"
                  className="w-full p-3 rounded bg-bg-light text-white focus:outline-none"
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
                    className="w-full p-3 rounded bg-bg-light text-white focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-white mb-2">Deaths (D)</label>
                  <input
                    type="number"
                    value={deaths}
                    onChange={(e) => setDeaths(+e.target.value)}
                    min={0}
                    className="w-full p-3 rounded bg-bg-light text-white focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-accent-purple hover:bg-accent-purple/90 text-white font-semibold rounded-lg transition"
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

          {/* Interface du compte LoL */}
          <section className="bg-bg-mid p-6 rounded-lg shadow-lg">
            <label className="block text-sm font-medium text-white mb-2">
              Nom de joueur LoL
            </label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="Ex : Summoner#1234"
              className="w-full p-3 rounded bg-bg-light text-white focus:outline-none mb-4"
            />
            <button
              onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const { error: upErr } = await supabase
                  .from('user_game_accounts')
                  .upsert(
                    { user_id: session.user.id, game: 'LoL', account_name: account },
                    { onConflict: 'user_id,game' }
                  );
                if (upErr) console.error(upErr.message);
                else {
                  setMsg('Nom de joueur enregistré !');
                  setTimeout(() => setMsg(''), 2500);
                }
              }}
              className="w-full py-3 bg-accent-blue hover:bg-accent-blue/80 text-white font-semibold rounded-lg transition"
            >
              Sauvegarder
            </button>
            {msg && <p className="mt-3 text-green-300">{msg}</p>}
          </section>
        </div>

        {/* Colonne droite – Succès (1/2 écran) */}
        <section className="w-full md:w-1/2 bg-bg-mid p-6 rounded-lg shadow-lg overflow-auto">
          <h2 className="text-2xl font-semibold text-white mb-4">Succès LoL</h2>
          <ul className="space-y-4">
            {successes.map((suc) => {
              const done = doneIds.has(suc.id);
              return (
                <li
                  key={suc.id}
                  className="flex items-start justify-between bg-bg-light p-4 rounded-lg"
                >
                  <div className="pr-4">
                    <h3 className="font-semibold text-white">{suc.title}</h3>
                    <p className="text-sm text-white/70">{suc.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-accent-pink font-bold">+{suc.points} pts</span>
                    {done ? (
                      <button
                        onClick={() => handleUnvalidate(suc)}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        Annuler
                      </button>
                    ) : (
                      <button
                        onClick={() => handleValidate(suc)}
                        className="px-4 py-2 rounded bg-accent-purple text-white hover:bg-accent-purple/80 transition"
                      >
                        Valider
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="text-center mt-8">
        <Link href="/achivements" className="btn-nav">
          ← Retour aux catégories
        </Link>
      </div>
    </PageLayout>
  );
}
