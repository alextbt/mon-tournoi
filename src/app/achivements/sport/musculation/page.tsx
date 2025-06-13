'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

type Exo = { id: number; name: string; coefficient: number };

export default function MusculationPage() {
  const [exos, setExos] = useState<Exo[]>([]);
  const [loading, setLoading] = useState(true);
  const [exoId, setExoId] = useState<number|null>(null);
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [sets, setSets] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    supabase.from('exercises').select('*')
      .then(({ data }) => {
        setExos(data || []);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!exoId || weight <= 0 || reps <= 0 || sets <= 0) {
      setMessage('Veuillez remplir tous les champs avec des valeurs > 0.');
      return;
    }

    // Récupérer le coefficient
    const exo = exos.find(x => x.id === exoId)!;
    const pts = Math.round((weight * reps * sets * exo.coefficient) / 1000);

    // Insertion
    const { error } = await supabase
      .from('user_exercises')
      .insert({
        exercise_id: exoId,
        weight,
        repetitions: reps,
        sets,
        points: pts
      });

    if (error) {
      setMessage('Erreur lors de l’enregistrement.');
    } else {
      setMessage(`Enregistré ! Vous gagnez ${pts} pts pour ${exo.name}.`);
      // reset du formulaire
      setExoId(null);
      setWeight(0);
      setReps(0);
      setSets(0);
    }
  };

  if (loading) return <p>Chargement des exercices…</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Musculation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Choix de l'exercice */}
        <div>
          <label className="block mb-1 font-medium">Exercice</label>
          <select
            value={exoId ?? ''}
            onChange={e => setExoId(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>— Sélectionnez —</option>
            {exos.map(x => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>

        {/* Poids */}
        <div>
          <label className="block mb-1 font-medium">Poids (kg)</label>
          <input
            type="number"
            min={0}
            value={weight}
            onChange={e => setWeight(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Répétitions */}
        <div>
          <label className="block mb-1 font-medium">Répétitions</label>
          <input
            type="number"
            min={0}
            value={reps}
            onChange={e => setReps(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Séries */}
        <div>
          <label className="block mb-1 font-medium">Séries</label>
          <input
            type="number"
            min={0}
            value={sets}
            onChange={e => setSets(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white font-semibold rounded"
        >
          Enregistrer et gagner des points
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-blue-700">
          {message}
        </p>
      )}
    </div>
  );
}
