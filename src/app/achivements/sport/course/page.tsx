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
  Sprint: { distance_km: 0.1, time_s: 9.58 },            // 100 m
  'Demi-fond': { distance_km: 1.5, time_s: 206 },         // 1500 m
  Fond: { distance_km: 5, time_s: 755 },                  // 5000 m
  'Semi-marathon': { distance_km: 21.0975, time_s: 3451 },// 21.0975 km
  Marathon: { distance_km: 42.195, time_s: 7299 },        // 42.195 km
  Fractionné: { distance_km: 1, time_s: 60 },             // assume 1km in 1min benchmark
  'Distance Libre': { distance_km: 1, time_s: 300 },      // assume 1km in 5min benchmark
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

  // compute user speed (m/s)
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
    // performance ratio vs world speed
    const perfSpeed = (km * 1000) / (mn * 60);        // m/s
    const wr = WORLD_SPEEDS[type];
    const worldSpeed = (wr.distance_km * 1000) / wr.time_s;
    const ratio = perfSpeed / worldSpeed;
    // map ratio to points: 50pt baseline, 250pt for ratio>=1
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
      <div className="mx-auto w-full lg:w-2/3 px-6 py-12 space-y-6">
        <h2 className="text-3xl font-bold text-white text-center">Enregistrer une course</h2>
        <p className="text-center text-white/70">
          Total : <span className="font-semibold">{totalPoints} pts</span> | Record : <span className="font-semibold">{bestPts} pts</span>
        </p>

        <section className="bg-bg-light p-6 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {msg && <p className="text-green-600 text-center font-semibold">{msg}</p>}
            <div>
              <label className="block mb-1 font-semibold text-black">Type de course</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full p-3 rounded border border-gray-400 bg-white text-black focus:outline-none"
              >
                {RUN_TYPES.map(r => <option key={r} className="text-black">{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-black">Distance (km)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                className="w-full p-3 rounded border border-gray-400 bg-white text-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-black">Temps (min)</label>
              <input
                type="number"
                min="0"
                value={timeMin}
                onChange={e => setTimeMin(e.target.value)}
                className="w-full p-3 rounded border border-gray-400 bg-white text-black focus:outline-none"
              />
            </div>
            <p className="text-black font-medium">
              Vitesse : <span className="font-semibold">{speed} km/h</span>
            </p>
            <button
              type="submit"
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
            >
              Enregistrer la course
            </button>
          </form>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Historique des courses</h3>
            <ul className="space-y-3 max-h-[400px] overflow-y-auto text-white">
              {runs.map(r => (
                <li key={r.id} className="flex justify-between border-b border-gray-700 pb-2">
                  <span>
                    [{r.type}] {new Date(r.run_at).toLocaleDateString()} – {r.distance_km} km en {r.time_min} min
                  </span>
                  <span className="font-bold">+{r.points} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
