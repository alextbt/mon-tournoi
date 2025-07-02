// src/app/achivements/gaming/hades/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
}

// Définition initiale des succès
const achievementDefs: Achievement[] = [
  { id: 'escaped_tartarus', title: 'Échappé du Tartare', description: 'Traversez le Tartare', points: 10 },
  { id: 'escaped_asphodel', title: "Échappé de l'Asphodèle", description: "Traversez l'Asphodèle", points: 10 },
  { id: 'arms_collector', title: 'Collectionneur d’Armes', description: 'Déverrouillez toutes les Armes de la cour', points: 10 },
  { id: 'friends_in_high_places', title: 'Amis Haut Placés', description: 'Utilisez l’Appel Ultime d’un dieu de l’Olympe', points: 15 },
  { id: 'escaped_elysium', title: 'Échappé de l’Élysée', description: 'Traversez l’Élysée', points: 20 },
  { id: 'chthonic_colleagues', title: 'Collègues Chthoniens', description: 'Accomplissez la prophétie Collègues Chthoniens', points: 25 },
  { id: 'is_there_no_escape', title: 'N’y a-t-il Aucune Issue ?', description: 'Échappez-vous des Enfers avec succès', points: 30 },
  { id: 'death_dealer', title: 'Sème-la-Mort', description: 'Battez Thanatos à son propre jeu avec au moins 15 points d’avance sur lui', points: 45 },
  { id: 'thanatocide', title: 'Thadocide', description: 'Tuez Thanatos 15 fois', points: 50 },
  { id: 'charon_deals', title: 'Filet Garni', description: 'Achetez 9 objets des Puits de Charon en une seule tentative d’évasion', points: 55 },
  { id: 'pet_cerberus', title: 'Bon Toutoutou', description: 'Caressez Cerbère 10 fois', points: 60 },
  { id: 'charon_frequent', title: 'Marchandeur à Toute Heure', description: 'Faites 20 échanges avec le Courtier Misérable', points: 60 },
  { id: 'administrative_chamber', title: 'Au Travail', description: 'Obtenez l’accès à et visitez la Chambre Administrative', points: 75 },
  { id: 'gods_blessed', title: 'Béni des Dieux', description: 'Acceptez 100 Bienfaits de l’Olympe différents', points: 85 },
  { id: 'aspect_master', title: 'Sang pour Sang', description: 'Faites passer un Aspect d’une Arme au niveau maximal', points: 90 },
  { id: 'orfeo_chorus', title: 'Maître Chanteur', description: 'Redonnez à Orphée l’envie de chanter', points: 100 },
  { id: 'friendship_bond', title: 'Ami Intime', description: 'Forgez un lien avec n’importe quel personnage', points: 150 },
  { id: 'river_dweller', title: 'Habitants des Fleuves', description: 'Pêchez un poisson de chaque région des Enfers', points: 175 },
  { id: 'interior_decorator', title: 'Décorateur d’Intérieur', description: 'Effectuez 50 travaux différents avec l’aide du Contremaître', points: 205 },
  { id: 'family_secret', title: 'Le Secret de Famille', description: 'Terminez la quête principale de l’histoire', points: 220 },
  { id: 'prophecy_runner', title: 'Ça Devait Arriver', description: 'Accomplissez 15 Prophéties', points: 240 },
  { id: 'charon_loyalty', title: 'Avec les Compliments de Charon', description: 'Obtenez une Carte de Fidélité', points: 250 },
  { id: 'architect_tools', title: 'Outils de l’Architecte', description: 'Choisissez 50 enchantements de Dédale différents', points: 300 },
  { id: 'companions_collected', title: 'Objet de Collection', description: 'Équipez-vous d’un Compagnon Chthonien', points: 310 },
  { id: 'arm_master', title: 'Maître d’Armes', description: 'Accomplissez la prophétie Maître d’Armes', points: 335 },
  { id: 'fated_escape', title: 'Arme du Destin', description: 'Échappez-vous des Enfers grâce à un Aspect caché', points: 350 },
  { id: 'beloved', title: 'Aimé de Tous', description: 'Obtenez tous les Souvenirs standard', points: 405 },
  { id: 'hotshot', title: 'Chaud Devant', description: 'Venez à bout d’un Portail de l’Érèbe sans subir de dégâts', points: 415 },
  { id: 'scholar', title: 'Érudit', description: 'Complétez toutes les pages du Codex concernant les dieux de l’Olympe', points: 450 },
  { id: 'war_god_thirst', title: 'La Soif du Dieu de la Guerre', description: 'Accomplissez la prophétie La Soif du Dieu de la Guerre', points: 475 },
  { id: 'champion_elysium', title: 'Champion de l’Élysée', description: 'Traversez l’Élysée malgré les Mesures d’Urgence', points: 500 },
  { id: 'muse_musician', title: 'La Muse et le Musicien', description: 'Accomplissez la prophétie La Muse et le Musicien', points: 500 },
  { id: 'speed_hermes', title: 'Vitesse d’Hermès', description: 'Bonus de vitesse ≥ 20% avec la Plume Étincelante', points: 520 },
  { id: 'power_abuse', title: 'Abus de Pouvoir', description: 'Utilisez l’Appel Ultime d’un dieu contre lui', points: 530 },
  { id: 'thoss_prize', title: 'La Babiole Sans Valeur', description: 'Obtenez le premier des prix de Thados', points: 540 },
  { id: 'reduced_boon', title: 'Avantages Réduits', description: 'Accomplissez la prophétie Avantages Réduits', points: 580 },
  { id: 'thank_but_no', title: 'Merci, Mais Non Merci', description: 'Purgez un Bienfait légendaire', points: 580 },
  { id: 'mirror_of_nyx', title: 'Le Miroir de Nyx', description: 'Déverrouillez un niveau de chaque Talent du Miroir de la Nuit', points: 605 },
  { id: 'night_shades', title: 'Nuit et Ténèbres', description: 'Accomplissez la prophétie Nuit et Ténèbres', points: 640 },
  { id: 'end_torture', title: 'Fin du Supplice', description: 'Accomplissez la prophétie Fin du Supplice', points: 660 },
  { id: 'infernal_arms', title: 'Armes Infernales', description: 'Découvrez tous les Aspects de chaque Arme', points: 690 },
  { id: 'dark_reflections', title: 'Reflets Obscurs', description: 'Accomplissez la prophétie Reflets Obscurs', points: 710 },
  { id: 'separated_death', title: 'Séparés par la Mort', description: 'Accomplissez la prophétie Séparés par la Mort', points: 775 },
  { id: 'historical_event', title: 'Un Évènement Historique', description: 'Terminez l’épilogue de l’histoire', points: 785 },
  { id: 'hard_conditions', title: 'Conditions Difficiles', description: 'Accomplissez la prophétie Conditions Difficiles', points: 825 },
  { id: 'lamentations', title: 'Les Dernières Lamentations de Thanatos', description: 'Obtenez le deuxième des prix de Thad', points: 850 },
  { id: 'thorn_of_thanatos', title: 'Épine de Thanatos', description: 'Bonus de dégâts ≥ 30% avec le Papillon Percé', points: 850 },
  { id: 'complete_collection', title: 'Collection Complète', description: 'Obtenez tous les Compagnons Chthoniens', points: 900 },
  { id: 'friends_for_life', title: 'Amis pour la Vie', description: 'Maximisez tous les Souvenirs standard', points: 1000 },
];

const externalImageLoader = ({ src }: { src: string }) => src;
const DEFAULT_CHARACTER = 'Zagreus';
const DEFAULT_WEAPON = 'Stygius';

export default function HadesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [gloryTotal, setGloryTotal] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [rooms, setRooms] = useState('');
  const [bestRun, setBestRun] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;
      setUserId(uid);

      // Charger succès enregistrés
      const { data: ua } = await supabase
        .from('user_hades_achievements')
        .select('achievement_id')
        .eq('user_id', uid);
      const ids = new Set(ua?.map(r => r.achievement_id) || []);
      setUnlockedIds(ids);

      // Charger meilleur run
      const { data: br } = await supabase
        .from('hades_run_totals')
        .select('best_rooms')
        .eq('user_id', uid)
        .single();
      const best = br?.best_rooms || 0;
      setBestRun(best);

      // Calcul gloire initiale: succès + 5 pts/salle
      const achPoints = achievementDefs
        .filter(a => ids.has(a.id))
        .reduce((sum, a) => sum + a.points, 0);
      const runGlory = best * 5;
      const total = achPoints + runGlory;
      setGloryTotal(total);

      // Persister gloire
      await supabase.from('user_points').upsert(
        { user_id: uid, glory: total },
        { onConflict: 'user_id' }
      );

      setLoading(false);
    })();
  }, []);

  const toggleAchievement = async (id: string) => {
    if (!userId) return;
    const isUnlocked = unlockedIds.has(id);
    const pts = achievementDefs.find(a => a.id === id)!.points;

    if (!isUnlocked) {
      await supabase.from('user_hades_achievements').insert({ user_id: userId, achievement_id: id });
      unlockedIds.add(id);
      setUnlockedIds(new Set(unlockedIds));
      const newTotal = gloryTotal + pts;
      setGloryTotal(newTotal);
      await supabase.from('user_points').upsert(
        { user_id: userId, glory: newTotal },
        { onConflict: 'user_id' }
      );
    } else {
      await supabase.from('user_hades_achievements')
        .delete()
        .eq('user_id', userId)
        .eq('achievement_id', id);
      unlockedIds.delete(id);
      setUnlockedIds(new Set(unlockedIds));
      const newTotal = gloryTotal - pts;
      setGloryTotal(newTotal);
      await supabase.from('user_points').upsert(
        { user_id: userId, glory: newTotal },
        { onConflict: 'user_id' }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const count = parseInt(rooms, 10);
    if (isNaN(count) || count <= 0) {
      alert('Veuillez saisir un nombre de salles valide (> 0)');
      return;
    }

    await supabase.from('hades_runs').insert({ user_id: userId, character: DEFAULT_CHARACTER, weapon: DEFAULT_WEAPON, rooms_completed: count, run_at: new Date().toISOString() });

    if (count > bestRun) {
      const delta = (count - bestRun) * 5;
      setBestRun(count);
      const newTotal = gloryTotal + delta;
      setGloryTotal(newTotal);
      await supabase.from('hades_run_totals').upsert(
        { user_id: userId, best_rooms: count },
        { onConflict: 'user_id' }
      );
      await supabase.from('user_points').upsert(
        { user_id: userId, glory: newTotal },
        { onConflict: 'user_id' }
      );
    }

    setRooms('');
  };

  if (loading) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-900 via-black to-black text-white">
      Chargement…
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-900 via-black to-black flex flex-col items-center pt-24 px-4">
      {/* Header sous navbar */}
      <header className="w-full bg-red-800 text-white py-4 px-6 fixed top-20 z-40">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-3 sm:mb-0">
            <Image loader={externalImageLoader} unoptimized src="https://cdn2.steamgriddb.com/icon/851300ee84c2b80ed40f51ed26d866fc/32/256x256.png" alt="Hades Symbol" width={40} height={40} />
            <span className="text-2xl font-bold">Gloire: {gloryTotal}</span>
          </div>
          <Link href="/achivements/events/hades/shop">
            <button className="bg-yellow-500 text-black hover:bg-yellow-600 font-semibold px-6 py-2 rounded-lg">
              Marché de Charon
            </button>
          </Link>
        </div>
      </header>
      <div className="h-28 w-full" />

      {/* Titre centré */}
      <div className="w-full text-center mb-8">
        <Image loader={externalImageLoader} unoptimized src="https://upload.wikimedia.org/wikipedia/commons/1/13/Hades_logo.png" alt="Hades Logo" width={480} height={240} className="mx-auto" />
      </div>

      {/* Formulaire + meilleur run */}
      <section className="w-full max-w-lg bg-black/70 backdrop-blur-sm rounded-2xl p-6 text-white mb-8">
        <h2 className="text-3xl font-semibold mb-2">Enregistrer votre première run</h2>
        <p className="text-sm text-gray-300 mb-4">Comptez le nombre de salles complétées en jouant votre première run !</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            min="1"
            placeholder="Nombre de salles"
            value={rooms}
            onChange={e => setRooms(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 placeholder-gray-400 text-white border border-gray-600 focus:outline-none"
          />
          <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-lg text-white transition">
            Enregistrer
          </button>
        </form>
        <p className="mt-4 text-lg">Meilleure run : <span className="font-bold">{bestRun} salles</span></p>
      </section>

      {/* Succès sans images */}
      <section className="w-full max-w-4xl bg-[#1a130e]/80 rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-semibold mb-6 text-center">Succès & Gloire</h2>
        <ul className="space-y-4">
          {achievementDefs.map(a => (
            <li key={a.id} className={`p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center border-2 ${unlockedIds.has(a.id) ? 'border-gold bg-black/30' : 'border-gray-700 bg-gray-900/50'}`}>
              <div className="flex-1 mb-4 sm:mb-0">
                <p className="font-semibold text-lg">{a.title}</p>
                <p className="text-gray-300 text-sm">{a.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleAchievement(a.id)}
                  className={`px-5 py-2 ${unlockedIds.has(a.id) ? 'bg-gray-500' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold rounded-lg text-lg transition`}
                >
                  {unlockedIds.has(a.id) ? 'Annuler' : 'Valider'}
                </button>
                <span className={`text-2xl font-bold ${unlockedIds.has(a.id) ? 'text-gold' : 'text-gray-600'}`}>+{a.points}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
