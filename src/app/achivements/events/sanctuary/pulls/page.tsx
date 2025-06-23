// src/app/achivements/events/sanctuary/pulls/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Source = {
  id: number;
  name: string;
};

type Reward = {
  id: number;
  name: string;
  description: string;
  rarity_weight: number;
};

export default function PullsPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [rewardsMap, setRewardsMap] = useState<Record<number, Reward[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1) récupérer toutes les sources
      const { data: srcData } = await supabase
        .from('sanctuary_sources')
        .select('id,name');
      const srcs = srcData ?? [];
      setSources(srcs);

      // 2) pour chaque source, récupérer ses récompenses
      const map: Record<number, Reward[]> = {};
      await Promise.all(
        srcs.map(async (s) => {
          const { data: rw } = await supabase
            .from('sanctuary_rewards')
            .select('id,name,description,rarity_weight')
            .eq('source_id', s.id);
          map[s.id] = rw ?? [];
        })
      );
      setRewardsMap(map);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <p className="text-center py-12 text-white">Chargement des taux de drop…</p>
    );
  }

  return (
    <main className="min-h-screen flex justify-center py-12 px-4 bg-gradient-to-br from-blue-800 via-indigo-900 to-black">
      <div className="w-4/5 space-y-8 text-white">
        <h1 className="text-4xl font-extrabold text-center">Taux de drop</h1>
        <p className="text-center text-blue-300 px-6">
          Découvrez ici toutes les récompenses possibles pour chaque source
          d’invocation, ainsi que leur probabilité d’apparition.
        </p>

        {sources.map((src) => {
          const rewards = rewardsMap[src.id] || [];
          const totalWeight = rewards.reduce(
            (sum, r) => sum + r.rarity_weight,
            0
          ) || 1;
          return (
            <section
              key={src.id}
              className="bg-bg-mid p-6 rounded-lg space-y-4"
            >
              <h2 className="text-2xl font-semibold">
                Source « {src.name} »
              </h2>
              <table className="w-full table-auto bg-bg-light rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-blue-900">
                    <th className="px-4 py-2 text-left">Récompense</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-right">Taux de drop</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((r) => {
                    const pct = ((r.rarity_weight / totalWeight) * 100).toFixed(2);
                    return (
                      <tr key={r.id} className="even:bg-white/10">
                        <td className="px-4 py-2">{r.name}</td>
                        <td className="px-4 py-2">{r.description}</td>
                        <td className="px-4 py-2 text-right">
                          {pct} %
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </main>
  );
}
