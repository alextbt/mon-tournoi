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

  // Chargement initial des succès et de l'état utilisateur
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const userId = session.user.id;

      // 1) Tous les succès Escalade (sport_successes)
      const { data: rawSucc, error: succErr } = await supabase
        .from('sport_successes')
        .select('id, difficulty, title, description, points')
        .eq('sport', 'Escalade')
        .order('points', { ascending: true });
      if (succErr) console.error('Erreur fetch sport_successes:', succErr.message);
      setSuccesses(rawSucc as SportSuccess[] || []);

      // 2) Succès validés par l'utilisateur
      const { data: rawUser, error: userErr } = await supabase
        .from('user_sport_successes')
        .select('sport_success_id')
        .eq('user_id', userId);
      if (userErr) console.error('Erreur fetch user_sport_successes:', userErr.message);
      const doneSet = new Set((rawUser as UserSportSuccess[] || []).map(u => u.sport_success_id));
      setDoneIds(doneSet);

      setLoading(false);
    })();
  }, []);

  // Recalcul et persistance du sous-total Escalade
  useEffect(() => {
    const total = successes
      .filter(s => doneIds.has(s.id))
      .reduce((sum, s) => sum + s.points, 0);
    setSubTotal(total);

    // Upsert escalade_points en base
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      await supabase
        .from('user_points')
        .upsert(
          { user_id: userId, escalade_points: total },
          { onConflict: 'user_id' }
        );
    })();
  }, [doneIds, successes]);

  // Toggle succès Escalade
  const handleToggle = async (suc: SportSuccess) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;
    if (doneIds.has(suc.id)) {
      await supabase
        .from('user_sport_successes')
        .delete()
        .eq('user_id', userId)
        .eq('sport_success_id', suc.id);
      setDoneIds(prev => { const n = new Set(prev); n.delete(suc.id); return n; });
    } else {
      await supabase
        .from('user_sport_successes')
        .insert({ user_id: userId, sport_success_id: suc.id });
      setDoneIds(prev => new Set(prev).add(suc.id));
    }
  };

  if (loading) {
    return (
      <main className="bg-dusk min-h-screen py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-white">Chargement Escalade…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-dusk min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-bg-mid rounded-xl shadow-lg overflow-hidden">

        {/* Header personnalisé */}
        <header className="p-8 border-b border-white/10">
          <h1 className="text-3xl font-bold text-white text-center">Escalade (bloc et voie)</h1>
          <p className="mt-2 text-center text-white/70">
            Sous-total Escalade : <span className="font-semibold">{subTotal} pts</span>
          </p>
        </header>

        {/* Onglets de difficulté */}
        <nav className="flex flex-wrap justify-center gap-2 p-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-full font-medium ${t.colorClass} text-white transition ${t.key === tab ? 'ring-2 ring-white shadow-lg' : 'opacity-80 hover:opacity-100'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Table des succès filtrée */}
        <section className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-white">
              <thead>
                <tr className="bg-bg-light">
                  <th className="px-4 py-2 text-left">Succès</th>
                  <th className="px-4 py-2 text-right">Points</th>
                  <th className="px-4 py-2 text-center">Statut</th>
                </tr>
              </thead>
              <tbody>
                {successes.filter(s => s.difficulty === tab).map(suc => (
                  <tr key={suc.id} className="border-b border-white/10">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{suc.title}</p>
                      {suc.description && <p className="text-sm text-white/70">{suc.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-right">+{suc.points}</td>
                    <td className="px-4 py-3 text-center">
                      {doneIds.has(suc.id)
                        ? <button onClick={() => handleToggle(suc)} className="px-3 py-1 bg-red-600 text-white rounded">Annuler</button>
                        : <button onClick={() => handleToggle(suc)} className="px-3 py-1 bg-accent-purple text-white rounded">Valider</button>
                      }
                    </td>
                  </tr>
                ))}
                {successes.filter(s => s.difficulty === tab).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-white/70">Aucun succès dans cette catégorie.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}
