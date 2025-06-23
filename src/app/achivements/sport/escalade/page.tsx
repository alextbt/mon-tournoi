// src/app/achivements/sport/escalade/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Onglets d'escalade avec couleurs
const TABS: { label: string; key: string; colorClass: string }[] = [
  { label: 'Général',       key: 'General',        colorClass: 'bg-gray-500' },
  { label: 'Très facile',    key: 'TresFacile',     colorClass: 'bg-yellow-400' },
  { label: 'Facile',         key: 'Facile',         colorClass: 'bg-green-400' },
  { label: 'Normal',         key: 'Normal',         colorClass: 'bg-blue-400' },
  { label: 'Difficile',      key: 'Difficile',      colorClass: 'bg-red-500' },
  { label: 'Très difficile', key: 'TresDifficile',  colorClass: 'bg-black' },
  { label: 'Expert',         key: 'Expert',         colorClass: 'bg-purple-600' },
];

type SportSuccess = {
  id: number;
  difficulty: string;
  title: string;
  description?: string;
  points: number;
};
type UserSportSuccess = { sport_success_id: number };

export default function EscaladePage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('General');
  const [successes, setSuccesses] = useState<SportSuccess[]>([]);
  const [doneIds, setDoneIds] = useState<Set<number>>(new Set());
  const [subTotal, setSubTotal] = useState<number>(0);

  // Nouveaux états pour enregistrement de voie
  const [voiePoints, setVoiePoints] = useState<number>(0);
  const [firstName, setFirstName] = useState<string>('');
  const [difficultySel, setDifficultySel] = useState<string>('General');
  // Initialiser vides plutôt que 1
  const [attempts, setAttempts] = useState<string>('');
  const [climbsCount, setClimbsCount] = useState<string>('');
  const [sessionPoints, setSessionPoints] = useState<number | null>(null);

  // Chargement initial
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const userId = session.user.id;

      const [{ data: rawSucc, error: succErr }, { data: rawUser, error: userErr }, { data: rawSessions, error: sessErr }] =
        await Promise.all([
          supabase.from('sport_successes').select('id, difficulty, title, description, points').eq('sport', 'Escalade').order('points', { ascending: true }),
          supabase.from('user_sport_successes').select('sport_success_id').eq('user_id', userId),
          supabase.from('escalade_sessions').select('points_earned').eq('user_id', userId),
        ]);
      if (succErr) console.error('Erreur fetch sport_successes:', succErr.message);
      if (userErr) console.error('Erreur fetch user_sport_successes:', userErr.message);
      if (sessErr) console.error('Erreur fetch escalade_sessions:', sessErr.message);

      setSuccesses(rawSucc as SportSuccess[] || []);
      setDoneIds(new Set((rawUser as UserSportSuccess[] || []).map(u => u.sport_success_id)));
      setVoiePoints((rawSessions as { points_earned: number }[] || []).reduce((acc, r) => acc + Number(r.points_earned), 0));

      setLoading(false);
    })();
  }, []);

  // Sous-total succès
  useEffect(() => {
    setSubTotal(successes.filter(s => doneIds.has(s.id)).reduce((sum, s) => sum + s.points, 0));
  }, [doneIds, successes]);

  // Upsert total en base
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      await supabase.from('user_points').upsert({
        user_id: userId,
        escalade_voie_points: voiePoints,
        escalade_points: subTotal + voiePoints,
      }, { onConflict: 'user_id' });
    })();
  }, [voiePoints, subTotal]);

  // Toggle succès
  const handleToggle = async (suc: SportSuccess) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;
    if (doneIds.has(suc.id)) {
      await supabase.from('user_sport_successes').delete().eq('user_id', userId).eq('sport_success_id', suc.id);
      setDoneIds(prev => { const n = new Set(prev); n.delete(suc.id); return n; });
    } else {
      await supabase.from('user_sport_successes').insert({ user_id: userId, sport_success_id: suc.id });
      setDoneIds(prev => new Set(prev).add(suc.id));
    }
  };

  // Enregistrer une voie
  const handleRecordSession = async () => {
    // Convertir les champs vides
    const attNum = Number(attempts) || 0;
    const climbsNum = Number(climbsCount) || 0;
    const base: Record<string, number> = { General: 0, TresFacile: 0.5, Facile: 1.25, Normal: 2.25, Difficile: 9, TresDifficile: 15, Expert: 75 };
    const bonusArr = [0, 3, 2.25, 1.25, 0.75, 0.25, 0.1];
    const bonus = bonusArr[attNum] || 0;
    const pts = (base[difficultySel] || 0) * (1 + bonus) * climbsNum;
    setSessionPoints(pts);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('escalade_sessions').insert({ user_id: session.user.id, first_name: firstName, difficulty: difficultySel, attempts: attNum, climbs_count: climbsNum, points_earned: pts });
    setVoiePoints(prev => prev + pts);
    // Réinitialiser les champs
    setAttempts('');
    setClimbsCount('');
    setFirstName('');
  };

  if (loading) {
    return (
      <main className="bg-dusk min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-white">Chargement Escalade…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-dusk min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-bg-mid rounded-xl shadow-lg overflow-hidden">

        {/* Header */}
        <header className="p-8 border-b border-white/10 text-center">
          <h1 className="text-3xl font-bold text-white">Escalade (bloc et voie)</h1>
          <p className="mt-2 text-white/70">Sous-total Escalade : <span className="font-semibold">{subTotal + voiePoints} pts</span></p>
        </header>

        {/* 2 colonnes responsive */}
        <div className="grid grid-cols-1 md:grid-cols-5">

          {/* Colonne gauche */}
          <aside className="md:col-span-1 p-6 border-b md:border-b-0 md:border-r border-white/10 text-white">
            <h2 className="text-xl font-semibold mb-4">Enregistrer une voie</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Prénom</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white" />
              </div>
              <div>
                <label className="block mb-1">Difficulté</label>
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
                <label className="block mb-1">Nombre d&apos;essais</label>
                <input type="number" min={1} value={attempts} onChange={e => setAttempts(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white" placeholder="" />
              </div>
              <div>
                <label className="block mb-1">Nombre de voies</label>
                <input type="number" min={1} value={climbsCount} onChange={e => setClimbsCount(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white" placeholder="" />
              </div>
              <button onClick={handleRecordSession} className="w-full py-3 bg-accent-purple text-white font-semibold rounded-lg">Enregistrer la voie</button>
            </div>
            {sessionPoints !== null && <p className="mt-4 text-white">Points cette session : <strong>{sessionPoints.toFixed(2)}</strong></p>}
            <p className="mt-2 text-white">Total points de voies : <strong>{voiePoints.toFixed(2)}</strong></p>
          </aside>

          {/* Colonne droite */}
          <section className="md:col-span-4">
            {/* Onglets */}
            <nav className="flex flex-wrap justify-center gap-2 p-6">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2 rounded-full font-medium ${t.colorClass} text-white transition ${t.key === tab ? 'ring-2 ring-white shadow-lg' : 'opacity-80 hover:opacity-100'}`}>{t.label}</button>
              ))}
            </nav>
            {/* Succès */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full table-auto text-white">
                <thead><tr className="bg-bg-light"><th className="px-4 py-2 text-left">Succès</th><th className="px-4 py-2 text-right">Points</th><th className="px-4 py-2 text-center">Statut</th></tr></thead>
                <tbody>
                  {successes.filter(s => s.difficulty === tab).map(suc => (
                    <tr key={suc.id} className="border-b border-white/10">
                      <td className="px-4 py-3"><p className="font-semibold">{suc.title}</p>{suc.description && <p className="text-sm text-white/70">{suc.description}</p>}</td>
                      <td className="px-4 py-3 text-right">+{suc.points}</td>
                      <td className="px-4 py-3 text-center">{doneIds.has(suc.id) ? <button onClick={() => handleToggle(suc)} className="px-3 py-1 bg-red-600 text-white rounded">Annuler</button> : <button onClick={() => handleToggle(suc)} className="px-3 py-1 bg-accent-purple text-white rounded">Valider</button>}</td>
                    </tr>
                  ))}
                  {successes.filter(s => s.difficulty === tab).length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-white/70">Aucun succès dans cette catégorie.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
