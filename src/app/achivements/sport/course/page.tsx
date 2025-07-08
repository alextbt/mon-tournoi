// src/app/achivements/sport/course/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/lib/supabaseClient';

interface Run {
  id: number;
  user_id: string;
  type: string;
  distance_km: number;
  time_min: number;
  speed: number;
  points: number;
  run_at: string;
}

// World record speeds (m/s) for various race types
const WORLD_SPEEDS: Record<string, { distance_km: number; time_s: number }> = {
  Sprint: { distance_km: 0.1, time_s: 9.58 },
  'Demi-fond': { distance_km: 1.5, time_s: 206 },
  Fond: { distance_km: 5, time_s: 755 },
  'Semi-marathon': { distance_km: 21.0975, time_s: 3451 },
  Marathon: { distance_km: 42.195, time_s: 7299 },
  Fractionné: { distance_km: 1, time_s: 60 },
  'Distance Libre': { distance_km: 1, time_s: 300 },
};
const RUN_TYPES = Object.keys(WORLD_SPEEDS);

export default function CoursePage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [type, setType] = useState(RUN_TYPES[0]);
  const [distance, setDistance] = useState('');
  const [timeMin, setTimeMin] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      const { data: dbRuns } = await supabase
        .from('running_records')
        .select('*')
        .eq('user_id', userId)
        .order('run_at', { ascending: false });
      setRuns(dbRuns || []);
      setLoading(false);
    })();
  }, []);

  const speed = useMemo(() => {
    const km = parseFloat(distance) || 0;
    const mn = parseFloat(timeMin) || 0;
    return mn > 0 ? +(km / (mn / 60)).toFixed(2) : 0;
  }, [distance, timeMin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const km = parseFloat(distance);
    const mn = parseFloat(timeMin);
    if (km <= 0 || mn <= 0) {
      alert('Distance et temps doivent être supérieurs à 0');
      return;
    }
    const perfSpeed = (km * 1000) / (mn * 60);
    const wr = WORLD_SPEEDS[type];
    const worldSpeed = (wr.distance_km * 1000) / wr.time_s;
    const ratio = perfSpeed / worldSpeed;
    let pts = Math.round(ratio * 200 + 50);
    if (pts < 50) pts = 50;
    if (pts > 250) pts = 250;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    await supabase.from('running_records').insert({
      user_id: userId,
      type,
      distance_km: km,
      time_min: mn,
      speed,
      points: pts,
      run_at: new Date().toISOString(),
    });

    setMsg(`+${pts} pts !`);
    setDistance('');
    setTimeMin('');

    const { data: dbRuns } = await supabase
      .from('running_records')
      .select('*')
      .eq('user_id', userId)
      .order('run_at', { ascending: false });
    setRuns(dbRuns || []);
  };

  const totalPoints = runs.reduce((s, r) => s + r.points, 0);
  const bestPts = runs.reduce((m, r) => Math.max(m, r.points), 0);

  if (loading) return <PageLayout title="Course">Chargement…</PageLayout>;

  return (
    <PageLayout title="Course – Enregistrements">
      <div className="mx-auto w-full lg:w-2/3 px-6 py-12">
        <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg space-y-6">
          <h2 className="text-3xl font-bold text-white text-center">
            Enregistrer une course
          </h2>
          <p className="text-center text-white/70">
            Total :{' '}
            <span className="font-semibold text-white">{totalPoints} pts</span>{' '}
            | Record :{' '}
            <span className="font-semibold text-white">{bestPts} pts</span>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {msg && (
                <p className="text-green-300 text-center font-semibold">
                  {msg}
                </p>
              )}
              <div>
                <label className="block mb-1 font-semibold text-white">
                  Type de course
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70
                             focus:outline-none focus:ring-2 focus:ring-white/60 transition"
                >
                  {RUN_TYPES.map(r => (
                    <option key={r} className="text-black">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-white">
                  Distance (km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={distance}
                  onChange={e => setDistance(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70
                             focus:outline-none focus:ring-2 focus:ring-white/60 transition"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-white">
                  Temps (min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={timeMin}
                  onChange={e => setTimeMin(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70
                             focus:outline-none focus:ring-2 focus:ring-white/60 transition"
                />
              </div>
              <p className="text-white font-medium">
                Vitesse :{' '}
                <span className="font-semibold text-green-300">{speed} km/h</span>
              </p>
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white
                           font-semibold transition"
              >
                Enregistrer la course
              </button>
            </form>

            {/* Historique */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Historique des courses
              </h3>
              <div className="overflow-x-auto bg-white/10 backdrop-blur-sm rounded-lg shadow-inner">
                <table className="w-full text-white">
                  <thead className="sticky top-0 bg-white/20 backdrop-blur-sm">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-right">Distance</th>
                      <th className="px-3 py-2 text-right">Temps</th>
                      <th className="px-3 py-2 text-right">Vitesse</th>
                      <th className="px-3 py-2 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((r, i) => (
                      <tr
                        key={r.id}
                        className={`${i % 2 === 0 ? 'bg-white/5' : ''} hover:bg-white/20 transition-colors`}
                      >
                        <td className="px-3 py-2">
                          {new Date(r.run_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-3 py-2">{r.type}</td>
                        <td className="px-3 py-2 text-right">
                          {r.distance_km} km
                        </td>
                        <td className="px-3 py-2 text-right">
                          {r.time_min} min
                        </td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {r.speed} km/h
                        </td>
                        <td className="px-3 py-2 text-right font-bold">
                          +{r.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
