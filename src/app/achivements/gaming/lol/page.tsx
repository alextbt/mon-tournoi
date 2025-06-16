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

  // Ajuste le total de points dans user_points
  const adjustPoints = async (delta: number) => {
    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession();
    if (sessionErr) {
      console.error('Erreur session Supabase :', sessionErr.message);
      return;
    }
    if (!session) return;
    const userId = session.user.id;

    const { data: ptsData, error: fetchErr } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', userId)
      .maybeSingle();
    if (fetchErr) {
      console.error('Erreur fetch user_points :', fetchErr.message);
      return;
    }
    const oldTotal = ptsData?.total_points ?? 0;
    const newTotal = oldTotal + delta;

    const { error: upsertErr } = await supabase
      .from('user_points')
      .upsert(
        { user_id: userId, total_points: newTotal },
        { onConflict: 'user_id' }
      );
    if (upsertErr) {
      console.error('Erreur upserting user_points :', upsertErr.message);
    }
  };

  // Chargement initial : succès, validation, compte, total parties
  useEffect(() => {
  (async () => {
    // 0) Récupère la session
    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession();
    if (sessionErr) {
      console.error('Erreur session Supabase :', sessionErr.message);
      setLoading(false);
      return;
    }
    if (!session) {
      setLoading(false);
      return;
    }
    const userId = session.user.id;

      // 1) Succès LoL
      const { data: rawSuccesses, error: sError } = await supabase
        .from('successes')
        .select('*')
        .eq('category', 'LoL')
        .order('points', { ascending: true });
      if (sError) {
        console.error('Erreur fetching successes :', sError.message);
        setSuccesses([]);
      } else {
        setSuccesses(rawSuccesses);
      }

      // 2) Succès validés
      const { data: rawUser, error: usError } = await supabase
        .from('user_successes')
        .select('success_id')
        .eq('user_id', userId);
      if (usError) {
        console.error('Erreur fetching user_successes :', usError.message);
        setDoneIds(new Set());
      } else {
        setDoneIds(new Set(rawUser.map((u: UserSuccess) => u.success_id)));
      }

      // 3) Compte LoL
      const { data: accData, error: accErr } = await supabase
        .from('user_game_accounts')
        .select('account_name')
        .eq('user_id', userId)
        .eq('game', 'LoL')
        .maybeSingle();
      if (accErr) console.error('Erreur fetch user_game_accounts :', accErr.message);
      setAccount(accData?.account_name ?? '');

          // 4) Total points parties — on interroge bien `game_records`
    const { data: games, error: gameErr } = await supabase
      .from('game_records')      // <-- Assure-toi que la table s'appelle exactement “game_records”
      .select('points')
      .eq('user_id', userId);    // <-- Assure-toi que la colonne est bien “user_id” dans cette table

    if (gameErr) {
      console.error('Erreur fetch game_records :', gameErr.message);
      setTotalGamePoints(0);
    } else {
      // On sait que `games` est Array<{ points: number }>
      const total = (games ?? []).reduce(
        (sum, record) => sum + Math.max(record.points, 0),
        0
      );
      setTotalGamePoints(total);
    }

    setLoading(false);
  })();
}, []);

  // Valider un succès
  const handleValidate = async (suc: Success) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { error: insErr } = await supabase
      .from('user_successes')
      .insert({ user_id: session.user.id, success_id: suc.id });
    if (insErr) {
      console.error('Erreur insertion user_successes :', insErr.message);
      return;
    }

    await adjustPoints(suc.points);
    setDoneIds(prev => new Set(prev).add(suc.id));
  };

  // Annuler un succès
  const handleUnvalidate = async (suc: Success) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { error: delErr } = await supabase
      .from('user_successes')
      .delete()
      .eq('user_id', session.user.id)
      .eq('success_id', suc.id);
    if (delErr) {
      console.error('Erreur delete user_successes :', delErr.message);
      return;
    }

    await adjustPoints(-suc.points);
    setDoneIds(prev => {
      const next = new Set(prev);
      next.delete(suc.id);
      return next;
    });
  };

  // Enregistrer une partie récente
  const handleRecordGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const delta = Math.max(kills - (deaths / 2), 0);
    setLastGamePoints(delta);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { error: recErr } = await supabase
      .from('game_records')               // <— remplacer `achievements`
      .insert([
        {
          user_id: session.user.id,
          player_first_name: playerName,
          character_name: character,
          k: kills,
          d: deaths,
          points: delta,
        },
      ]);
    if (recErr) console.error('Erreur insertion game_records :', recErr.message);

    setTotalGamePoints(prev => prev + delta);
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
      <div className="w-full flex flex-col md:flex-row gap-8 px-4 py-12">
        {/* Colonne gauche */}
        <div className="w-full md:basis-1/5 flex flex-col gap-8">
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
                  onChange={e => setPlayerName(e.target.value)}
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
                  onChange={e => setCharacter(e.target.value)}
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
                    onChange={e => setKills(+e.target.value)}
                    min={0}
                    className="w-full p-3 rounded bg-bg-light text-white focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-white mb-2">Deaths (D)</label>
                  <input
                    type="number"
                    value={deaths}
                    onChange={e => setDeaths(+e.target.value)}
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
              Points = <code>K–(D/2)</code> (seules les valeurs positives sont ajoutées).
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
              onChange={e => setAccount(e.target.value)}
              placeholder="Ex : Summoner#1234"
              className="w-full p-3 rounded bg-bg-light text-white focus:outline-none mb-4"
            />
            <button
              onClick={async () => {
                const {
                  data: { session },
                } = await supabase.auth.getSession();
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

        {/* Colonne droite – Succès */}
        <section className="w-full md:basis-4/5 bg-bg-mid p-8 rounded-xl shadow-xl overflow-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
            Succès LoL
          </h2>
          <ul className="space-y-4">
            {successes.map(suc => {
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
                    <span className="text-accent-pink font-bold">
                      +{suc.points} pts
                    </span>
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
