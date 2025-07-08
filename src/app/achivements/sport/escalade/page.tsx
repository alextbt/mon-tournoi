// src/app/achivements/sport/escalade/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Onglets d'escalade avec couleurs
const TABS: { label: string; key: string; colorClass: string }[] = [
  { label: 'Général',       key: 'General',       colorClass: 'bg-gray-500' },
  { label: 'Très facile',    key: 'TresFacile',    colorClass: 'bg-yellow-400' },
  { label: 'Facile',         key: 'Facile',        colorClass: 'bg-green-400' },
  { label: 'Normal',         key: 'Normal',        colorClass: 'bg-blue-400' },
  { label: 'Difficile',      key: 'Difficile',     colorClass: 'bg-red-500' },
  { label: 'Très difficile', key: 'TresDifficile', colorClass: 'bg-black' },
  { label: 'Expert',         key: 'Expert',        colorClass: 'bg-purple-600' },
];

type TabKey = typeof TABS[number]['key'];
type SportSuccess = { id: number; difficulty: TabKey; title: string; description?: string; points: number; };
type EscaladeSession = { id: number; first_name: string; difficulty: TabKey; attempts: number; climbs_count: number };
type UserPoints = { escalade_success_points: number; escalade_voie_points: number; escalade_points: number };

export default function EscaladePage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('General');
  const [successes, setSuccesses] = useState<SportSuccess[]>([]);
  const [doneIds, setDoneIds] = useState<Set<number>>(new Set());
  const [sessions, setSessions] = useState<EscaladeSession[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints>({ escalade_success_points: 0, escalade_voie_points: 0, escalade_points: 0 });

  // États formulaire voie
  const [firstName, setFirstName] = useState('');
  const [difficultySel, setDifficultySel] = useState<TabKey>('TresFacile');
  const [attempts, setAttempts] = useState('');
  const [climbsCount, setClimbsCount] = useState('');

  // Chargement initial
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const userId = session.user.id;

const [succRes, userSuccRes, sesRes, ptsRes] = await Promise.all([
  supabase
    .from('sport_successes')
    .select('id, difficulty, title, description, points')
    .eq('sport', 'Escalade'),
  supabase
    .from('user_sport_successes')
    .select('sport_success_id')
    .eq('user_id', userId),
  supabase
    .from('escalade_sessions')
    .select('id, first_name, difficulty, attempts, climbs_count')
    .eq('user_id', userId),
  supabase
    .from('user_points')
    .select('escalade_success_points, escalade_voie_points, escalade_points')
    .eq('user_id', userId)
    .single(),
]);

      if (succRes.data) setSuccesses(succRes.data);
      if (userSuccRes.data) setDoneIds(new Set(userSuccRes.data.map(d => d.sport_success_id)));
      if (sesRes.data) setSessions(sesRes.data);
      if (ptsRes.data) setUserPoints(ptsRes.data);

      setLoading(false);
    })();
  }, []);

  // Toggle succès
  const handleToggle = async (suc: SportSuccess) => {
    const { data: { session } } = await supabase.auth.getSession(); if (!session) return;
    const userId = session.user.id;
    if (doneIds.has(suc.id)) {
      await supabase.from('user_sport_successes')
        .delete().eq('user_id', userId).eq('sport_success_id', suc.id);
      setDoneIds(prev => { const n = new Set(prev); n.delete(suc.id); return n; });
    } else {
      await supabase.from('user_sport_successes')
        .insert({ user_id: userId, sport_success_id: suc.id });
      setDoneIds(prev => new Set(prev).add(suc.id));
    }
  };

  // Enregistrer une session de voie
  const handleRecordSession = async () => {
    const { data: { session } } = await supabase.auth.getSession(); if (!session) return;
    const userId = session.user.id;
    await supabase.from('escalade_sessions')
      .insert({ user_id: userId, first_name: firstName, difficulty: difficultySel, attempts: Number(attempts)||0, climbs_count: Number(climbsCount)||0 });
    const { data: sesRes } = await supabase.from('escalade_sessions')
      .select('id, first_name, difficulty, attempts, climbs_count')
      .eq('user_id', userId);
    if (sesRes) setSessions(sesRes);
    setFirstName(''); setDifficultySel('TresFacile'); setAttempts(''); setClimbsCount('');
  };

  if (loading) return <main className="bg-dusk min-h-screen flex items-center justify-center"><p className="text-white">Chargement Escalade…</p></main>;

  return (
    <main className="bg-dusk min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-bg-mid rounded-xl shadow-lg overflow-hidden">

        {/* Header */}
        <header className="p-8 border-b border-white/10 text-center">
          <h1 className="text-3xl font-bold text-white">Escalade (bloc & voie)</h1>
          <p className="mt-2 text-white/80">Succès : <strong>{userPoints.escalade_success_points} pts</strong></p>
          <p className="text-white/80">Voies : <strong>{userPoints.escalade_voie_points} pts</strong></p>
          <p className="mt-2 text-white/70">Total Escalade : <span className="font-semibold text-fuchsia-400">{userPoints.escalade_points} pts</span></p>
        </header>

        {/* Layout en 2 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-5">

          {/* Formulaire voie à gauche */}
          <aside className="md:col-span-1 p-6 border-b md:border-b-0 md:border-r border-white/10 text-white">
            <h2 className="text-xl font-semibold mb-4">Enregistrer une voie</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Prénom</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white" />
              </div>
              <div>
                <label className="block mb-1"><span>Difficulté</span>
                  <button
                    type="button"
                    onClick={() => window.alert(
                      'Points par voie effectuée en fonction de la difficulté :\n' +
                      'Très facile (jaune) = 0.5 points\n' +
                      'Facile (verte) = 1.25 points\n' +
                      'Normal (bleue) = 2.5 points\n' +
                      'Difficile (rouge) = 8 points\n' +
                      'Très difficile (noire) = 20 points\n' +
                      'Expert (violette) = 75 points'
                    )}
                    className="ml-2 p-2 border border-white text-white rounded-full hover:bg-white/10 transition"
                  >
                    i
                  </button>
                  </label>
                <select value={difficultySel} onChange={e => setDifficultySel(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white">
                  <option value="TresFacile">Très facile (voie jaune - 4/4+)</option>
                  <option value="Facile">Facile (voie verte - 5a/b/c)</option>
                  <option value="Normal">Normal (voie bleue - 6a/a+)</option>
                  <option value="Difficile">Difficile (voie rouge - 6b/b+/c)</option>
                  <option value="TresDifficile">Très difficile (voie noire - 6c+/7a/7a+)</option>
                  <option value="Expert">Expert (voie violette - ≥ 7b)</option>
                </select>
              </div>
              <div>
                <label className="block mb-1"><span>Nombre d&apos;essais</span>
                  <button
                    type="button"
                    onClick={() => window.alert(
                      'Bonus en fonction du nombre d\'essais :\n' +
                      '1er coup = +300%\n' +
                      '2e coup = +225%\n' +
                      '3e coup = +150%\n' +
                      '4e coup = +75%\n' +
                      '5e coup = +25%\n' +
                      '6e coup = +10%\n' +
                      'Au-delà, pas de bonus.'
                    )}
                    className="ml-2 p-2 border border-white text-white rounded-full hover:bg-white/10 transition"
                  >
                    i
                  </button>
                </label>
                <input type="number" min={1} value={attempts} onChange={e => setAttempts(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white" />
              </div>
              <div>
                <label className="block mb-1">Nombre de voies</label>
                <input type="number" min={1} value={climbsCount} onChange={e => setClimbsCount(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white" />
              </div>
              <button onClick={handleRecordSession} className="w-full py-3 bg-accent-purple text-white font-semibold rounded-lg">Enregistrer la voie</button>
            </div>
          </aside>

           {/* Succès et historique */}
          <section className="md:col-span-4">
            {/* Onglets Succès */}
            <nav className="flex flex-wrap justify-center gap-2 p-6">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2 rounded-full font-medium ${t.colorClass} text-white transition ${t.key===tab?'ring-2 ring-white shadow-lg':'opacity-80 hover:opacity-100'}`}>{t.label}</button>
              ))}
            </nav>
            {/* Tableau Succès */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full table-auto text-white">
                <thead>
                  <tr className="bg-bg-light">
                    <th className="px-4 py-2 text-left">Succès</th>
                    <th className="px-4 py-2 text-center">Points</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {successes.filter(s => s.difficulty === tab).map(suc => (
                    <tr key={suc.id} className="border-b border-white/10">
                      <td className="px-4 py-3">
                        <p className="font-semibold">{suc.title}</p>
                        {suc.description && <p className="text-sm text-white/70">{suc.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-center">+{suc.points}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleToggle(suc)} className={`${doneIds.has(suc.id) ? 'bg-red-600' : 'bg-accent-purple'} text-white px-3 py-1 rounded`}>{doneIds.has(suc.id) ? 'Annuler' : 'Valider'}</button>
                      </td>
                    </tr>
                  ))}
                  {successes.filter(s => s.difficulty === tab).length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-white/70">Aucun succès dans cette catégorie.</td></tr>}
                </tbody>
              </table>
            </div>
            {/* Historique voies */}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Historique des voies</h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                {sessions.map(s => (
                  <li key={s.id}>{s.first_name} - {s.difficulty} - essais: {s.attempts}, voies: {s.climbs_count}</li>
                ))}
                {sessions.length===0 && <li>Aucune session enregistrée.</li>}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
