'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/lib/supabaseClient';

type Success = {
  id: number;
  title: string;
  description: string;
  points: number;
};
type UserSuccess = {
  success_id: number;
};

export default function ValorantPage() {
  const [loading, setLoading] = useState(true);

  // Succès & validation
  const [successes, setSuccesses] = useState<Success[]>([]);
  const [doneIds, setDoneIds] = useState<Set<number>>(new Set());

  // Total points parties
  const [totalGamePoints, setTotalGamePoints] = useState(0);

  // Enregistrement de la partie
  const [playerName, setPlayerName] = useState('');
  const [agent, setAgent] = useState('');
  const [kills, setKills] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [lastGamePoints, setLastGamePoints] = useState<number | null>(null);

  // Sous-total Valorant
  const [subTotalValorant, setSubTotalValorant] = useState(0);

  // Enregistrement du nom Valorant
  const [account, setAccount] = useState('');
  const [msg, setMsg] = useState('');

  const router = useRouter();

  // Chargement initial : session, parties, succès, validations
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const userId = session.user.id;

      // 1) Total points parties
      const { data: games, error: gameErr } = await supabase
        .from('game_records')
        .select('points')
        .eq('user_id', userId)
        .eq('game', 'Valorant');
      if (gameErr) console.error('Erreur fetch game_records :', gameErr.message);
      const gamesTotal = (games ?? []).reduce((sum, r) => sum + Math.max(r.points, 0), 0);
      setTotalGamePoints(gamesTotal);

      // 2) Charger les succès Valorant
      const { data: rawSuccesses, error: sError } = await supabase
        .from('successes')
        .select('*')
        .eq('category', 'Valorant');
      if (sError) {
        console.error('Erreur fetching successes :', sError.message);
      } else {
        setSuccesses(rawSuccesses!);
      }

      // 3) Succès validés
      const { data: rawUserSucc, error: usError } = await supabase
        .from('user_successes')
        .select('success_id')
        .eq('user_id', userId);
      if (usError) {
        console.error('Erreur fetching user_successes :', usError.message);
      } else {
        setDoneIds(new Set((rawUserSucc as UserSuccess[]).map(u => u.success_id)));
      }

      // 4) Calcul sous-total Valorant
      const successPts = (rawSuccesses ?? [])
        .filter(suc => doneIds.has(suc.id))
        .reduce((sum, suc) => sum + suc.points, 0);
      const valorantTotal = successPts + gamesTotal;
      setSubTotalValorant(valorantTotal);

      // 5) Upsert sous-total Valorant en BDD
      await supabase
        .from('user_points')
        .upsert(
          { user_id: userId, valorant_points: valorantTotal },
          { onConflict: 'user_id' }
        );

      setLoading(false);
    })();
  }, [doneIds]);

  // Valider ou annuler un succès
  const handleValidateSuccess = async (suc: Success) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase
      .from('user_successes')
      .insert({ user_id: session.user.id, success_id: suc.id });
    setDoneIds(prev => new Set(prev).add(suc.id));
  };

  const handleUnvalidateSuccess = async (suc: Success) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase
      .from('user_successes')
      .delete()
      .eq('user_id', session.user.id)
      .eq('success_id', suc.id);
    setDoneIds(prev => { const next = new Set(prev); next.delete(suc.id); return next; });
  };

  // Enregistrer une partie récente
  const handleRecordGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const delta = Math.max(kills - (deaths / 2), 0);
    setLastGamePoints(delta);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase
      .from('game_records')
      .insert([
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
    setTotalGamePoints(prev => prev + delta);
  };

  // Sauvegarder le nom Valorant
  const handleSaveAccount = async () => {
    const { data: { session } } = await supabase.auth.getSession();
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
    if (error) console.error('Erreur upsert account Valorant:', error.message);
    else {
      setMsg('Nom VALORANT enregistré !');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (loading) {
    return (
      <PageLayout
        title="Valorant – Réalisations & succès"
        bgClass="bg-gradient-to-br from-[#111214] via-[#1f1f20] to-[#111214]"
      >
        <p className="text-center text-white py-16">Chargement…</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Valorant – Réalisations & succès"
      bgClass="bg-gradient-to-br from-[#111214] via-[#1f1f20] to-[#111214]"
    >
      <div className="relative w-full flex flex-col md:flex-row gap-8 px-4 py-12">
        {/* Colonne gauche – Partie & compte */}
        <div className="w-full md:basis-2/5 flex flex-col gap-8">
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
                  onChange={e => setPlayerName(e.target.value)}
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
                  onChange={e => setAgent(e.target.value)}
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
                    onChange={e => setKills(+e.target.value)}
                    min={0}
                    className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-white mb-2">Deaths (D)</label>
                  <input
                    type="number"
                    value={deaths}
                    onChange={e => setDeaths(+e.target.value)}
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

          {/* Enregistrer nom Valorant */}
          <section className="bg-black bg-opacity-50 backdrop-blur-sm ring-2 ring-red-500 p-6 rounded-xl shadow-xl">
            <h3 className="text-2xl font-medium text-red-400 mb-4">
              Nom de joueur VALORANT
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={account}
                onChange={e => setAccount(e.target.value)}
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

          {/* Nouveau : Sous-total Valorant */}
          <section className="bg-black bg-opacity-50 backdrop-blur-sm ring-2 ring-red-500 p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-medium text-red-400 mb-2">
              Sous-total Valorant
            </h3>
            <p className="text-2xl font-bold text-white">{subTotalValorant} pts</p>
          </section>
        </div>

        {/* Colonne droite – Succès */}
        <section className="w-full md:basis-3/5 bg-black bg-opacity-50 backdrop-blur-sm ring-2 ring-red-500 p-8 rounded-xl shadow-xl overflow-auto">
          <h2 className="text-3xl font-semibold text-red-400 mb-6">
            Succès VALORANT
          </h2>
          <h3>Connectez vous pour voir ou valider les succès.</h3>
          <ul className="space-y-4">
            {successes.map(suc => {
              const done = doneIds.has(suc.id);
              return (
                <li
                  key={suc.id}
                  className="flex items-start justify-between bg-gray-800 p-4 rounded-lg"
                >
                  <div className="pr-4">
                    <h3 className="font-semibold text-white">{suc.title}</h3>
                    <p className="text-sm text-gray-400">{suc.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-red-400 font-bold">+{suc.points} pts</span>
                    {done ? (
                      <button
                        onClick={() => handleUnvalidateSuccess(suc)}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        Annuler
                      </button>
                    ) : (
                      <button
                        onClick={() => handleValidateSuccess(suc)}
                        className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
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
    </PageLayout>
  );
}
