// src/app/lol/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';

// Rôles pour filtres de succès
const ROLES = ['Général', 'Top', 'Jungler', 'Mid', 'Bot', 'Supp'] as const;
type Role = typeof ROLES[number];

type Success = {
  id: number;
  role: Role;
  title: string | null;
  description: string | null;
  points: number;
};

type GameRecord = { points: number };

export default function LolPage() {
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<Role>('Général');
  const [searchTerm, setSearchTerm] = useState('');
  const [successes, setSuccesses] = useState<Success[]>([]);
  const [doneIds, setDoneIds] = useState<Set<number>>(new Set());
  const [playerName, setPlayerName] = useState('');
  const [character, setCharacter] = useState('');
  const [kills, setKills] = useState('');
  const [deaths, setDeaths] = useState('');
  const [assists, setAssists] = useState('');
  const [lastGamePoints, setLastGamePoints] = useState<number | null>(null);
  const [totalGamePoints, setTotalGamePoints] = useState(0);
  const [account, setAccount] = useState('');
  const [msg, setMsg] = useState('');
  const [subTotalLol, setSubTotalLol] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const userId = session.user.id;

      // 1. Charger succès
      const { data: rawSuccesses, error: sError } = await supabase
        .from('successes')
        .select('id, role, title, description, points')
        .eq('category', 'LoL')
        .order('points', { ascending: true });
      if (sError) console.error('Erreur fetch successes:', sError.message);
      else setSuccesses(rawSuccesses as Success[]);

      // 2. Succès validés
      const { data: rawUser, error: uError } = await supabase
        .from('user_successes')
        .select('success_id')
        .eq('user_id', userId);
      if (uError) console.error('Erreur fetch user_successes:', uError.message);
      else setDoneIds(new Set((rawUser as { success_id: number }[]).map(u => u.success_id)));

      // 3. Compte LoL
      const { data: accData } = await supabase
        .from('user_game_accounts')
        .select('account_name')
        .eq('user_id', userId)
        .eq('game', 'LoL')
        .maybeSingle();
      setAccount(accData?.account_name || '');

      // 4. Total points parties
      const { data: games, error: gError } = await supabase
        .from('game_records')
        .select('points')
        .eq('user_id', userId)
        .eq('game', 'LoL');
      if (gError) console.error('Erreur fetch game_records:', gError.message);
      else {
        const sumPoints = (games as GameRecord[]).reduce((sum, r) => sum + Math.max(r.points, 0), 0);
        setTotalGamePoints(sumPoints);
      }

      setLoading(false);
    })();
  }, []);

  // Recalcul et persistance sous-total
  useEffect(() => {
    const successPts = successes
      .filter(s => doneIds.has(s.id))
      .reduce((sum, s) => sum + s.points, 0);
    const total = successPts + totalGamePoints;
    setSubTotalLol(total);
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase
        .from('user_points')
        .upsert(
          { user_id: session.user.id, lol_points: total },
          { onConflict: 'user_id' }
        );
    })();
  }, [doneIds, totalGamePoints, successes]);

  // Toggle succès
  const toggleSuccess = async (suc: Success) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;
    if (doneIds.has(suc.id)) {
      await supabase
        .from('user_successes')
        .delete()
        .eq('user_id', userId)
        .eq('success_id', suc.id);
      setDoneIds(prev => {
        const n = new Set(prev);
        n.delete(suc.id);
        return n;
      });
    } else {
      await supabase
        .from('user_successes')
        .insert({ user_id: userId, success_id: suc.id });
      setDoneIds(prev => new Set(prev).add(suc.id));
    }
  };

  // Enregistrer partie
  const handleRecordGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const k = Number(kills) || 0;
    const d = Number(deaths) || 0;
    const a = Number(assists) || 0;
    const pts = Math.max(k - d / 2 + a * 0.65, 0);
    setLastGamePoints(pts);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    await supabase
      .from('game_records')
      .insert([{
        user_id: userId,
        player_first_name: playerName,
        character_name: character,
        k,
        d,
        assists: a,
        points: pts,
        game: 'LoL',
      }]);
    setTotalGamePoints(prev => prev + pts);
    setPlayerName(''); setCharacter(''); setKills(''); setDeaths(''); setAssists('');
  };

  // Sauvegarder compte
  const handleSaveAccount = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    await supabase
      .from('user_game_accounts')
      .upsert(
        { user_id: userId, game: 'LoL', account_name: account },
        { onConflict: 'user_id,game' }
      );

    setMsg('Nom de joueur enregistré !');
    setTimeout(() => setMsg(''), 3000);
  };

  // Filtrage sécurisé contre null
  const filtered = useMemo(() =>
    successes
      .filter(s => s.role === roleFilter)
      .filter(s => {
        const title = s.title ?? '';
        const desc = s.description ?? '';
        const term = searchTerm.toLowerCase();
        return title.toLowerCase().includes(term) || desc.toLowerCase().includes(term);
      }),
    [successes, roleFilter, searchTerm]
  );

  if (loading) {
    return (
      <PageLayout title="League of Legends – Succès">
        <p className="text-center text-white py-16">Chargement…</p>
      </PageLayout>
    );
  }

  return (
    <>
      {/* Fond LOL */}
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/lol-background.jpg')" }} />
      <header className="relative z-10 p-4 border-b-2 border-yellow-400 backdrop-blur-md bg-black/60">
        <h1 className="text-4xl font-bold text-yellow-300" style={{ fontFamily: 'Friz Quadrata, serif' }}>League of Legends – Réalisations et succès</h1>
      </header>
      <main className="relative z-10 flex flex-col md:flex-row gap-8 px-4 py-12 text-xl font-sans" style={{ fontFamily: 'Friz Quadrata, serif' }}>
        {/* Colonne gauche */}
        <div className="w-full md:basis-1/5 flex flex-col gap-8">
          {/* Section Enregistrement Partie */}
          <section className="bg-black/70 border-2 border-yellow-400 p-8 rounded-lg shadow-2xl backdrop-blur-md">
            <h2 className="text-2xl font-semibold text-yellow-300 mb-6">Enregistrer une partie récente</h2>
            <form onSubmit={handleRecordGame} className="space-y-6">
              <div>
                <label className="block text-yellow-200 mb-2">Prénom du joueur</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  required
                  placeholder="Ex : Alex"
                  className="w-full p-3 rounded bg-black/50 text-yellow-100 placeholder-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-yellow-200 mb-2">Champion joué</label>
                <input
                  type="text"
                  value={character}
                  onChange={e => setCharacter(e.target.value)}
                  required
                  placeholder="Ex : Ahri"
                  className="w-full p-3 rounded bg-black/50 text-yellow-100 placeholder-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-yellow-200 mb-2">Kills (K)</label>
                  <input
                    type="number"
                    value={kills}
                    onChange={e => setKills(e.target.value)}
                    min={0}
                    className="w-full p-3 rounded bg-black/50 text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-yellow-200 mb-2">Deaths (D)</label>
                  <input
                    type="number"
                    value={deaths}
                    onChange={e => setDeaths(e.target.value)}
                    min={0}
                    className="w-full p-3 rounded bg-black/50 text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-yellow-200 mb-2">Assists (A)</label>
                  <input
                    type="number"
                    value={assists}
                    onChange={e => setAssists(e.target.value)}
                    min={0}
                    className="w-full p-3 rounded bg-black/50 text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-br from-yellow-500 to-yellow-300 text-black font-bold rounded-lg shadow-lg transition hover:from-yellow-600 hover:to-yellow-400"
              >
                Enregistrer
              </button>
              <p className="mt-2 text-sm text-yellow-200">Points = K - (D/2) + (A × 0,65) (valeur minimale 0)</p>
            </form>
            {lastGamePoints !== null && (
              <p className="mt-4 text-yellow-300">Derniers points : <strong>+{lastGamePoints} pts</strong></p>
            )}
            <p className="mt-1 text-yellow-200">Total points parties : <strong>{totalGamePoints}</strong></p>
          </section>

          {/* Section Compte & Sous-total */}
          <section className="bg-black/70 border-2 border-yellow-400 p-6 rounded-lg shadow-2xl backdrop-blur-md">
            <label className="block text-sm font-medium text-yellow-200 mb-2">Nom de joueur LoL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={account}
                onChange={e => setAccount(e.target.value)}
                placeholder="Ex : Summoner#1234"
                className="flex-1 p-3 rounded bg-black/50 text-yellow-100 placeholder-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={handleSaveAccount}
                className="px-4 py-3 bg-gradient-to-br from-yellow-500 to-yellow-300 text-black font-bold rounded-lg shadow-lg transition hover:from-yellow-600 hover:to-yellow-400"
              >
                Sauvegarder
              </button>
            </div>
            {msg && <p className="mt-3 text-green-300">{msg}</p>}
            <p className="mt-4 text-yellow-200">Sous-total LoL : <strong>{subTotalLol} pts</strong></p>
          </section>
        </div>

        {/* Colonne droite – Succès LoL */}
        <section className="w-full md:basis-4/5 bg-black/70 border-2 border-yellow-400 p-8 rounded-xl shadow-2xl backdrop-blur-md overflow-auto">
          <h2 className="text-3xl font-semibold text-yellow-300 mb-4">Succès LoL</h2>
          <p className="text-yellow-200/70 mb-6">Connectez-vous pour voir ou valider les succès.</p>

          {/* Filtres Rôles */}
          <nav className="flex flex-wrap gap-2 mb-4">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-full font-medium ${
                  roleFilter === r
                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-300 text-black'
                    : 'bg-yellow-900/50 text-yellow-300'
                } shadow-sm transition`}
              >
                {r}
              </button>
            ))}
          </nav>

          {/* Recherche */}
          <input
            type="text"
            placeholder="Recherche…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full mb-6 p-3 rounded bg-black/50 text-yellow-100 placeholder-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          {/* Liste des Succès */}
          <ul className="space-y-4">
            {filtered.map(s => {
              const done = doneIds.has(s.id);
              return (
                <li
                  key={s.id}
                  className="flex items-start justify-between bg-black/60 p-4 rounded-lg border-l-4 border-yellow-400 shadow-inner"
                >
                  <div className="pr-4">
                    <h3 className="font-semibold text-yellow-300">{s.title}</h3>
                    <p className="text-sm text-yellow-200/70">{s.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-yellow-300 font-bold">+{s.points} pts</span>
                    <button
                      onClick={() => toggleSuccess(s)}
                      className={`px-4 py-2 rounded-lg font-semibold ${done ? 'bg-red-700 text-white' : 'bg-gradient-to-br from-yellow-500 to-yellow-300 text-black'} shadow`}
                    >
                      {done ? 'Annuler' : 'Valider'}
                    </button>
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="text-yellow-200/70 text-center py-6">Aucun succès correspondant.</li>
            )}
          </ul>
        </section>
      </main>
      <footer className="text-center py-4 bg-blue-900/80" style={{fontFamily:'Beaufort, serif'}}>
        <Link href="/achivements" className="text-hextech-blue hover:underline">← Retour catégories</Link>
      </footer>
    </>
  );
}