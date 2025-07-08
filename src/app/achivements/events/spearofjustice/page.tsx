// src/app/event/spearofjustice/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

const externalLoader = ({ src }: { src: string }) => src;

interface ScoreEntry {
  id: number;
  user_id: string;
  diff: 'pet' | 'fight' | 'atone';
  time: number; // en minutes
  created_at: string;
}

export default function SpearOfJusticePage() {
  const [difficulty, setDifficulty] = useState<'pet' | 'fight' | 'atone'>('pet');
  const [timeInput, setTimeInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [myBest, setMyBest] = useState<Record<'pet'|'fight'|'atone', number>>({
    pet: NaN, fight: NaN, atone: NaN
  });
  const [myPoints, setMyPoints] = useState<Record<'pet'|'fight'|'atone', number>>({
    pet: 0, fight: 0, atone: 0
  });
  const [meId, setMeId] = useState<string>('');

  // Recharge à chaque changement de difficulté
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data:{ session } } = await supabase.auth.getSession();
      if (!session) return;
      setMeId(session.user.id);

      // fetch all, puis on filtre côté client
      const resp = await supabase
        .from('spear_scores')
        .select('*')
        .order('time', { ascending: true });
      const all = (resp.data ?? []) as ScoreEntry[];
      const list = all.filter(r => r.diff === difficulty);
      setScores(list);

      // ma meilleure performance
      const mine = list.filter(r => r.user_id === session.user.id).map(r => r.time);
      if (mine.length) {
        const best = Math.min(...mine);
        const rate = difficulty === 'pet' ? 60 : difficulty === 'fight' ? 120 : 300;
        setMyBest(b => ({ ...b, [difficulty]: best }));
        setMyPoints(p => ({ ...p, [difficulty]: Math.floor(best * rate) }));
      } else {
        setMyBest(b => ({ ...b, [difficulty]: NaN }));
        setMyPoints(p => ({ ...p, [difficulty]: 0 }));
      }

      setLoading(false);
    })();
  }, [difficulty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const t = parseFloat(timeInput);
    if (isNaN(t) || t <= 0) {
      setError('Veuillez saisir un temps valide (> 0).');
      return;
    }
    const { data:{ session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Vous devez être connecté.');
      return;
    }
    const ins = await supabase
      .from('spear_scores')
      .insert({ user_id: session.user.id, diff: difficulty, time: t });
    if (ins.error) {
      console.error(ins.error);
      setError('Erreur lors de l’enregistrement.');
      return;
    }
    setTimeInput('');
    // Rafraîchir
    setLoading(true);
    const resp = await supabase
      .from('spear_scores')
      .select('*')
      .order('time', { ascending: true });
    const all = (resp.data ?? []) as ScoreEntry[];
    setScores(all.filter(r => r.diff === difficulty));
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white px-8 py-12 determination text-lg">
          
      <div className="flex flex-col items-center space-y-4 mb-8 md:space-y-0 md:space-x-8">
        <h1 className="text-5xl mb-7 text-green-400">SPEAR OF JUSTICE</h1>
        <div className="flex flex-col items-center space-y-2">
      <Link
        href="https://doodle-pile.gitlab.io/unfair-undyne/v0.99/"
        className="group relative block w-16 h-16 transition-transform duration-300 hover:scale-110"
      >
        <Image
          loader={externalLoader}
          unoptimized
          src="https://art.pixilart.com/49d209a4da3d2ed.png"
          alt="Coeur Undertale"
          width={64}
          height={64}
          className="object-contain transition-shadow duration-300 group-hover:drop-shadow-[0_0_12px_rgba(0,255,0,0.75)]"
        />
      </Link>
      <span className="text-white font-bold text-lg mb-6">Clique sur le coeur pour jouer !</span>
    </div>
    <button
                    type="button"
                    onClick={() => window.alert(
                      'Il est conseillé de jouer sur un ordinateur à cet événement.\n' +
                      'Le but du jeu est de tenir face à votre ennemi le plus longtemps possible. Attention à vos points de vie !\n' +
                      'Pour jouer, déplacez vous dans les menus et dans le jeu avec les touches directionnelles de votre clavier (↑↓→←). Validez avec "Z".\n' +
                      'Une fois sur le jeu, choissisez la difficulté entre les 3 options (celle du bas est la plus difficile). Puis le jeu commence.\n' +
                      'Utilisez les flèces directionnelles pour orienter votre bouclier afin de vous protéger des flèches qui arrivent dans toutes les directions. Le bouclier bloque les flèches automatiquement.\n' +
                      'Attention aux flèches jaunes, elles viennent vous frapper dans le sens inverse de leur sens d’origine !\n' +
                      'Attention à la couleur de votre coeur : en vert, il faut que vous vous protégiez des flèches, en rouge, il faut se déplacer dans le cadre pour esquiver les flèches.\n' +
                      'Bonne chance !'
                    )}
                    className="ml-1 p-4 border border-white text-white rounded-full hover:bg-white/10 transition mb-6"
                  >
                    Comment jouer ?
                  </button>
        <select
          value={difficulty}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={e => setDifficulty(e.target.value as any)}
          className="w-64 items-center bg-black border border-green-400 px-4 py-2 rounded-lg focus:outline-none"
        >
          <option value="pet">Pet the vegetables</option>
          <option value="fight">Fight the true hero</option>
          <option value="atone">Atone for my sins</option>
        </select>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Formulaire + récap utilisateur */}
        <section className="space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-4 p-6 border-2 rounded-lg">
            {error && <div className="text-red-500 font-bold">{error}</div>}
<h2>Rentrez votre temps comme indiqué en bas à droite de votre jeu ! Utilisez une virgule pour séparer les minutes des secondes.</h2>
            <label className="block">
              Temps (minutes)
              <input
                type="number"
                step="0.01"
                value={timeInput}
                onChange={e => setTimeInput(e.target.value)}
                className="w-full mt-1 bg-transparent border px-3 py-2 rounded focus:outline-none"
              />
            </label>

            <button
              type="submit"
              className="w-full bg-green-400 text-black font-bold py-3 rounded-lg hover:bg-green-500 transition"
            >
              Valider
            </button>
          </form>

          <aside className="p-6 bg-white/10 rounded-lg">
            <h3 className="text-2xl mb-2">Votre meilleure performance</h3>
            <p>
              {DifficultyLabel(difficulty)} :{' '}
              {!isNaN(myBest[difficulty])
                ? `${myBest[difficulty].toFixed(2)} min → ${myPoints[difficulty]} pts`
                : 'Aucune performance enregistrée'}
            </p>
          </aside>
        </section>

        {/* Classement */}
        <section className="p-4">
          <h2 className="text-2xl mb-4">Classement {DifficultyLabel(difficulty)}</h2>
          {loading ? (
            <p className="text-center">Chargement…</p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-white/20 px-2 py-1">#</th>
                  <th className="border-b border-white/20 px-2 py-1">Joueur</th>
                  <th className="border-b border-white/20 px-2 py-1">Temps (min)</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`${i % 2 === 0 ? 'text-yellow-300' : ''} ${
                      s.user_id === meId ? '' : ''
                    }`}
                  >
                    <td className="px-2 py-1">{i + 1}</td>
                    <td className="px-2 py-1">
                      {s.user_id === meId ? 'Vous' : s.user_id.slice(0, 8)}
                    </td>
                    <td className="px-2 py-1">{s.time.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <aside className="max-w-3xl mx-auto mt-12 p-6 border border-green-400 rounded-lg text-left">
        <h3 className="text-xl mb-2">Comment sont attribués les points ?</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Pet the vegetables</strong> : 1 point par seconde.</li>
          <li><strong>Fight the true hero</strong> : 2 points par seconde.</li>
          <li><strong>Atone for my sins</strong> : 5 points par seconde.</li>
          <li><strong>Bonus</strong> : des points supplémentaires seront attribués pour chaque top 1 (+20 pts), top 2 (+10 pts) et top 3 (+5 pts) du classement pour chaque difficulté.</li>
        </ul>
      </aside>
    </main>
  );
}

function DifficultyLabel(d: 'pet'|'fight'|'atone'): string {
  switch(d) {
    case 'pet':   return 'Pet the vegetables';
    case 'fight': return 'Fight the true hero';
    case 'atone': return 'Atone for my sins';
  }
}
