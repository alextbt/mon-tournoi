'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Types
type Source = { id: number; name: string; cost: number; attempts: number };
type Challenge = { id: number; description: string; points: number; frequency: 'daily' | 'weekly'; done: boolean };
type Reward = { id: number; name: string; description: string; rarity_weight: number };
type InventoryItem = { id: number; name: string; description: string; obtained_at: string };

export default function SanctuaryEventPage() {
  const [destinyPoints, setDestinyPoints] = useState<number>(0);
  const [eventPoints, setEventPoints] = useState<number>(0);
  const [profileStyle, setProfileStyle] = useState<string>('');
  const [sources, setSources] = useState<Source[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rewardsMap, setRewardsMap] = useState<Record<number, Reward[]>>({});
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper: tirage pondéré
  const weightedPick = <T extends { rarity_weight: number }>(items: T[]): T => {
    const total = items.reduce((sum, i) => sum + i.rarity_weight, 0);
    let r = Math.random() * total;
    for (const it of items) {
      if (r < it.rarity_weight) return it;
      r -= it.rarity_weight;
    }
    return items[items.length - 1];
  };

  // Chargement initial : points, sources, défis, inventaire et style
  useEffect(() => {
    (async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;

      // 1) Points de destinée et points totaux
      const { data: up } = await supabase
        .from('user_points')
        .select('destiny_points,event_points')
        .eq('user_id', userId)
        .maybeSingle();
      setDestinyPoints(up?.destiny_points ?? 0);
      setEventPoints(up?.event_points ?? 0);

      // 2) Style de profil
      const { data: pr } = await supabase
        .from('profiles')
        .select('profile_style')
        .eq('user_id', userId)
        .maybeSingle();
      setProfileStyle(pr?.profile_style ?? '');

      // 3) Sources d'invocation
      const { data: src } = await supabase
        .from('sanctuary_sources')
        .select('id,name,cost');
      const { data: ua } = await supabase
        .from('user_sanctuary_attempts')
        .select('source_id,attempts')
        .eq('user_id', userId);
      const attemptMap = Object.fromEntries((ua ?? []).map(a => [a.source_id, a.attempts]));
      setSources((src ?? []).map(s => ({
        id: s.id,
        name: s.name,
        cost: s.cost,
        attempts: attemptMap[s.id] ?? 0,
      })));

      // 4) Défis et statuts
      const { data: ch } = await supabase
        .from('sanctuary_challenges')
        .select('id,description,points,frequency');
      const { data: uc } = await supabase
        .from('user_sanctuary_challenges')
        .select('challenge_id,status')
        .eq('user_id', userId);
      const statusMap = Object.fromEntries((uc ?? []).map(u => [u.challenge_id, u.status]));
      setChallenges((ch ?? []).map(c => ({
        id: c.id,
        description: c.description,
        points: c.points,
        frequency: c.frequency,
        done: statusMap[c.id] === 'accepted'
      })));

      // 5) Récompenses par source
      const promises = (src ?? []).map(async s => {
        const { data: rw } = await supabase
          .from('sanctuary_rewards')
          .select('id,name,description,rarity_weight')
          .eq('source_id', s.id);
        return [s.id, rw ?? []] as [number, Reward[]];
      });
      const entries = await Promise.all(promises);
      setRewardsMap(Object.fromEntries(entries));

      // 6) Inventaire complet
      const { data: inv } = await supabase
        .from('user_sanctuary_rewards')
        .select('id,obtained_at,sanctuary_rewards(name,description)')
        .eq('user_id', userId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setInventory((inv ?? []).map((r: any) => ({
        id: r.id,
        name: r.sanctuary_rewards.name,
        description: r.sanctuary_rewards.description,
        obtained_at: r.obtained_at,
      })));

      setLoading(false);
    })();
  }, []);

  // Handle invocation pulls
  const doPull = async (sourceId: number, count: number) => {
    const src = sources.find(s => s.id === sourceId);
    if (!src) return;
    const totalCost = src.cost * count;
    if (destinyPoints < totalCost) return alert('Pas assez de destinées.');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    // Deduct destiny points
    const newPts = destinyPoints - totalCost;
    setDestinyPoints(newPts);
    await supabase
      .from('user_points')
      .upsert(
        { user_id: userId, destiny_points: newPts },
        { onConflict: 'user_id' }
      );

    // Update attempts
    const newAtt = src.attempts + count;
    setSources(curr =>
      curr.map(s => s.id === sourceId ? { ...s, attempts: newAtt } : s)
    );
    await supabase
      .from('user_sanctuary_attempts')
      .upsert(
        { user_id: userId, source_id: sourceId, attempts: newAtt },
        { onConflict: 'user_id,source_id' }
      );

    // Draw rewards and refresh inventory
    for (let i = 0; i < count; i++) {
      const pool = rewardsMap[sourceId] || [];
      const r = weightedPick(pool);
      await supabase
        .from('user_sanctuary_rewards')
        .insert({
          user_id: userId,
          reward_id: r.id,
          obtained_at: new Date().toISOString()
        });
    }
    const { data: inv } = await supabase
      .from('user_sanctuary_rewards')
      .select('id,obtained_at,sanctuary_rewards(name,description)')
      .eq('user_id', userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setInventory((inv ?? []).map((r: any) => ({
      id: r.id,
      name: r.sanctuary_rewards.name,
      description: r.sanctuary_rewards.description,
      obtained_at: r.obtained_at
    })));
  };

  // Toggle challenge state
  const toggleChallenge = async (c: Challenge) => {
    const newDone = !c.done;
    const status = newDone ? 'accepted' : 'refused';
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    // Upsert challenge status
    await supabase
      .from('user_sanctuary_challenges')
      .upsert(
        { user_id: userId, challenge_id: c.id, status },
        { onConflict: 'user_id,challenge_id' }
      );

    // Update local state
    setChallenges(curr =>
      curr.map(ch => ch.id === c.id ? { ...ch, done: newDone } : ch)
    );

    // Adjust destiny points
    const adjustment = newDone ? c.points : -c.points;
    const updated = destinyPoints + adjustment;
    setDestinyPoints(updated);
    await supabase
      .from('user_points')
      .upsert(
        { user_id: userId, destiny_points: updated },
        { onConflict: 'user_id' }
      );
  };  
  
   // Consommation d'un item de l'inventaire
  const consumeItem = async (item: InventoryItem) => {
    const { id, name } = item;
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    // 1) Supprimer l'item de la table
    await supabase
      .from('user_sanctuary_rewards')
      .delete()
      .eq('id', id);

    // 2) Mettre à jour l'inventaire local
    setInventory(curr => curr.filter(i => i.id !== id));

    // 3) Déclencher l'effet
if (name === 'Eau gazeuse') {
  // Calcule la nouvelle valeur
  const updated = destinyPoints + 100;

  // Persiste dans la colonne `destiny_points`
  await supabase
    .from('user_points')
    .upsert(
      { user_id: userId, destiny_points: updated },
      { onConflict: 'user_id' }
    );

  // Met à jour le state local
  setDestinyPoints(updated);
}
else if (name === 'Donut') {
  // Calcule la nouvelle valeur
  const updated = eventPoints + 10;

  // Persiste dans la colonne `event_points`
  await supabase
    .from('user_points')
    .upsert(
      { user_id: userId, event_points: updated },
      { onConflict: 'user_id' }
    );

  // Met à jour le state local
  setEventPoints(updated);
}
else if (name === 'Eau plate') {
  // Calcule la nouvelle valeur
  const updated = destinyPoints + 200;

  // Persiste dans la colonne `destiny_points`
  await supabase
    .from('user_points')
    .upsert(
      { user_id: userId, destiny_points: updated },
      { onConflict: 'user_id' }
    );

  // Met à jour le state local
  setDestinyPoints(updated);
}
  else if (name === 'Donut sucré') {
  // Calcule la nouvelle valeur
  const updated = eventPoints + 20;

  // Persiste dans la colonne `event_points`
  await supabase
    .from('user_points')
    .upsert(
      { user_id: userId, event_points: updated },
      { onConflict: 'user_id' }
    );

  // Met à jour le state local
  setEventPoints(updated);
}
    else if (name === 'Masque du Sanctuaire') {
  // 1) détermine le nouveau style (toggle)
  const newStyle = profileStyle === 'Éthéré' ? '' : 'Éthéré';

  // 2) persiste en base dans profiles.profile_style
  await supabase
    .from('profiles')
    .update({ profile_style: newStyle })
    .eq('user_id', userId);

  // 3) mets à jour le state local pour ré-render
  setProfileStyle(newStyle);
}
    else if (name === 'Donut sucré au sucre') {
  // Calcule la nouvelle valeur
  const updated = eventPoints + 50;

  // Persiste dans la colonne `event_points`
  await supabase
    .from('user_points')
    .upsert(
      { user_id: userId, event_points: updated },
      { onConflict: 'user_id' }
    );

  // Met à jour le state local
  setEventPoints(updated);
}
    else if (name === 'Eau sacrée') {
  // Calcule la nouvelle valeur
  const updated = destinyPoints + 160;

  // Persiste dans la colonne `destiny_points`
  await supabase
    .from('user_points')
    .upsert(
      { user_id: userId, destiny_points: updated },
      { onConflict: 'user_id' }
    );

  // Met à jour le state local
  setDestinyPoints(updated);
}
    else if (name === 'Feu d’artifice') {
  // 1) détermine le nouveau style (toggle)
  const newStyle = profileStyle === 'Festif' ? '' : 'Festif';

  // 2) persiste en base dans profiles.profile_style
  await supabase
    .from('profiles')
    .update({ profile_style: newStyle })
    .eq('user_id', userId);

  // 3) mets à jour le state local pour ré-render
  setProfileStyle(newStyle);
}

else if (name === 'Donut béni') {
  // Calcule la nouvelle valeur
  const updated = eventPoints + 35;

  // Persiste dans la colonne `event_points`
  await supabase
    .from('user_points')
    .upsert(
      { user_id: userId, event_points: updated },
      { onConflict: 'user_id' }
    );

  // Met à jour le state local
  setEventPoints(updated);
}
else if (name === 'Eau bénie') {
  const updated = destinyPoints + 320;
  await supabase
    .from('user_points')
    .upsert(
      { user_id: userId, destiny_points: updated },
      { onConflict: 'user_id' }
    );
  setDestinyPoints(updated);
}
    else if (name === 'Voeu') {
  // 1) détermine le nouveau style (toggle)
  const newStyle = profileStyle === 'Divin' ? '' : 'Divin';

  // 2) persiste en base dans profiles.profile_style
  await supabase
    .from('profiles')
    .update({ profile_style: newStyle })
    .eq('user_id', userId);

  // 3) mets à jour le state local pour ré-render
  setProfileStyle(newStyle);
}

    else if (name === 'Pedro (RIP)') {
  // Calcule la nouvelle valeur
  const updated = eventPoints + 150;

  // Persiste dans la colonne `event_points`
  await supabase
    .from('user_points')
    .upsert(
      { user_id: userId, event_points: updated },
      { onConflict: 'user_id' }
    );

  // Met à jour le state local
  setEventPoints(updated);
}
  };

  if (loading) return <p className="text-center py-12 text-white">Chargement…</p>;

  return (
   <main className="relative min-h-screen overflow-x-hidden">
      {/* Fond mystique bleu */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-indigo-900 to-black" />

      <div className="relative w-4/5 mx-auto px-4 py-16 space-y-12 text-center text-white">
        <h1 className="text-5xl font-extrabold">Le Sanctuaire</h1>
        <p className="text-lg text-blue-300 px-6">
          Ici, vous pouvez invoquer la fortune et remporter des récompenses spéciales !<br/>
          Chaque essai coûte des points de destinée, gagnés en relevant des défis quotidiens et hebdomadaires. Les défis quotidiens sont réinitalisés tous les soirs vers 20h. Les défis hebdomadaires sont 
          actualisés tous les mercredis soirs. 
        </p>
        <Link href="/achivements/events/sanctuary/pulls">
          <button className="inline-block mb-6 text-blue-200 border border-blue-400 rounded-full w-8 h-8 leading-8 hover:bg-blue-500 transition">
            ⓘ
          </button>
        </Link>

        {/* Points de destinée */}
        <div className="text-center">
          <span className="text-sm uppercase text-blue-400">Vos points de destinée</span>
          <p className="mt-1 text-4xl font-extrabold">{destinyPoints}</p>
        </div>

        {/* Sources */}
        <section className="bg-bg-mid p-6 rounded-lg space-y-6">
          <h2 className="text-2xl font-semibold">Sources d’invocation</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {sources.map(src => (
              <div key={src.id} className="p-4 bg-bg-light rounded-lg text-center">
                <h3 className="text-xl font-bold mb-1">{src.name}</h3>
                <p>Coût : {src.cost} destinées</p>
                <p>Essais : {src.attempts}</p>
                <div className="mt-4 flex justify-center flex-wrap gap-2">
                  {[1,5,10].map(n => (
                    <button
                      key={n}
                      onClick={() => doPull(src.id, n)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition"
                    >
                      ×{n} ({src.cost * n})
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Inventory enlarged and consumable */}
        <section className="bg-bg-mid p-6 rounded-lg">
          <h2 className="font-semibold mb-4 text-2xl">Votre inventaire</h2>
          {inventory.length === 0 ? (
            <p className="text-white/70">Votre inventaire est vide.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.map(item => (
                <div key={item.id} className="p-4 bg-bg-light rounded-lg flex justify-between items-center">
                  <div className="text-left">
                    <p className="font-medium text-lg">{item.name}</p>
                    <p className="text-sm text-white/70">{item.description}</p>
                  </div>
                  <button
                    onClick={() => consumeItem(item)}
                    className="ml-4 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg font-semibold transition"
                  >
                    Utiliser
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Défis */}
        <section className="bg-bg-mid p-6 rounded-lg space-y-6">
          <h2 className="text-2xl font-semibold">Défis</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {['daily','weekly'].map(freq => (
              <div key={freq}>
                <h3 className="text-xl font-medium mb-4 capitalize text-center">
                  {freq === 'daily' ? 'Défis quotidiens' : 'Défis hebdomadaires'}
                </h3>
                <ul className="space-y-3">
                  {challenges.filter(c => c.frequency === freq).map(c => (
                    <li key={c.id} className="flex justify-between items-center">
                      <div>
                        <span className={c.done ? 'line-through text-gray-400' : ''}>
                          {c.description}
                        </span>
                        <span className="ml-2 text-sm text-blue-300">(+{c.points})</span>
                      </div>
                      <button
                        onClick={() => toggleChallenge(c)}
                        className={`px-3 py-1 rounded ${c.done ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'} text-white transition`}
                      >
                        {c.done ? 'Annuler' : 'Valider'}
                      </button>
                    </li>
                  ))}
                </ul>
                <Link href="/issues">
        <button className="mt-3 bg-blue-400 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg transition neon-red">
          Une idée de défi ?
        </button>
      </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
