'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/lib/supabaseClient';

type Tab =
  | 'Pecs'
  | 'Dos'
  | 'Jambes'
  | 'Épaules'
  | 'Bras'
  | 'Abdos'
  | 'Course';

const EXERCISES: Record<Exclude<Tab, 'Course'>, string[]> = {
  Pecs: [
    'Développé couché (barre)',
    'Développé couché (haltères)',
    'Développé incliné',
    'Développé décliné',
    'Pompes',
    'Dips pectoraux',
    'Écarté couché (haltères)',
    'Écarté aux poulies',
    'Pec-deck',
  ],
  Dos: [
    'Tractions pronation',
    'Tractions supination',
    'Rowing barre',
    'Rowing haltère unilatéral',
    'Tirage horizontal',
    'Tirage vertical',
    'Shrug (haussement)',
    'Oiseau (haltères)',
  ],
  Jambes: [
    'Squat barre',
    'Squat guidé',
    'Presse à cuisses',
    'Fentes avant',
    'Leg curl assis',
    'Leg curl debout',
    'Mollets à la presse',
    'Sissy squat',
  ],
  Épaules: [
    'Développé militaire',
    'Développé Arnold',
    'Élévations latérales',
    'Élévations frontales',
    'Oiseau poulies',
    'Rowing menton',
  ],
  Bras: [
    'Curl barre droite',
    'Curl barre EZ',
    'Curl haltères',
    'Curl incliné',
    'Curl poulie vis-à-vis',
    'Extensions triceps haltère',
    'Extension triceps poulie',
    'Dip triceps',
  ],
  Abdos: [
    'Crunch au sol',
    'Relevé de jambes suspendu',
    'Planche',
    'Gainage latéral',
    'Crunch poulie haute',
    'Roulette abdo',
  ],
};

export default function MusculationPage() {
  const [tab, setTab] = useState<Tab>('Pecs');
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);

  // Pour la course
  const [distance, setDistance] = useState(0);
  const [timeMin, setTimeMin] = useState(0);
  const [speed, setSpeed] = useState(0);

  const [msg, setMsg] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [record, setRecord] = useState<any>(null);
  const [totalPartPoints, setTotalPartPoints] = useState(0);

  // Recalcul automatique de la vitesse
  useEffect(() => {
    if (tab === 'Course' && timeMin > 0) {
      setSpeed(parseFloat(((distance / (timeMin / 60)) || 0).toFixed(2)));
    }
  }, [distance, timeMin, tab]);

  // Charger le record perso (limité à 1 ligne)
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setRecord(null);
        return;
      }
      const userId = session.user.id;

      const { data, error } = await supabase
        .from('sport_records')
        .select('*')
        .eq('user_id', userId)
        .eq('category', 'Musculation')
        .eq('body_part', tab)
        .order('points', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erreur fetch record :', error.message);
        setRecord(null);
      } else {
        setRecord(data);
      }
    })();
  }, [tab, exercise, msg]);

  // Charger le total des points pour l’onglet courant
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;

      const { data, error } = await supabase
        .from('sport_records')
        .select('points')
        .eq('user_id', userId)
        .eq('category', 'Musculation')
        .eq('body_part', tab);

      if (!error) {
        const sum = (data || []).reduce((acc, r) => acc + (r.points || 0), 0);
        setTotalPartPoints(sum);
      }
    })();
  }, [tab, msg]);

  // Upsert total global
  async function adjustPoints(delta: number) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    const { data: ptsData } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', userId)
      .maybeSingle();

    const oldTotal = ptsData?.total_points ?? 0;
    await supabase
      .from('user_points')
      .upsert(
        { user_id: userId, total_points: oldTotal + delta },
        { onConflict: 'user_id' }
      );
  }

  // Gestion du submit avec logging de l’erreur
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let points = 0;
    if (tab === 'Course') {
      points = Math.floor(distance * 4 + speed);
    } else {
      points = Math.floor((reps / 2) * (sets / 2) * (1 + weight / 100));
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const payload = {
      user_id:    session.user.id,
      category:   'Musculation',
      body_part:  tab,
      exercise:   tab === 'Course' ? 'Course' : exercise,
      weight:     tab === 'Course' ? null : weight,
      reps:       tab === 'Course' ? null : reps,
      sets:       tab === 'Course' ? null : sets,
      distance:   tab === 'Course' ? distance : null,
      time_min:   tab === 'Course' ? timeMin : null,
      speed:      tab === 'Course' ? speed : null,
      points,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: inserted, error: insertError } = await supabase
      .from('sport_records')
      .insert(payload);

    if (insertError) {
      console.error('❌ Erreur INSERT sport_records:', insertError.message);
      return;
    }

    await adjustPoints(points);
    setMsg(`+${points} pts !`);

    // Reset des champs
    setWeight(0);
    setReps(0);
    setSets(0);
    setDistance(0);
    setTimeMin(0);

    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <PageLayout title="Musculation & Course">
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
        <h2 className="text-3xl font-bold text-white text-center">
          Enregistrer un exercice
        </h2>

        <p className="text-center text-white/80">
          Total {tab} : <span className="font-semibold">{totalPartPoints} pts</span>
        </p>

        {/* Onglets */}
        <nav className="flex flex-wrap justify-center gap-2">
          {([
            'Pecs',
            'Dos',
            'Jambes',
            'Épaules',
            'Bras',
            'Abdos',
            'Course',
          ] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setExercise('');
                setMsg('');
              }}
              className={`px-5 py-2 rounded-full font-medium transition ${
                t === tab
                  ? 'bg-accent-purple text-white ring-2 ring-accent-purple shadow-lg'
                  : 'bg-white/20 text-white/70 hover:bg-white/30'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* Sélecteur d’exercices (sauf Course) */}
        {tab !== 'Course' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXERCISES[tab].map((exo) => (
              <button
                key={exo}
                onClick={() => setExercise(exo)}
                className={`h-28 p-4 rounded-lg font-semibold text-center transition-transform duration-200 ${
                  exercise === exo
                    ? 'bg-accent-purple text-white ring-2 ring-accent-purple shadow-2xl scale-105'
                    : 'bg-bg-mid text-white/80 hover:bg-bg-light hover:text-white shadow-md hover:shadow-xl hover:scale-105'
                }`}
              >
                {exo}
              </button>
            ))}
          </div>
        )}

        {/* Record perso */}
        {tab && (
          <div className="text-center text-white/70">
            {record ? (
              <p>
                Record pour <strong>{tab}</strong> :{' '}
                {tab === 'Course' ? (
                  <>
                    {record.distance} km en {record.time_min} min (
                    {record.speed} km/h) —{' '}
                  </>
                ) : (
                  <>
                    {record.weight} kg, {record.reps} reps, {record.sets} séries —{' '}
                  </>
                )}
                <span className="text-accent-purple">+{record.points} pts</span>
              </p>
            ) : (
              <p>
                Aucun record pour <strong>{tab}</strong> pour l’instant.
              </p>
            )}
          </div>
        )}

        {/* Formulaire */}
        <section className="mx-auto max-w-xl bg-bg-light p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {msg && <p className="text-center text-green-300">{msg}</p>}

            {tab === 'Course' ? (
              <>
                <div>
                  <label className="block mb-1 text-white">Distance (km)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={distance}
                    onChange={(e) => setDistance(+e.target.value)}
                    className="w-full p-2 rounded bg-bg-mid text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-white">Temps (min)</label>
                  <input
                    type="number"
                    min={0}
                    value={timeMin}
                    onChange={(e) => setTimeMin(+e.target.value)}
                    className="w-full p-2 rounded bg-bg-mid text-white focus:outline-none"
                  />
                </div>
                <div>
                  <p className="text-white/70">
                    Vitesse :{' '}
                    <span className="font-semibold text-white">{speed} km/h</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block mb-1 text-white">Exercice</label>
                  <p className="py-2 px-3 bg-bg-mid rounded">{exercise || '—'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white mb-1">Poids (kg)</label>
                    <input
                      type="number"
                      min={0}
                      value={weight}
                      onChange={(e) => setWeight(+e.target.value)}
                      className="w-full p-2 rounded bg-bg-mid text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">Répétitions</label>
                    <input
                      type="number"
                      min={1}
                      value={reps}
                      onChange={(e) => setReps(+e.target.value)}
                      className="w-full p-2 rounded bg-bg-mid text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">Séries</label>
                    <input
                      type="number"
                      min={1}
                      value={sets}
                      onChange={(e) => setSets(+e.target.value)}
                      className="w-full p-2 rounded bg-bg-mid text-white focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-accent-purple text-white font-semibold rounded-lg hover:bg-accent-purple/90 transition"
            >
              Enregistrer {tab === 'Course' ? 'la course' : "l’exercice"}
            </button>
          </form>
        </section>
      </div>
    </PageLayout>
);
}
