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
    'Développé militaire', 'Développé Arnold', 'Développé assis (haltères)', 'Élévations latérales (haltères)', 'Élévations latérales (poulie)',
    'Élévations frontales', 'Oiseau poulies', 'Rowing menton',
  ],
  Bras: [
    'Curl barre droite', 'Curl barre EZ', 'Curl concentration', 'Curl marteau', 'Curl haltères assis', 'Curl pupitre', 'Curl incliné',
    'Extensions triceps haltère', 'Extension triceps poulie haute', 'Extension triceps poulie basse', 'Pompes',
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
  'Développé assis (haltères)':     { type: 'image', src: '/media/developpe-assis-halteres.jpg' },
  'Élévations latérales (haltères)':{ type: 'image', src: '/media/elevations-laterales.jpg' },
  'Élévations latérales (poulie)':  { type: 'image', src: '/media/elevation-laterale-poulie.jpg' },
  'Élévations frontales':           { type: 'image', src: '/media/elevations-frontales.jpg' },
  'Oiseau poulies':                 { type: 'image', src: '/media/oiseau-poulies.jpg' },
  'Rowing menton':                  { type: 'image', src: '/media/rowing-menton.jpg' },
  // Bras
  'Curl barre droite':               { type: 'image', src: '/media/curl-barre-droite.jpg' },
  'Curl barre EZ':                   { type: 'image', src: '/media/curl-barre-ez.jpg' },
  'Curl concentration':              { type: 'image', src: '/media/curl-concentration.jpg' },
  'Curl marteau':                    { type: 'image', src: '/media/curl-marteau.jpg' },
  'Curl haltères assis':             { type: 'image', src: '/media/curl-assis.jpg' },
  'Curl pupitre':                    { type: 'image', src: '/media/curl-pupitre.jpg' },
  'Curl incliné':                    { type: 'image', src: '/media/curl-incline.jpg' },
  'Extensions triceps haltère':      { type: 'image', src: '/media/extension-triceps-halteres.jpg' },
  'Extension triceps poulie haute':  { type: 'image', src: '/media/extension-triceps-poulie-haute.jpg' },
  'Extension triceps poulie basse':  { type: 'image', src: '/media/extension-triceps-poulie-basse.jpg' },
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
    `Allongez-vous sur un banc plat avec les pieds fermement posés au sol, écartés de la largeur des hanches. Saisissez la barre en prise pronation (paumes vers l’avant) légèrement plus large que la largeur des épaules. Engagez les omoplates en les serrant pour stabiliser le haut du dos. Inspirez en descendant la barre de façon contrôlée jusqu’à ce qu’elle effleure légèrement la poitrine, coudes à environ 45°. Expirez puissamment en poussant la barre vers le haut en gardant une trajectoire la plus verticale possible, sans verrouiller complètement les coudes. Gardez le bas du dos légèrement cambré et les abdominaux gainés.`,

  'Développé couché (haltères)':
    `Allongez-vous sur un banc plat avec un haltère dans chaque main. Positionnez-les au niveau des épaules, paumes se faisant face ou légèrement tournées vers l’avant. Serrez les omoplates et gardez le dos stable. Inspirez, puis poussez simultanément les haltères vers le haut jusqu’à l’extension complète des bras. Expirez en contrôlant la descente des haltères de manière symétrique, en suivant la même trajectoire. Évitez les balancements et gardez les poignets alignés.`,

  'Développé incliné':
    `Réglez un banc incliné entre 30 et 45°. Allongez-vous avec les pieds au sol et la tête en haut. Saisissez la barre ou les haltères comme pour un développé couché. Inspirez en descendant la charge vers la partie supérieure des pectoraux, maintenez les coudes à 45° du corps. Expirez en poussant vers le haut jusqu’à l’extension des bras, sans cambrer excessivement le dos ni cambrer la nuque.`,

  'Développé décliné':
    `Placez le banc en légère déclinaison (10–20°). Allongez-vous et saisissez la barre en prise pronation. Inspirez en descendant la barre vers la partie inférieure de la poitrine. Expirez en poussant vers le haut, en gardant les abdos contractés pour stabiliser le bassin et éviter de glisser.`,

  'Pompes':
    `Positionnez-vous en planche haute, mains sous les épaules et pieds légèrement écartés. Gardez le corps aligné de la tête aux talons. Inspirez en fléchissant les coudes pour abaisser la poitrine jusqu’à quelques centimètres du sol, sans laisser les hanches s’affaisser. Expirez en repoussant, en contractant abdos et fessiers pour maintenir la planche.`,

  'Dips pectoraux':
    `Sur barres parallèles, saisissez les poignées et décollez les pieds du sol. Penchez légèrement le buste vers l’avant (environ 15°) pour cibler les pectoraux. Inspirez en fléchissant les coudes et descendez jusqu’à ce que les épaules soient alignées avec les coudes. Expirez en poussant pour remonter, coudes légèrement ouverts et tronc stable.`,

  'Écarté couché (haltères)':
    `Allongez-vous sur un banc plat avec un haltère dans chaque main, bras presque tendus et coudes légèrement fléchis. Inspirez en écartant les bras en arc de cercle jusqu’à ressentir un étirement dans la poitrine. Expirez en ramenant les haltères devant vous, en gardant la même amplitude, sans verrouiller les coudes.`,

  'Écarté aux poulies':
    `Debout entre deux poulies, poignées en main. Reculez légèrement pour créer une tension. Inspire en ouvrant les bras latéralement, coudes fixes et bras à hauteur d’épaules. Expire en ramenant les poignées devant la poitrine, en contractant les pectoraux.`,

  'Pec-deck':
    `Asseyez-vous sur la machine pec-deck, dos plaqué contre le dossier. Positionnez les coudes sur les pads et saisissez les poignées. Inspirez en écartant les bras jusqu’à 90°, en gardant le dos contre le dossier. Expirez en pressant les pads l’un contre l’autre devant la poitrine, en contractant les pectoraux.`,

  // Dos
  'Tractions pronation':
    `Suspendez-vous à une barre fixe, prise pronation (paumes vers l’avant), mains un peu plus larges que les épaules. Corps droit, jambes croisées. Inspirez en contractant les dorsaux pour tirer le menton au-dessus de la barre. Expirez en redescendant lentement sans balancer.`,

  'Tractions supination':
    `Suspendez-vous à la barre, prise supination (paumes vers vous), mains à largeur d’épaules. Inspirez en tirant la poitrine vers la barre, coudes pointant vers le bas. Expirez en contrôlant la descente, sans cambrer le dos.`,

  'Rowing barre':
    `Debout, pieds à largeur des hanches, barre devant les tibias. Genoux légèrement fléchis, buste penché à 45° dos neutre. Prise pronation. Inspirez en tirant la barre vers le nombril en serrant les omoplates. Expirez en revenant.`,

  'Rowing haltère unilatéral':
    `Placez un genou et une main sur un banc. Avec l’autre main, saisissez un haltère. Dos droit. Inspirez en tirant l’haltère vers la hanche, coude près du corps. Expirez en redescendant lentement.`,

  'Tirage horizontal':
    `Assis face à la poulie basse, pieds calés. Prise neutre ou pronation. Inspirez en tirant vers le ventre en serrant les omoplates. Expirez en revenant bras tendus.`,

  'Tirage vertical':
    `Assis face à la poulie haute, genoux calés. Prise pronation, mains larges. Inspirez en tirant la barre vers la poitrine, coudes vers le bas. Expirez en remontant contrôlé.`,

  'Shrug (haussement)':
    `Debout, haltères en mains le long du corps. Inspirez, hausser les épaules vers les oreilles sans plier les coudes. Expirez en relâchant lentement.`,

  'Oiseau (haltères)':
    `Debout, buste penché à 30° et jambes fléchies. Haltères sous les épaules. Inspirez en écartant latéralement jusqu’à l’horizontale. Expirez en redescendant.`,

  'Superman':
    `Allongez-vous face au sol, bras tendus devant vous. Contractez le dos et les fessiers pour lever simultanément bras et jambes de quelques centimètres. Maintenez 1–2 s, puis relâchez.`,

  'Soulevé de terre':
    `Debout, barre au sol proche des tibias. Prise pronation ou mixte. Genoux fléchis, dos droit. Inspirez, montez la barre en poussant sur les talons et déployant hanches et genoux. Verrouillez en haut, puis redescendez barre proche des jambes.`,

  'Traction L-Sit':
    `Comme une traction pronation, mais en position L-Sit : jambes tendues à 90° devant vous. Core engagé. Inspirez pour monter, expirez pour descendre.`,

  // Jambes
  'Squat barre':
    `Placez la barre sur les trapèzes, pieds à largeur épaules. Inspirez en fléchissant genoux et hanches pour descendre, dos droit et poitrine haute. Descendez jusqu’à cuisses parallèles au sol. Expirez en poussant sur les talons pour revenir.`,

  'Squat guidé':
    `Sur machine guidée, positionnez la barre sur vos trapèzes. Inspire en fléchissant genoux et hanches, descendez contrôlé. Expire en poussant la plateforme pour monter.`,

  'Presse à cuisses':
    `Assis, pieds à plat largeur hanches sur la plateforme. Inspirez en fléchissant les genoux pour abaisser la charge. Expirez en repoussant avec les talons, genoux alignés avec les orteils.`,

  'Presse à cuisses incliné':
    `Même principe que la presse classique mais siège incliné. Ajustez la position des pieds pour cibler quadriceps ou fessiers.`,

  'Fentes avant':
    `Debout, haltères en mains ou barre sur trapèzes. Faites un grand pas en avant, genou avant aligné sur la cheville, genou arrière près du sol. Inspirez en descendant, expirez en repoussant.`,

  'Leg curl assis':
    `Assis, chevilles sous le coussinet. Inspirez, fléchissez les genoux vers les fesses. Expirez en revenant contrôlé.`,

  'Leg curl debout':
    `Debout face à la machine, attachez l’élastique ou la tige à la cheville. Inspirez en fléchissant le genou pour amener le talon vers la fesse. Expirez en redescendant.`,

  'Mollets à la presse':
    `Pieds sur plateforme, genoux légèrement fléchis. Inspirez, poussez sur la pointe des pieds pour soulever la charge. Expirez en redescendant doucement.`,

  'Sissy squat':
    `Debout, pieds écartés, mains sur support. Fléchissez les genoux et penchez le buste en arrière en gardant le haut du corps droit. Inspirez en descendant, expirez en remontant.`,

  // Épaules
  'Développé militaire':
    `Barre au niveau des épaules, prise pronation. Inspirez, poussez la barre au-dessus de la tête en verrouillant légèrement les coudes. Expirez en redescendant sous contrôle.`,

  'Développé Arnold':
    `Assis, haltères en prise neutre devant les épaules. Inspirez, tournez les poignets en poussant les haltères au-dessus de la tête. Reversez la rotation en redescendant.`,

  'Élévations latérales (haltères)':
    `Debout, haltères le long du corps. Inspire, lève les bras latéralement jusqu’à la hauteur des épaules. Expire en redescendant.`,

  'Élévations latérales (poulie)':
    `Debout côté poulie basse, saisissez la poignée. Inspirez, levez latéralement jusqu’à l’horizontale. Expirez en contrôlant la descente.`,

  'Élévations frontales':
    `Debout, un haltère dans chaque main devant les cuisses. Inspire, lève les haltères devant jusqu’à hauteur des épaules. Expire en redescendant.`,

  'Oiseau poulies':
    `Debout entre deux poulies basses, buste incliné. Inspirez en écartant les poignées latéralement. Expirez en revenant.`,

  'Rowing menton':
    `Debout, barre prise serrée. Inspirez, tirez vers le menton en écartant les coudes. Expirez en redescendant.`,

  // Bras
  'Curl barre droite':
    `Debout, prise supination largeur épaules. Inspirez en fléchissant les coudes pour remonter la barre aux épaules. Expirez en redescendant.`,

  'Curl barre EZ':
    `Comme le curl barre droite, mais mains sur la barre EZ pour plus de confort.`,

  'Curl concentration':
    `Assis, coude calé sur votre cuisse intérieure. Inspirez en remontant l’haltère vers l’épaule. Expirez en redescendant.`,

  'Curl marteau':
    `Debout, haltères en prise neutre. Inspire, fléchis les coudes sans rotation. Expire en redescendant.`,

  'Curl haltères assis':
    `Assis, dossier droit, haltères en main. Inspirez en alternant ou simultané, remontez les haltères. Expirez en revenant.`,

  'Curl pupitre':
    `Assis sur un pupitre, bras posés, barre ou haltère en main. Inspirez en remontant. Expirez en revenant.`,

  'Curl incliné':
    `Allongé sur banc incliné, bras pendants. Inspirez en fléchissant les coudes pour remonter. Expirez en revenant.`,

  'Extensions triceps haltère':
    `Debout ou assis, haltère tenu à deux mains au-dessus de la tête. Inspirez en fléchissant les coudes pour abaisser l’haltère derrière la tête. Expirez en verrouillant les coudes en extension.`,

  'Extension triceps poulie haute':
    `Debout, face à la poulie haute. Inspirez, poussez la barre vers le bas jusqu’à verrouillage des coudes. Expirez en revenant.`,

  'Extension triceps poulie basse':
    `Debout dos à la poulie, barre ou corde derrière la tête. Inspirez, poussez vers l’avant. Expirez en revenant.`,

  'Dip triceps':
    `Sur barres parallèles, mains sous les épaules, torse droit. Inspirez en fléchissant les coudes vers l’arrière. Expirez en repoussant.`,

  // Abdos
  'Crunch au sol':
    `Allongez-vous dos au sol, genoux fléchis, pieds à plat. Mains derrière la tête, inspirez en soulevant épaules et omoplates du sol. Expirez en redescendant.`,

  'Relevé de jambes suspendu':
    `Suspendez-vous à une barre. Inspirez, contractez les abdos pour lever les jambes tendues ou fléchies à l’horizontale. Expirez en redescendant.`,

  'Planche':
    `En appui sur avant-bras et pointes de pied, corps aligné. Contractez abdos et fessiers. Respirez normalement et maintenez la position.`,

  'Gainage latéral':
    `Appui sur un avant-bras, corps aligné latéralement. Inspirez en maintenant le bassin élevé et contractez les obliques. Expirez en tenant la position.`,

  'Crunch poulie haute':
    `À genoux sous la poulie, poignées en mains. Inspirez, tirez vers le bas en fléchissant le tronc pour rapprocher la poitrine des genoux. Expirez en revenant.`,

  'Roulette abdo':
    `À genoux, mains sur la roulette. Inspirez, roulez lentement vers l’avant sans creuser le dos. Expirez en ramenant la roulette vers vous en contractant les abdos.`
};

// Coefficients de difficulté par exercice (valeur par défaut = 1 si non spécifié)
const EXERCISE_DIFFICULTY: Record<string, number> = {
  // Pecs
  'Développé couché (barre)':       1.5,
  'Développé couché (haltères)':    1.5,
  'Développé incliné':              1.4,
  'Développé décliné':              1.4,
  'Pompes':                         1.2,
  'Dips pectoraux':                 1.3,
  'Écarté couché (haltères)':       1.3,
  'Écarté aux poulies':             1.2,
  'Pec-deck':                       1.1,
  // Dos
  'Tractions pronation':            1.6,
  'Tractions supination':           1.6,
  'Rowing barre':                   1.4,
  'Rowing haltère unilatéral':      1.4,
  'Tirage horizontal':              1.3,
  'Tirage vertical':                1.3,
  'Shrug (haussement)':             1.1,
  'Oiseau (haltères)':              1.2,
  'Superman':                       1.1,
  'Soulevé de terre':               1.3,
  'Traction L-Sit':                 1.8,
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
  'Développé assis (haltères)':     1.3,      
  'Élévations latérales (haltères)':1.3,
  'Élévations latérales (poulie)':  1.2,
  'Élévations frontales':           1.2,
  'Oiseau poulies':                 1.2,
  'Rowing menton':                  1.3,
  // Bras
  'Curl barre droite':               1.2,
  'Curl barre EZ':                   1.2,
  'Curl concentration':              1.1,
  'Curl marteau':                    1.3,
  'Curl haltères assis':             1.1,
  'Curl pupitre':                    1.0,
  'Curl incliné':                    1.2,
  'Extensions triceps haltère':      1.3,
  'Extension triceps poulie haute':  1.2,
  'Extension triceps poulie basse':  1.3,
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