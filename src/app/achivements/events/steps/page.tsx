// src/app/achivements/events/steps/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Participant = {
  user_id: string;
  first_name: string;
  steps: number;
};

export default function StepsEventPage() {
  const TOTAL_MAX = 1_500_000;
  const INDIVIDUAL_MAX = 150_000;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [stepsInput, setStepsInput] = useState('');            // <-- champ vide par défaut
  const [dateInput, setDateInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_steps')
      .select(`
        user_id,
        steps,
        profiles ( first_name )
      `);
    if (error) {
      console.error('Erreur fetch event_steps', error);
      setLoading(false);
      return;
    }

    const agg = new Map<string, Participant>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data || []).forEach((r: any) => {
      const uid = r.user_id;
      const name = r.profiles.first_name;
      const s = Number(r.steps) || 0;
      if (agg.has(uid)) {
        agg.get(uid)!.steps += s;
      } else {
        agg.set(uid, { user_id: uid, first_name: name, steps: s });
      }
    });

    const list = Array.from(agg.values());
    setParticipants(list);
    setTotalSteps(list.reduce((sum, p) => sum + p.steps, 0));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert('Connectez-vous d’abord');
    const user_id = session.user.id;
    const numSteps = Number(stepsInput);
    if (isNaN(numSteps) || numSteps <= 0) {
      return alert('Veuillez saisir un nombre de pas valide');
    }

    const { error } = await supabase.from('event_steps').insert({
      user_id,
      steps: numSteps,
      step_date: dateInput,
    });
    if (error) {
      console.error('insert error', error);
      return;
    }
    setStepsInput('');    // <-- on remet à vide
    setDateInput('');
    await fetchData();
  };

  const pctTotal = (s: number) =>
    TOTAL_MAX > 0 ? Math.min(100, Math.round((s / TOTAL_MAX) * 100)) : 0;

  const pctOfTotal = (s: number) =>
    totalSteps > 0 ? Math.round((s / totalSteps) * 100) : 0;

  if (loading) {
    return <p className="text-center py-20">Chargement…</p>;
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-green-300 to-green-500" />
      <div className="relative w-full sm:w-4/5 mx-auto px-4 py-20 space-y-12">
        <h1 className="text-5xl font-extrabold text-green-900 text-center">
          Un grand pas pour l&apos;humanité !
        </h1>
        <p className="text-lg text-green-800 text-center px-6">
          Cet événement est collaboratif. Faites progresser tous ensemble la jauge des pas pour obtenir des récompenses.
        </p>

        {/* Barre totale */}
        <div className="space-y-2">
          <div className="text-green-800 font-medium text-center">
            Total : {totalSteps.toLocaleString()} / {TOTAL_MAX.toLocaleString()} pas
          </div>
          <div className="w-full h-6 bg-white/30 rounded overflow-hidden">
            <div
              className="h-full bg-green-700 transition-all"
              style={{ width: `${pctTotal(totalSteps)}%` }}
            />
          </div>
        </div>

        {/* Tableau responsive */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white/80 rounded shadow-md text-left">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-4 py-2">Participant</th>
                <th className="px-4 py-2">Pas</th>
                <th className="px-4 py-2">% du total</th>
                <th className="px-4 py-2">Barre perso</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => {
                const pct = pctOfTotal(p.steps);
                return (
                  <tr
                    key={p.user_id}
                    className={i % 2 === 0 ? 'bg-white/70' : ''}
                  >
                    <td className="px-4 py-2 text-green-600">{p.first_name}</td>
                    <td className="px-4 py-2 text-green-600">{p.steps.toLocaleString()}</td>
                    <td className="px-4 py-2 text-green-600">{pct}%</td>
                    <td className="px-4 py-2 text-green-600">
                      <div className="w-full h-4 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((p.steps / INDIVIDUAL_MAX) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
          {/* Formulaire */}
          <section className="w-full md:w-1/2 bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-green-900 font-medium mb-1">
                  Nombre de pas effectués
                </label>
                <input
                  type="number"
                  min={1}
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-full p-3 rounded border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-green-600"
                  placeholder=""
                  required
                />
              </div>
              <div>
                <label className="block text-green-900 font-medium mb-1">
                  Date (JJ/MM/AAAA)
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full p-3 rounded border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-green-600"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition shadow-lg"
              >
                Soumettre mes pas
              </button>
            </form>
          </section>

          {/* Récompenses */}
          <section className="w-full md:w-1/2 bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-900">
              Récompenses
            </h2>
            <h4 className="font-medium text-green-600 mb-2">Les points sont répartis entre les joueurs participants à hauteur de leur pourcentage de contribution de la barre générale. Ainsi, 
                participer à hauteur de 50% de la barre vous donnera 50% de la récompense collective.
            </h4>
            <h3 className="font-medium text-green-800 mb-2">Collectives</h3>
            
            <ul className="list-disc list-inside mb-4 text-green-700">
              <li>250 000 pas → 2500 points</li>
              <li>500 000 pas → 5000 points dans la catégorie Sport</li>
              <li>750 000 pas → 6500 points dans la catégorie eSport</li>
              <li>1 000 000 pas → Débloque les styles de profil <strong>All in</strong> (+75% de points dans la catégorie eSport, mais -200% dans la catégorie Sport) et <strong>Sprint</strong> (+75% de points dans la catégorie Sport, mais -200% dans la catégorie eSport)</li>
              <li>1 500 000 pas → 12 500 points</li>
            </ul>
            <h3 className="font-medium text-green-800 mb-2">Individuelles</h3>
            <ul className="list-disc list-inside text-green-700">
              <li>50 000 pas → +200 pts bonus</li>
              <li>100 000 pas → +300 pts bonus</li>
              <li>150 000 pas → Obtient la réalisation permanente <strong>Explorateur</strong>, augmentant de +5% ses points dans la catégorie Sport.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
