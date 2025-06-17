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

  useEffect(() => {
    (async () => {
      // 0) Session
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session) {
        setLoading(false);
        return;
      }
      const userId = session.user.id;

      // 1) Charger tous les succès LoL
      const { data: rawSuccesses, error: sError } = await supabase
        .from('successes')
        .select('*')
        .eq('category', 'LoL')
        .order('points', { ascending: true });
      if (sError) {
        console.error('Erreur fetching successes :', sError.message);
        setSuccesses([]);
      } else {
        setSuccesses(rawSuccesses!);
      }

      // 2) Charger les succès validés
      const { data: rawUser, error: usError } = await supabase
        .from('user_successes')
        .select('success_id')
        .eq('user_id', userId);
      if (usError) {
        console.error('Erreur fetching user_successes :', usError.message);
        setDoneIds(new Set());
      } else {
        const doneSet = new Set(rawUser!.map((u: UserSuccess) => u.success_id));
        setDoneIds(doneSet);
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

      // 4) Total points parties
      const { data: games, error: gameErr } = await supabase
        .from('game_records')
        .select('points')
        .eq('user_id', userId)
        .eq('game', 'LoL');
      let gamesTotal = 0;
      if (gameErr) {
        console.error('Erreur fetch game_records :', gameErr.message);
      } else {
        gamesTotal = (games ?? []).reduce(
          (sum, rec) => sum + Math.max(rec.points, 0),
          0
        );
      }
      setTotalGamePoints(gamesTotal);

      // --- Calcul sous-total LoL ---
      const successPts = rawSuccesses
        ?.filter(s => doneIds.has(s.id))
        .reduce((sum, s) => sum + s.points, 0) || 0;
      const lolTotal = successPts + gamesTotal;

      // Upsert sub-total LoL en base
      await supabase
        .from('user_points')
        .upsert(
          { user_id: userId, lol_points: lolTotal },
          { onConflict: 'user_id' }
        );

      setLoading(false);
    })();
  }, [doneIds]);

  // Validation succès / annulation... (inchangé)
  const handleValidate = async (suc: Success) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('user_successes')
      .insert({ user_id: session.user.id, success_id: suc.id });
    setDoneIds(prev => new Set(prev).add(suc.id));
  };

  const handleUnvalidate = async (suc: Success) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('user_successes')
      .delete()
      .eq('user_id', session.user.id)
      .eq('success_id', suc.id);
    setDoneIds(prev => {
      const next = new Set(prev);
      next.delete(suc.id);
      return next;
    });
  };

  const handleRecordGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const delta = Math.max(kills - deaths / 2, 0);
    setLastGamePoints(delta);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('game_records')
      .insert([
        { user_id: session.user.id, game: 'LoL', points: delta }
      ]);

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

          {/* Nouveau : Sous-total LoL */}
<section className="bg-bg-mid p-6 rounded-lg shadow-lg">
  <h2 className="text-lg font-semibold text-white mb-2">Sous-total LoL</h2>
  <p className="text-2xl font-bold text-white">
    {/* Additionne ici tes points de succès validés + totalGamePoints */}
    {doneIds.size > 0
      ? Array.from(doneIds).reduce(
          (sum, id) =>
            sum +
            (successes.find(suc => suc.id === id)?.points || 0),
          totalGamePoints
        )
      : totalGamePoints
    } pts
  </p>
</section>

        </div>

        {/* Colonne droite – Succès */}
        <section className="w-full md:basis-4/5 bg-bg-mid p-8 rounded-xl shadow-xl overflow-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
            Succès LoL
          </h2>
          <h3>Connectez vous pour voir ou valider les succès.</h3>
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
