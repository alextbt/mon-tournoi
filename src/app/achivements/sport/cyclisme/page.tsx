// src/app/cyclisme/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PageLayout from '@/components/PageLayout';

interface CyclismeRun {
  id: number;
  user_id: string;
  time_seconds: number;
  distance_km: number;
  elevation_m: number | null;
  points: number;
}

export default function CyclismePage() {
  const [runs, setRuns] = useState<CyclismeRun[]>([]);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [distance, setDistance] = useState('');
  const [elevation, setElevation] = useState('');
  const [loading, setLoading] = useState(true);

  // Load existing runs
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      const { data: dbRuns } = await supabase
        .from('cycling_performances')
        .select('*')
        .eq('user_id', userId)
        .order('id', { ascending: false });
      setRuns(dbRuns || []);
      setLoading(false);
    })();
  }, []);

  // Submit new performance
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalSeconds = parseInt(hours, 10) * 3600
      + parseInt(minutes, 10) * 60
      + parseInt(seconds, 10);
    const dist = parseFloat(distance);
    const elev = elevation ? parseInt(elevation, 10) : null;

    // Validation
    if (isNaN(totalSeconds) || totalSeconds <= 0) {
      alert('Veuillez saisir une durée valide (heures, minutes, secondes)');
      return;
    }
    if (isNaN(dist) || dist <= 0) {
      alert('Veuillez saisir une distance valide (> 0 km)');
      return;
    }

    // Calculate points
    const pts = Math.round(dist * 10 + (totalSeconds / 200));

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) console.error('Session fetch error:', sessionError);
    if (!session) {
      alert('Vous devez être connecté pour enregistrer votre performance.');
      return;
    }
    const userId = session.user.id;

    // Insert performance
    const res = await supabase
      .from('cycling_performances')
      .insert([
        { user_id: userId, time_seconds: totalSeconds, distance_km: dist, elevation_m: elev, points: pts }
      ])
      .select();
    console.log('Insert response:', res);
    if (res.error) {
      console.error('Insert failed:', res.error.message, res.error.details);
      alert(`Erreur insertion : ${res.error.message}`);
      return;
    }

    const inserted = res.data;
    // Update runs state
    if (inserted && inserted.length) {
      const newRuns = [...inserted, ...runs];
      setRuns(newRuns);

      // Update user_points
      const newTotal = newRuns.reduce((sum, r) => sum + r.points, 0);
      const { error: upError } = await supabase
        .from('user_points')
        .update({ cyclisme_points: newTotal })
        .eq('user_id', userId);
      if (upError) console.error('Error updating user_points:', upError);

      // Clear form
      setHours('');
      setMinutes('');
      setSeconds('');
      setDistance('');
      setElevation('');
    }
  };

  const totalPoints = runs.reduce((sum, r) => sum + r.points, 0);
  const recordPoints = runs.reduce((max, r) => Math.max(max, r.points), 0);

  if (loading) return <PageLayout title="Cyclisme">Chargement…</PageLayout>;

  return (
    <PageLayout title="Cyclisme – Enregistrements">
      <div className="w-full px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 text-white w-full">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Inscrivez vos résultats depuis le 22 juin !
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <input
                type="number"
                min="0"
                placeholder="Heures"
                value={hours}
                onChange={e => setHours(e.target.value)}
                className="flex-1 p-3 rounded bg-gray-800 placeholder-gray-400"
              />
              <input
                type="number"
                min="0"
                max="59"
                placeholder="Minutes"
                value={minutes}
                onChange={e => setMinutes(e.target.value)}
                className="flex-1 p-3 rounded bg-gray-800 placeholder-gray-400"
              />
              <input
                type="number"
                min="0"
                max="59"
                placeholder="Secondes"
                value={seconds}
                onChange={e => setSeconds(e.target.value)}
                className="flex-1 p-3 rounded bg-gray-800 placeholder-gray-400"
              />
            </div>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="Distance (km)"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 placeholder-gray-400"
            />
            <input
              type="number"
              step="1"
              min="0"
              placeholder="Dénivelé (m) (facultatif)"
              value={elevation}
              onChange={e => setElevation(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 placeholder-gray-400"
            />
            <button
              type="submit"
              className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg"
            >
              Enregistrer ma performance
            </button>
          </form>
        </div>

        {/* Summary Container */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 text-white w-full">
          <h2 className="text-2xl font-semibold mb-4">Résumé des performances</h2>
          <p className="mb-6">Record de points : <span className="font-bold">{recordPoints}</span></p>
          <p className="mb-6">Total cyclisme : <span className="font-bold">{totalPoints}</span></p>
          <ul className="space-y-4 max-h-[600px] overflow-y-auto">
            {runs.map(r => (
              <li key={r.id} className="border border-gray-700 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{r.distance_km.toFixed(1)} km</span>
                  <span className="font-medium">{r.points} pts</span>
                </div>
                <div className="text-sm text-gray-300">
                  Temps : {Math.floor(r.time_seconds / 3600)}h{Math.floor((r.time_seconds % 3600) / 60)}m{r.time_seconds % 60}s
                  {r.elevation_m ? ` • +${r.elevation_m} m` : ''}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
