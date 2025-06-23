/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';

interface Profile {
  username: string;
  avatar?: string;
}

interface RecordStats {
  win: number;
  loss: number;
  draw: number;
}

interface Stats {
  last?: { rating?: number };
  best?: { rating?: number };
  record?: RecordStats;
}

type StatsResponse = Record<string, Stats>;

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  points: number;
};

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  check: (stats: StatsResponse) => boolean;
  points: number;
}

const achievementDefs: AchievementDef[] = [
  { 
    id: 'first_game', 
    title: 'Première partie', 
    description: 'Jouer votre première partie',
    check: (stats: StatsResponse) =>
      Object.entries(stats).some(([, s]) =>
        (s.record?.win ?? 0) + (s.record?.loss ?? 0) + (s.record?.draw ?? 0) >= 1
      ),
    points: 5,
  },
  { 
    id: 'first_win',
    title: 'Première victoire',
    description: 'Gagner votre première partie',
    check: (stats: StatsResponse) =>
      Object.entries(stats).some(([, s]) => (s.record?.win ?? 0) >= 1),
    points: 10,
  },
  // Paliers de rating avec points personnalisés
  ...[
    { r: 500, pts: 25 },
    { r: 750, pts: 60 },
    { r: 1000, pts: 100 },
    { r: 1500, pts: 150 },
    { r: 2000, pts: 200 },
    { r: 2250, pts: 225 },
    { r: 2500, pts: 250 },
    { r: 3000, pts: 300 },
  ].map(({ r, pts }) => ({
    id: `reach_${r}`,
    title: `${r} atteint`,
    description: `Atteindre un score ≥ ${r} dans n'importe quel format`,
    check: (stats: StatsResponse) =>
      Object.values(stats).some(s => (s.last?.rating ?? 0) >= r),
    points: pts,
  })),
  // Parties totales jouées avec points variables
  ...[
    { n: 10, pts: 15 },
    { n: 25, pts: 35 },
    { n: 50, pts: 50 },
    { n: 125, pts: 90 },
    { n: 250, pts: 150 },
    { n: 500, pts: 260 },
    { n: 1000, pts: 375 },
    { n: 5000, pts: 750 },
    { n: 7500, pts: 1000 },
  ].map(({ n, pts }) => ({
    id: `games_${n}`,
    title: `Jouez ${n} parties`,
    description: `Jouez ${n} parties au total`,
    check: (stats: StatsResponse) =>
      Object.values(stats).reduce(
        (sum, s) =>
          sum + ((s.record?.win ?? 0) + (s.record?.loss ?? 0) + (s.record?.draw ?? 0)),
        0
      ) >= n,
    points: pts,
  })),
  // Problèmes résolus avec points personnalisés
  ...[
    { n: 10, pts: 5 },
    { n: 25, pts: 7 },
    { n: 50, pts: 10 },
    { n: 100, pts: 20 },
    { n: 200, pts: 30 },
    { n: 350, pts: 45 },
    { n: 500, pts: 55 },
    { n: 750, pts: 65 },
    { n: 1000, pts: 75 },
  ].map(({ n, pts }) => ({
    id: `puzzles_${n}`,
    title: `${n} problèmes résolus`,
    description: `Résolvez ${n} problèmes`,
    check: (stats: StatsResponse) =>
      (stats['tactics']?.record?.win ?? 0) >= n,     // ← un seul argument, plus d'erreur TS
    points: pts,
  })),
  // Ligues avec points distincts
  ...[
    { id: 'league_bronze',   title: 'Ligue Bronze',   min: 1200, pts: 10 },
    { id: 'league_silver',   title: 'Ligue Argent',   min: 1400, pts: 15 },
    { id: 'league_crystal',  title: 'Ligue Cristal',  min: 1600, pts: 20 },
    { id: 'league_elite',    title: 'Ligue Elite',    min: 1800, pts: 25 },
    { id: 'league_champion', title: 'Ligue Champion', min: 2000, pts: 30 },
    { id: 'league_legend',   title: 'Ligue Légende',  min: 2200, pts: 35 },
  ].map(({ id, title, min, pts }) => ({
    id,
    title,
    description: `Atteindre ${title}`,
    check: (stats: StatsResponse) =>
      Object.values(stats).some(s => (s.last?.rating ?? 0) >= min),
    points: pts,
  })),
  // Tous les formats
  {
    id: 'all_formats',
    title: 'Tous les formats',
    description: 'Jouer au moins une partie dans tous les formats',
    check: (stats: StatsResponse) =>
      ['chess_bullet', 'chess_blitz', 'chess_rapid', 'chess_daily'].every(k => {
        const r = stats[k]?.record;
        return (r?.win ?? 0) + (r?.loss ?? 0) + (r?.draw ?? 0) >= 1;
      }),
    points: 10,
  },
];

const achievementsFns = achievementDefs.map(def =>
  (_profile: Profile, stats: StatsResponse): Achievement => ({
    id: def.id,
    title: def.title,
    description: def.description,
    unlocked: def.check(stats),
    points: def.points,
  })
);

export default function ChessPage() {
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [partyPoints, setPartyPoints] = useState<number>(0);
  const [achievementPoints, setAchievementPoints] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false)

  // fetch de base : profil et stats
  async function fetchProfile(user: string): Promise<Profile> {
    const res = await fetch(`https://api.chess.com/pub/player/${user}`);
    if (!res.ok) throw new Error('Profil introuvable');
    return res.json();
  }
  async function fetchStats(user: string): Promise<StatsResponse> {
    const res = await fetch(`https://api.chess.com/pub/player/${user}/stats`);
    if (!res.ok) throw new Error('Statistiques introuvables');
    return res.json();
  }

  // fetch des puzzles
  async function fetchPuzzlesSolved(user: string): Promise<number> {
    const res = await fetch(`https://api.chess.com/pub/player/${user}/stats/puzzles`);
    if (!res.ok) throw new Error('Problèmes introuvables');
    const data = await res.json();
    return data.record?.win ?? data.total_solved ?? 0;
  }

  function computePartyPoints(st: StatsResponse): number {
    return Object.entries(st)
      .filter(([key]) => key.startsWith('chess_'))
      .reduce((sum, [, s]) => {
        const wins = s.record?.win ?? 0;
        const losses = s.record?.loss ?? 0;
        const draws = s.record?.draw ?? 0;
        return sum + wins * 1.5 - losses * 0.6 + draws * 0.3;
      }, 0);
  }

  useEffect(() => {
    if (!profile || !stats) return;

    (async () => {
      setLoading(true);
      // 1) points de parties
      const ppRaw = computePartyPoints(stats);
      setPartyPoints(parseFloat(ppRaw.toFixed(2)));

            // 2) Récupération des puzzles et fusion
      let puzzlesSolved = 0;
      try {
        puzzlesSolved = await fetchPuzzlesSolved(profile.username);
      } catch {
        console.warn('Impossible de récupérer les puzzles');
      }
      const mergedStats: StatsResponse = {
        ...stats,
        tactics: { record: { win: puzzlesSolved, loss: 0, draw: 0 } },
      };

      // 3) génération des succès
      const list = achievementsFns.map(fn => fn(profile, mergedStats));
      setAchievements(list);

      // 4) totaux
      const ap = list.reduce((sum, a) => a.unlocked ? sum + a.points : sum, 0);
      setAchievementPoints(ap);
      setGrandTotal(parseFloat((ppRaw + ap).toFixed(2)));

      setLoading(false);
    })();
  }, [profile, stats]);

  async function handleLoad() {
    if (!username.trim()) {
      setError("Veuillez saisir un nom d'utilisateur.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [prof, st] = await Promise.all([
        fetchProfile(username),
        fetchStats(username),
      ]);
      setProfile(prof);
      setStats(st);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }

 return (
    <PageLayout title="Échecs - Succès et réalisations">
      <h1 className="text-red-500 text-lg font-semibold text-text text-center mb-6">
        Vous pouvez voir le nombre de points obtenus sur votre profil en le recherchant. Notez que vous pourrez lier plus tard votre profil Chess.com avec votre profil du tournoi. Plus de détails sur la 
        page Roadmap. Merci de votre patience. 
      </h1>
      <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
        {/* Recherche */}
        <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <input
            type="text"
            placeholder="Nom d'utilisateur Chess.com"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full"
          />
          <button
            onClick={handleLoad}
            disabled={loading}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition w-full sm:w-auto"
          >
            {loading ? 'Chargement...' : 'Afficher profil'}
          </button>
        </div>
        {error && <p className="text-error font-medium text-center">{error}</p>}

        {profile && stats && (
          <>
            {/* Profil & total échecs */}
            <div className="bg-background border border-border rounded-xl shadow-md overflow-hidden">
              <div className="flex flex-col sm:flex-row p-6 bg-background-light items-center">
                <img
                  src={profile.avatar || '/default-avatar.svg'}
                  alt={`${profile.username} avatar`}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-primary mb-4 sm:mb-0"
                />
                <div className="sm:ml-6 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-heading text-primary-dark mb-1">{profile.username}</h2>
                  <p className="text-lg font-semibold text-text">
                    Total échecs: <span className="text-primary">{grandTotal} pts</span>
                  </p>
                </div>
              </div>

              {/* Détails des parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                {['bullet', 'blitz', 'rapid', 'daily'].map(fmt => {
                  const key = `chess_${fmt}`;
                  const data = stats[key];
                  if (!data) return null;
                  const lastRating = data.last?.rating ?? 'N/A';
                  const bestRating = data.best?.rating ?? 'N/A';
                  const wins = data.record?.win ?? 0;
                  const losses = data.record?.loss ?? 0;
                  const draws = data.record?.draw ?? 0;
                  return (
                    <div key={fmt} className="p-4 bg-surface border border-border rounded-lg text-center">
                      <h3 className="text-lg uppercase font-semibold mb-2">{fmt}</h3>
                      <p className="font-heading text-xl text-primary mb-1">{lastRating}</p>
                      <p className="text-sm text-text-muted">Meilleur: {bestRating}</p>
                      <div className="flex justify-center space-x-2 mt-2">
                        <span className="text-success">✔ {wins}</span>
                        <span className="text-error">✘ {losses}</span>
                        <span className="text-text-muted">= {draws}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Points parties */}
              <div className="p-6 border-t border-border text-center">
                <p className="text-lg font-heading text-primary-dark">Points des parties: {partyPoints}</p>
              </div>
            </div>

            {/* Succès */}
            <div className="bg-background border rounded p-6">
              <h3 className="text-xl font-semibold text-center mb-4">Succès</h3>
              <ul className="space-y-3">
                {achievements.map(ach => (
                  <li key={ach.id}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg shadow-sm transition
                      ${ach.unlocked ? 'bg-success-light border border-success' : 'bg-surface opacity-50'}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium flex items-center mb-1">
                        {ach.title}
                        <span className="ml-2 text-sm font-bold text-primary">{ach.points} pts</span>
                      </p>
                      <p className="text-sm text-text-muted">{ach.description}</p>
                    </div>
                    {ach.unlocked && (
                      <span className="mt-2 sm:mt-0 text-success font-semibold">Validé</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-right">
                <p className="text-lg font-semibold">Total succès: {achievementPoints} pts</p>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
