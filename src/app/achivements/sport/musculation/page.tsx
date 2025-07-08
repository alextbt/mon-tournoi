// src/app/musculation/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { FaRegCircle, FaTimesCircle } from 'react-icons/fa';
import Image from 'next/image';

// Persona 5 palette
const colors = {
  background: 'bg-black',
  primary: 'bg-red-600',
  accent: 'text-red-400',
  panel: 'bg-gray-900',
  text: 'text-white',
  subtext: 'text-gray-400',
};

// Groupes musculaires
const muscleGroups: Array<'Pecs'|'Dos'|'Jambes'|'Épaules'|'Bras'|'Abdos'> = [
  'Pecs','Dos','Jambes','Épaules','Bras','Abdos'
];

// Exercices par groupe
const EXERCISES: Record<string,string[]> = {
  Pecs: [
    'Développé couché (barre)', 'Développé couché (haltères)', 'Développé incliné',
    'Développé décliné', 'Pompes', 'Dips pectoraux', 'Écarté couché (haltères)',
    'Écarté aux poulies', 'Pec-deck',
  ],
  Dos: [
    'Tractions pronation', 'Tractions supination', 'Rowing barre', 'Rowing haltère unilatéral',
    'Tirage horizontal', 'Tirage vertical', 'Shrug (haussement)', 'Oiseau (haltères)', 'Superman', 
    'Soulevé de terre', 'Traction L-Sit',
  ],
  Jambes: [
    'Squat barre', 'Squat guidé', 'Presse à cuisses', 'Presse à cuisses incliné', 'Fentes avant',
    'Leg curl assis', 'Leg curl debout', 'Mollets à la presse', 'Sissy squat',
  ],
  Épaules: [
    'Développé militaire', 'Développé Arnold', 'Élévations latérales',
    'Élévations frontales', 'Oiseau poulies', 'Rowing menton',
  ],
  Bras: [
    'Curl barre droite', 'Curl barre EZ', 'Curl haltères', 'Curl incliné',
    'Curl poulie vis-à-vis', 'Extensions triceps haltère', 'Extension triceps poulie',
    'Dip triceps',
  ],
  Abdos: [
    'Crunch au sol', 'Relevé de jambes suspendu', 'Planche', 'Gainage latéral',
    'Crunch poulie haute', 'Roulette abdo',
  ],
};

// Médias explicatifs
const EXERCISE_MEDIA: Record<string,{type:'image'|'video';src:string}> = {
  // Pecs
  'Développé couché (barre)':       { type: 'image', src: '/media/developpe-couche-barre.jpg' },
  'Développé couché (haltères)':    { type: 'image', src: '/media/developpe-couche-haltere.jpg' },
  'Développé incliné':              { type: 'image', src: '/media/developpe-incline.jpg' },
  'Développé décliné':              { type: 'image', src: '/media/developpe-decline.jpg' },
  'Pompes':                         { type: 'image', src: '/media/pompes.jpg' },
  'Dips pectoraux':                 { type: 'image', src: '/media/dips-pectoraux.jpg' },
  'Écarté couché (haltères)':       { type: 'image', src: '/media/ecarte-couche-haltere.jpg' },
  'Écarté aux poulies':             { type: 'image', src: '/media/ecarte-aux-poulies.jpg' },
  'Pec-deck':                       { type: 'image', src: '/media/pec-deck.jpg' },
  // Dos
  'Tractions pronation':            { type: 'image', src: '/media/tractions-pronation.jpg' },
  'Tractions supination':           { type: 'image', src: '/media/tractions-supination.jpg' },
  'Traction L-Sit':                 { type: 'image', src: '/media/traction-l-sit.jpg'},
  'Rowing barre':                   { type: 'image', src: '/media/rowing-barre.jpg' },
  'Rowing haltère unilatéral':      { type: 'image', src: '/media/rowing-haltere-unilateral.jpg' },
  'Tirage horizontal':              { type: 'image', src: '/media/tirage-horizontal.jpg' },
  'Tirage vertical':                { type: 'image', src: '/media/tirage-vertical.jpg' },
  'Shrug (haussement)':             { type: 'image', src: '/media/shrug-haussement.jpg' },
  'Oiseau (haltères)':              { type: 'image', src: '/media/oiseau-halteres.jpg' },
  'Superman':                       { type: 'image', src: '/media/superman.jpg'},
  'Soulevé de terre':               { type: 'image', src: '/media/souleve-de-terre.jpg'},
  // Jambes
  'Squat barre':                    { type: 'image', src: '/media/squat-barre.jpg' },
  'Squat guidé':                    { type: 'image', src: '/media/squat-guide.jpg' },
  'Presse à cuisses':               { type: 'image', src: '/media/leg-press.jpg' },
  'Presse à cuisses incliné':       { type: 'image', src: '/media/leg-press-incline.jpg' },
  'Fentes avant':                   { type: 'image', src: '/media/fentes-avant.jpg' },
  'Leg curl assis':                 { type: 'image', src: '/media/leg-curl-assis.jpg' },
  'Leg curl debout':                { type: 'image', src: '/media/leg-curl-debout.jpg' },
  'Mollets à la presse':            { type: 'image', src: '/media/mollets-presse.jpg' },
  'Sissy squat':                    { type: 'image', src: '/media/sissy-squat.jpg' },
  // Épaules
  'Développé militaire':            { type: 'image', src: '/media/developpe-militaire.jpg' },
  'Développé Arnold':               { type: 'image', src: '/media/developpe-arnold.jpg' },
  'Élévations latérales':           { type: 'image', src: '/media/elevations-laterales.jpg' },
  'Élévations frontales':           { type: 'image', src: '/media/elevations-frontales.jpg' },
  'Oiseau poulies':                 { type: 'image', src: '/media/oiseau-poulies.jpg' },
  'Rowing menton':                  { type: 'image', src: '/media/rowing-menton.jpg' },
  // Bras
  'Curl barre droite':               { type: 'image', src: '/media/curl-barre-droite.jpg' },
  'Curl barre EZ':                   { type: 'image', src: '/media/curl-barre-ez.jpg' },
  'Curl haltères':                   { type: 'image', src: '/media/curl-halteres.jpg' },
  'Curl incliné':                    { type: 'image', src: '/media/curl-incline.jpg' },
  'Curl poulie vis-à-vis':           { type: 'image', src: '/media/curl-poulie-vis-a-vis.jpg' },
  'Extensions triceps haltère':      { type: 'image', src: '/media/extensions-triceps-haltere.jpg' },
  'Extension triceps poulie':        { type: 'image', src: '/media/extension-triceps-poulie.jpg' },
  'Dip triceps':                     { type: 'image', src: '/media/dip-triceps.jpg' },
  // Abdos
  'Crunch au sol':                   { type: 'image', src: '/media/crunch-au-sol.jpg' },
  'Relevé de jambes suspendu':       { type: 'image', src: '/media/releve-de-jambes-suspendu.jpg' },
  'Planche':                         { type: 'image', src: '/media/planche.jpg' },
  'Gainage latéral':                 { type: 'image', src: '/media/gainage-lateral.jpg' },
  'Crunch poulie haute':             { type: 'image', src: '/media/crunch-poulie-haute.jpg' },
  'Roulette abdo':                   { type: 'image', src: '/media/roulette-abdo.jpg' },
};

// Descriptions explicatives
const EXERCISE_DESCRIPTIONS: Record<string,string> = {
  // Pecs
  'Développé couché (barre)':
    'Allongez-vous sur un banc plat, pieds bien à plat au sol. Prenez la barre à la largeur des épaules en prise pronation (paumes vers l’avant). Décalez légèrement la barre pour que vos avant-bras soient verticaux. Inspirez, puis descendez lentement la barre jusqu’à toucher la poitrine (coudes à environ 45° du corps). Expirez en poussant la barre vers le haut sans verrouiller complètement les coudes. Concentrez-vous sur une trajectoire verticale et gardez le dos plaqué.',

  'Développé couché (haltères)':
    'Allongez-vous sur un banc plat avec un haltère dans chaque main. Positionnez les haltères au niveau des épaules, paumes se faisant face ou légèrement tournées. Inspirez, puis poussez simultanément les haltères vers le haut jusqu’à l’extension des bras. Redescendez lentement en contrôlant la charge. Gardez les poignets alignés avec les avant-bras et les épaules stables.',

  'Développé incliné':
    'Réglez un banc incliné à 30–45°. Allongez-vous avec les pieds au sol. Prenez la barre ou les haltères comme au développé couché. Inspirez en descendant la charge vers le haut des pectoraux. Expirez en poussant vers le haut. Veillez à ne pas cambrer excessivement le dos.',

  'Développé décliné':
    'Placez le banc en légère déclinaison (10–20°). Allongez-vous et saisissez la barre. Inspirez et descendez-la vers le bas de la poitrine. Expirez en poussant vers le haut. Gardez les abdos gainés pour stabiliser le bassin.',

  'Pompes':
    'Positionnez-vous en planche haute, mains sous les épaules et pieds légèrement écartés. Inspirez en fléchissant les coudes pour abaisser la poitrine jusqu’à quelques centimètres du sol. Expirez en repoussant. Conservez le corps aligné de la tête aux talons et contractez les abdos.',

  'Dips pectoraux':
    'Sur barres parallèles, saisissez les poignées et décollez les pieds du sol. Penchez légèrement le buste en avant et descendez les coudes vers l’arrière jusqu’à ce que les épaules soient au niveau des coudes. Inspirez en descendant, puis expirer en remontant en verrouillant légèrement les coudes.',

  'Écarté couché (haltères)':
    'Allongez-vous sur un banc plat avec un haltère dans chaque main, bras légèrement fléchis. Inspirez en écartant les bras en arc de cercle jusqu’à sentir un étirement en poitrine. Expirez en rapprochant les haltères devant la poitrine, coudes fixes.',

  'Écarté aux poulies':
    'Placez les poulies en hauteur, une poignée dans chaque main. Reculez d’un pas, pieds écartés. Inspirez en ouvrant les bras à l’horizontale, légèrement fléchis. Expirez en ramenant les poignées devant vous, en gardant les épaules basses.',

  'Pec-deck':
    'Asseyez-vous sur la machine pec-deck, dos plaqué contre le dossier. Positionnez les coudes sur les pads et les mains sur les poignées. Inspirez en écartant les bras, puis expirez en pressant vers l’avant jusqu’à ce que les mains se rapprochent.',

  // Dos
  'Tractions pronation':
    'Suspendez-vous à une barre fixe, prise pronation (paumes vers l’avant), mains un peu plus écartées que les épaules. Inspirez puis contractez les dorsaux pour tirer le menton au-dessus de la barre. Expirez en redescendant lentement. Gardez le corps droit et évitez le balancement.',

  'Tractions supination':
    'Suspendez-vous à la barre, prise supination (paumes vers vous), mains à largeur des épaules. Inspirez en tirant la poitrine vers la barre, coudes vers le bas. Expirez en contrôlant la descente. Gardez les épaules basses.',

  'Rowing barre':
    'Debout, pieds à largeur des hanches, barre devant les tibias. Fléchissez les genoux et penchez le buste en avant, dos droit. Prenez la barre en prise pronation. Inspirez en tirant la barre vers le nombril, coudes proches. Expirez en redescendant. Maintenez la colonne neutre.',

  'Rowing haltère unilatéral':
    'Placez un genou et une main sur un banc. Avec l’autre main, saisissez un haltère. Inspirez en tirant l’haltère vers la hanche, coude près du corps. Expirez en redescendant. Gardez le dos droit et le buste stable.',

  'Tirage horizontal':
    'Assis face à la poulie basse, pieds calés. Prenez la barre en prise neutre ou pronation. Inspirez en tirant la barre vers le ventre, serrant les omoplates. Expirez en revenant lentement à la position initiale, bras tendus.',

  'Tirage vertical':
    'Assis face à la poulie haute, genoux sous les cales. Prenez la barre en pronation, mains écartées. Inspirez en tirant la barre vers la poitrine, coudes vers le bas. Expirez en contrôlant la montée.',

  'Shrug (haussement)':
    'Debout, haltères ou barre en mains, bras tendus. Inspirez, puis hausser les épaules vers les oreilles sans plier les coudes. Expirez en redescendant lentement.',

  'Oiseau (haltères)':
    'Tenez un haltère dans chaque main, genoux légèrement fléchis. Penchez le buste en avant, dos droit. Inspirez en écartant les bras latéralement jusqu’à l’horizontale. Expirez en revenant. Contractez les trapèzes et l’arrière d’épaule.',

  // Jambes
  'Squat barre':
    'Placez la barre sur les trapèzes, pieds à largeur d’épaules. Inspirez en fléchissant les genoux et les hanches pour descendre en gardant le dos droit. Descendez jusqu’à ce que les cuisses soient au moins parallèles au sol. Expirez en revenant en position debout en poussant sur les talons.',

  'Squat guidé':
    'Sur la machine guidée, positionnez-vous sous la barre. Inspirez en fléchissant genoux et hanches, descendez lentement. Expirez en poussant la plateforme pour revenir. Pieds à largeur d’épaules.',

  'Presse à cuisses':
    'Asseyez-vous, pieds à plat sur la plateforme. Inspirez en fléchissant les genoux pour abaisser la plateforme vers vous. Expirez en poussant avec la plante des pieds, genoux vers l’ext’; gardez les pieds centraux.',

  'Fentes avant':
    'Tenez des haltères ou barre, dos droit. Faites un grand pas en avant, genou avant au-dessus de la cheville et genou arrière proche du sol. Inspirez en descendant, expirez en revenant en poussant sur le talon avant.',

  'Leg curl assis':
    'Asseyez-vous, placez l’arrière des chevilles sous les coussins. Inspirez, fléchissez les genoux pour rapprocher les talons des fesses. Expirez en revenant lentement.',

  'Leg curl debout':
    'Debout face à la machine, fixez l’attache au niveau de la cheville. Inspirez en amenant le talon vers la fesse, genou immobile. Expirez en contrôlant la descente.',

  'Mollets à la presse':
    'Pieds sur plateforme, genoux légèrement fléchis. Inspirez, poussez avec les orteils pour soulever la plateforme en contractant les mollets. Expirez en revenant lentement.',

  'Sissy squat':
    'Debout, pieds fixés, mains sur un support pour l’équilibre. Inspirez, fléchissez les genoux en inclinant légèrement le buste en arrière tout en gardant le haut du corps droit. Expirez en revenant.',

  // Épaules
  'Développé militaire':
    'Assis ou debout, barre au niveau des épaules, prise pronation. Inspirez, poussez la barre au-dessus de la tête en verrouillant légèrement les coudes. Expirez en redescendant sous contrôle.',

  'Développé Arnold':
    'Assis, haltères en prise neutre devant les épaules, paumes face à vous. Inspirez, tournez les poignets en poussant les haltères au-dessus de la tête. Expirez en redescendant et en inversant la rotation.',

  'Élévations latérales':
    'Debout, haltères le long du corps. Inspirez, levez les haltères latéralement jusqu’au niveau des épaules, coudes légèrement fléchis. Expirez en redescendant.',

  'Élévations frontales':
    'Tenez un haltère dans chaque main. Inspirez, levez les bras devant vous jusqu’au niveau des épaules. Expirez en redescendant lentement.',

  'Oiseau poulies':
    'Débrouillez-vous entre deux poulies basse. Corps incliné en avant, tirez la poignée latéralement en gardant l’autre bras fixe pour l’équilibre. Inspirez en tirant, expirez en revenant.',

  'Rowing menton':
    'Debout, barre en prise serrée (mains proches). Inspirez, tirez la barre vers le menton en écartant les coudes. Expirez en redescendant.',

  // Bras
  'Curl barre droite':
    'Debout, barre tenue en prise supination. Inspirez, fléchissez les coudes pour remonter la barre vers les épaules sans bouger les coudes. Expirez en redescendant.',

  'Curl barre EZ':
    'Même exécution qu’au curl barre droite, mais avec la barre EZ pour réduire la tension des poignets.',

  'Curl haltères':
    'Debout, haltères en mains. Inspirez, alternez ou simultanément, fléchissez les coudes pour amener les haltères vers les épaules. Expirez en revenant.',

  'Curl incliné':
    'Assis sur un banc incliné (environ 45°), laissez les bras pendre. Inspirez, fléchissez les coudes pour remonter les haltères. Expirez en revenant.',

  'Curl poulie vis-à-vis':
    'Debout entre deux poulies, poignées à hauteur d’épaule. Inspirez, tirez alternativement chaque poignée vers l’épaule. Expirez en contrôlant la descente.',

  'Extensions triceps haltère':
    'Assis ou debout, tenez un haltère avec les deux mains au-dessus de la tête. Inspirez, fléchissez les coudes derrière la tête. Expirez en verrouillant les coudes en extension.',

  'Extension triceps poulie':
    'Debout face à la poulie haute, barre ou corde en mains. Inspirez, poussez vers le bas jusqu’à extension complète des avant-bras. Expirez en contrôlant le retour.',

  'Dip triceps':
    'Sur barres parallèles, torse droit, mains sous les épaules. Inspirez en descendant les coudes vers l’arrière. Expirez en repoussant sans verrouiller totalement.',

  // Abdos
  'Crunch au sol':
    'Allongez-vous dos au sol, genoux fléchis et pieds à plat. Mains derrière la tête, inspirez, puis contractez les abdominaux pour relever les épaules du sol. Expirez en redescendant.',

  'Relevé de jambes suspendu':
    'Suspendez-vous à une barre. Inspirez, contractez les abdos et levez les jambes tendues ou fléchies jusqu’à l’horizontale. Expirez en redescendant lentement.',

  'Planche':
    'Mettez-vous en appui sur avant-bras et pointes de pied, corps aligné. Contractez abdos et fessiers. Respirez normalement et tenez la position.',

  'Gainage latéral':
    'En appui sur un avant-bras, corps aligné latéralement. Inspirez, gardez le bassin levé et contractez les abdos obliques. Expirez en maintenant.',

  'Crunch poulie haute':
    'Genoux sous la poulie, poignées en haut. Inspirez, tirez vers le bas en fléchissant le torse pour rapprocher la poitrine des genoux. Expirez en revenant.',

  'Roulette abdo':
    'À genoux, main sur la roulette. Inspirez, roulez lentement vers l’avant sans cambrer le dos. Expirez en tirant la roulette vers vous avec les abdos.'
};

// Coefficients de difficulté par exercice (valeur par défaut = 1 si non spécifié)
const EXERCISE_DIFFICULTY: Record<string, number> = {
  // Pecs
  'Développé couché (barre)':       1.5,
  'Développé couché (haltères)':    1.5,
  'Développé incliné':              1.4,
  'Développé décliné':              1.4,
  'Pompes':                          1.2,
  'Dips pectoraux':                 1.3,
  'Écarté couché (haltères)':       1.3,
  'Écarté aux poulies':             1.2,
  'Pec-deck':                       1.1,
  // Dos
  'Tractions pronation':            1.6,
  'Tractions supination':           1.6,
  'Rowing barre':                   1.4,
  'Rowing haltère unilatéral':     1.4,
  'Tirage horizontal':              1.3,
  'Tirage vertical':                1.3,
  'Shrug (haussement)':             1.1,
  'Oiseau (haltères)':              1.2,
  // Jambes
  'Squat barre':                    1.7,
  'Squat guidé':                    1.5,
  'Presse à cuisses':               1.4,
  'Fentes avant':                   1.4,
  'Leg curl assis':                 1.2,
  'Leg curl debout':                1.2,
  'Mollets à la presse':            1.1,
  'Sissy squat':                    1.3,
  // Épaules
  'Développé militaire':            1.5,
  'Développé Arnold':               1.5,
  'Élévations latérales':           1.2,
  'Élévations frontales':           1.2,
  'Oiseau poulies':                 1.2,
  'Rowing menton':                  1.3,
  // Bras
  'Curl barre droite':               1.2,
  'Curl barre EZ':                   1.2,
  'Curl haltères':                   1.1,
  'Curl incliné':                    1.2,
  'Curl poulie vis-à-vis':           1.2,
  'Extensions triceps haltère':      1.3,
  'Extension triceps poulie':        1.3,
  'Dip triceps':                     1.4,
  // Abdos (exos statiques en durée)
  'Crunch au sol':                   1.0,
  'Relevé de jambes suspendu':       1.2,
  'Planche':                         1.0,
  'Gainage latéral':                 1.0,
  'Crunch poulie haute':             1.1,
  'Roulette abdo':                   1.3,
};

export default function MusculationPage() {
  const [showDesc, setShowDesc] = useState(false);
  const [tab, setTab] = useState<typeof muscleGroups[number]>('Pecs');
  const [exercise, setExercise] = useState('');
  const [inputs, setInputs] = useState({ weight: '', reps: '', sets: '', duration: '' });
  const [msg, setMsg] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [record, setRecord] = useState<any>(null);
  const [subTotal, setSubTotal] = useState(0);
  const [groupTotal, setGroupTotal] = useState(0);

  // Chargement des données
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      if (exercise) {
        const { data: rec } = await supabase
          .from('sport_records')
          .select('points')
          .eq('user_id', userId)
          .eq('category', 'Musculation')
          .eq('exercise', exercise)
          .order('points', { ascending: false })
          .limit(1)
          .maybeSingle();
        setRecord(rec);
      }
      const { data: all } = await supabase
        .from('sport_records')
        .select('points')
        .eq('user_id', userId)
        .eq('category', 'Musculation');
      setSubTotal((all || []).reduce((s, r) => s + (r.points || 0), 0));
      const { data: part } = await supabase
        .from('sport_records')
        .select('points')
        .eq('user_id', userId)
        .eq('category', 'Musculation')
        .eq('body_part', tab);
      setGroupTotal((part || []).reduce((s, r) => s + (r.points || 0), 0));
    })();
  }, [tab, exercise, msg]);

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    const w = parseFloat(inputs.weight) || 0;
    const r = parseInt(inputs.reps, 10) || 0;
    const s = parseInt(inputs.sets, 10) || 0;
    const d = parseInt(inputs.duration, 10) || 0;

    let points = 0;
    const difficulty = EXERCISE_DIFFICULTY[exercise] ?? 1;
    if (['Planche', 'Gainage latéral'].includes(exercise)) {
      points = Math.floor((d / 10) * s * difficulty);
    } else {
      const weightFactor = Math.log2(w + 1);
      const base = (r / 2) * (s / 2) * weightFactor;
      const prelim = Math.floor(base * difficulty);
      const prevBest = record?.points ?? 0;
      const bonus = prelim > prevBest ? 10 : 0;
      points = prelim + bonus;
    }

    await supabase.from('sport_records').insert({
      user_id: userId,
      category: 'Musculation',
      body_part: tab,
      exercise,
      weight: w,
      reps: r,
      sets: s,
      points,
      run_at: new Date().toISOString(),
    });

    const { data: mus } = await supabase
      .from('sport_records')
      .select('points')
      .eq('user_id', userId)
      .eq('category', 'Musculation');
    const musSum = (mus || []).reduce((sum, rec) => sum + (rec.points || 0), 0);
    await supabase.from('user_points').upsert(
      { user_id: userId, musculation_points: musSum },
      { onConflict: 'user_id' }
    );

    setMsg(`+${points} pts !`);
    setExercise('');
    setInputs({ weight: '', reps: '', sets: '', duration: '' });
  };

  const media = exercise ? EXERCISE_MEDIA[exercise] : null;

  return (
    <div className={`${colors.background} min-h-screen p-6 sm:p-12 flex flex-col items-center`}>
      {/* Header */}
      <header className={`${colors.panel} w-full rounded-2xl shadow-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between`}>
        <h1 className={`text-3xl sm:text-4xl font-bold ${colors.text}`}>
          <GiWeightLiftingUp className="inline mr-2" />Musculation
        </h1>
        <div className="text-center">
          <p className={`${colors.subtext}`}>Total {tab}</p>
          <p className={`text-2xl font-bold ${colors.accent}`}>{groupTotal} pts</p>
        </div>
        <div className="text-center">
          <p className={`${colors.subtext}`}>Sous-total général</p>
          <p className={`text-3xl font-extrabold ${colors.accent}`}>{subTotal} pts</p>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex flex-wrap justify-center gap-4 mb-6">
        {muscleGroups.map(g => (
          <button
            key={g}
            onClick={() => { setTab(g); setExercise(''); setMsg(''); }}
            className={`px-4 py-2 rounded-full font-semibold ${g === tab ? 'ring-2 ring-red-500 bg-red-700' : 'bg-gray-800 hover:bg-gray-700'} ${colors.text}`}
          >
            {g}
          </button>
        ))}
      </nav>

      {/* Grid d'exercices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
        {EXERCISES[tab].map(exo => (
          <button
            key={exo}
            onClick={() => { setExercise(exo); setMsg(''); }}
            className={`p-4 h-32 rounded-lg flex items-center justify-center font-medium transition-transform ${exercise === exo ? 'bg-red-600 transform scale-105 shadow-2xl' : 'bg-gray-800 hover:bg-gray-700'} ${colors.text}`}
          >
            {exo}
          </button>
        ))}
      </div>

      {/* Média + explication */}
      {media && (
        <div className="w-full max-w-xl mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-full md:w-1/2 h-64">
              {media.type === 'image' ? (
                <Image src={media.src} alt={exercise} fill className="rounded-xl shadow-lg object-contain" />
              ) : (
                <video src={media.src} controls className="w-full h-full rounded-xl shadow-lg object-contain" />
              )}
            </div>
            <div className="w-full md:w-1/2">
              <button type="button" onClick={() => setShowDesc(s => !s)} className="mb-2 text-sm underline text-gray-400">
                {showDesc ? 'Cacher l\'explication' : 'Afficher l\'explication'}
              </button>
              {showDesc && <p className="text-white/80 text-sm">{EXERCISE_DESCRIPTIONS[exercise]}</p>}
            </div>
          </div>
        </div>
      )}

      <div className={`mb-6 ${colors.text} flex items-center gap-2`}>
        {record ? (
          <FaRegCircle className="text-red-500" />
        ) : (
          <FaTimesCircle className="text-gray-500" />
        )}
        <span>
          {record
            ? `Record ${tab}: ${record.reps} reps × ${record.sets} sets @ ${record.weight}kg = +${record.points} pts`
            : `Aucun record pour ${tab}`}
        </span>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className={`${colors.panel} w-full max-w-lg p-6 rounded-2xl shadow-xl space-y-4`}>
        {msg && <p className="text-center text-green-400">{msg}</p>}
        <div>
          <label className={`${colors.text} block mb-1`}>Exercice</label>
          <div className={`${colors.background} p-3 rounded ${colors.text}`}>{exercise || '—'}</div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {['Planche', 'Gainage latéral'].includes(exercise) ? (
            <div className="col-span-3">
              <label className={`${colors.text} block mb-1`}>Durée (secondes)</label>
              <input
                type="number"
                min={0}
                value={inputs.duration}
                onChange={e => setInputs(i => ({ ...i, duration: e.target.value }))}
                className="w-full p-2 rounded bg-gray-800 focus:outline-none"
              />
            </div>
          ) : (
            <>
              <div>
                <label className={`${colors.text} block mb-1`}>Poids (kg)</label>
                <input
                  type="number"
                  min={0}
                  value={inputs.weight}
                  onChange={e => setInputs(i => ({ ...i, weight: e.target.value }))}
                  className="w-full p-2 rounded bg-gray-800 focus:outline-none"
                />
              </div>
              <div>
                <label className={`${colors.text} block mb-1`}>Répétitions</label>
                <input
                  type="number"
                  min={1}
                  value={inputs.reps}
                  onChange={e => setInputs(i => ({ ...i, reps: e.target.value }))}
                  className="w-full p-2 rounded bg-gray-800 focus:outline-none"
                />
              </div>
              <div>
                <label className={`${colors.text} block mb-1`}>Séries</label>
                <input
                  type="number"
                  min={1}
                  value={inputs.sets}
                  onChange={e => setInputs(i => ({ ...i, sets: e.target.value }))}
                  className="w-full p-2 rounded bg-gray-800 focus:outline-none"
                />
              </div>
            </>
          )}
        </div>
        <button
          type="submit"
          className={`w-full py-3 rounded-2xl ${colors.primary} ${colors.text} font-bold hover:bg-red-700 transition`}
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}