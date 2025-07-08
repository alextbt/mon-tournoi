// src/app/event/megalovania/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

const externalLoader = ({ src }: { src: string }) => src;

interface ScoreEntry {
  id: number;
  user_id: string;
  attacks: number;
  created_at: string;
  user: string;
}

export default function MegalovaniaPage() {
  const [attacksInput, setAttacksInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [myBest, setMyBest] = useState<number | null>(null);
  const [meId, setMeId] = useState<string>('');

  // Charge classement + meilleure perf
 useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      // 1) Récupérer la session
      const {
        data: { session },
        error: authErr
      } = await supabase.auth.getSession();
      if (authErr) throw authErr;
      if (!session) throw new Error("Vous n'êtes pas connecté.");

      setMeId(session.user.id);

      // 2) Récupérer les scores
      const { data: scoreData, error: scoreErr } = await supabase
        .from('megalovania_scores')
        .select('id,user_id,attacks,created_at')
        .order('attacks', { ascending: true });
      if (scoreErr) throw scoreErr;

      // 3) Récupérer les pseudos
      const ids = Array.from(new Set(scoreData.map(r => r.user_id)));
      const { data: profs, error: profErr } = await supabase
        .from('profiles')
        .select('id,first_name')
        .in('id', ids);
      if (profErr) throw profErr;

      const nameMap = Object.fromEntries(
        (profs || []).map(p => [p.id, p.first_name || '—'])
      );

      const withNames: ScoreEntry[] = scoreData.map(r => ({
        ...r,
        user: nameMap[r.user_id] ?? r.user_id.slice(0, 8),
      }));

      setScores(withNames);

      // 4) Calculer ma meilleure perf
      const myList = withNames
        .filter(r => r.user_id === session.user.id)
        .map(r => r.attacks);
      setMyBest(myList.length ? Math.min(...myList) : null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error("Erreur pendant le chargement du classement:", e);
      setError("Impossible de charger le classement. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  })();
}, []);

  // Soumet un nouveau score
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const n = parseInt(attacksInput, 10);
    if (isNaN(n) || n <= 0) {
      setError('Veuillez saisir un nombre valide d’attaques.');
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError('Vous devez être connecté.');
      return;
    }

    const { error: insErr } = await supabase
      .from('megalovania_scores')
      .insert({ user_id: session.user.id, attacks: n });
    if (insErr) {
      console.error(insErr);
      setError('Erreur lors de l’enregistrement.');
      return;
    }

    setAttacksInput('');
    // Recharger classement et meilleure perf
    setLoading(true);
    const { data, error: refErr } = await supabase
      .from('megalovania_scores')
      .select('id,user_id,attacks,created_at')
      .order('attacks', { ascending: true });
    if (!refErr && data) {
      const ids = Array.from(new Set(data.map(r => r.user_id)));
      const { data: profs } = await supabase
        .from('profiles')
        .select('id,first_name')
        .in('id', ids);
      const nameMap = Object.fromEntries(
        (profs || []).map(p => [p.id, p.first_name || '—'])
      );
      const withNames = data.map(r => ({
        ...r,
        user: nameMap[r.user_id] ?? r.user_id.slice(0, 8),
      }));
      setScores(withNames);
      const mine = withNames
        .filter(r => r.user_id === session.user.id)
        .map(r => r.attacks);
      setMyBest(mine.length ? Math.min(...mine) : null);
    }
    setLoading(false);
  };

return (
  <main className="min-h-screen bg-black text-white px-8 py-12 determination text-lg">
    {/* Header + cœur + bouton “Comment jouer” */}
    <div className="flex flex-col items-center mb-8 space-y-4">
      <h1 className="text-5xl text-blue-600 mb-4">MEGALOVANIA</h1>
      <Link
        href="https://jcw87.github.io/c2-sans-fight/"
        className="group block w-16 h-16 transition-transform duration-300 hover:scale-110 mb-4"
      >
        <Image
          loader={externalLoader}
          unoptimized
          src="https://i.pinimg.com/474x/82/da/e0/82dae01693e0641e7fccc676cadae644.jpg"
          alt="Coeur Undertale bleu"
          width={120}
          height={120}
          className="object-contain transition-shadow duration-300 group-hover:drop-shadow-[0_0_12px_rgba(0,255,0,0.75)]"
        />
      </Link>
      <span className="text-white font-bold text-lg mb-6">Clique sur le coeur pour jouer !</span>
      
<Link href="/achivements/events/megalovania/rules">
  <button
    type="button"
    className="px-4 py-2 border border-white text-white rounded-full hover:bg-white/10 transition"
  >
    Comment jouer ?
  </button>
</Link>
    </div>

    {/* Grille : formulaire à gauche, classement à droite */}
    <div className="grid gap-8 md:grid-cols-2 mb-12">
      {/* ─── Formulaire + récap ─── */}
      <section className="space-y-6">
        <form
          onSubmit={handleSubmit}
          className="p-6 border-2 border-blue-400 rounded-lg space-y-4"
        >
          {error && <div className="text-red-500 font-bold">{error}</div>}
          <label className="block">
            Attaques effectuées
            <input
              type="number"
              min="1"
              step="1"
              value={attacksInput}
              onChange={e => setAttacksInput(e.target.value)}
              className="w-full mt-1 bg-transparent border border-blue-400 px-3 py-2 rounded focus:outline-none text-center"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-blue-400 text-black font-bold py-3 rounded hover:bg-blue-500 transition"
          >
            Valider
          </button>
        </form>
        <aside className="p-6 bg-white/10 rounded-lg">
          <h3 className="text-2xl mb-2">Votre meilleure performance</h3>
          {myBest !== null ? (
            <p>
              <span className="font-semibold text-blue-300">{myBest}</span>{' '}
              attaques
            </p>
          ) : (
            <p>Aucune performance enregistrée</p>
          )}
        </aside>
      </section>

      {/* ─── Classement public ─── */}
      <section className="p-4">
        <h2 className="text-2xl mb-4 text-center">Classement public</h2>
        {loading ? (
          <p className="text-center">Chargement…</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border-b border-white/20 px-2 py-1">#</th>
                <th className="border-b border-white/20 px-2 py-1">Joueur</th>
                <th className="border-b border-white/20 px-2 py-1">Attaques</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr
                  key={s.id}
                  className={
                    s.user_id === meId
                      ? 'bg-blue-900 text-white'
                      : i % 2 === 0
                      ? 'bg-white/5'
                      : ''
                  }
                >
                  <td className="px-2 py-1">{i + 1}</td>
                  <td className="px-2 py-1">
                    {s.user_id === meId ? 'Vous' : s.user}
                  </td>
                  <td className="px-2 py-1">{s.attacks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>

    {/* ─── Barème de points ─── */}
    <aside className="max-w-3xl mx-auto p-6 border border-blue-400 rounded-lg text-left">
      <h3 className="text-xl mb-2">Comment sont attribués les points ?</h3>
      <ul className="list-disc list-inside space-y-1">
        <li>3 points par attaque (ex. 42 attaques → 126 pts)</li>
        <li>
          <em>Bonus de phase</em> (points attribués manuellement après vérification)
        </li>
      </ul>
    </aside>
  </main>
);
}