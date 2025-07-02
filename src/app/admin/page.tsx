// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Submission = {
  id: number;
  user_id: string;
  first_name: string;
  description: string;
  created_at: string;
};

export default function AdminPage() {
  const [logged, setLogged] = useState(false);
  const [pw, setPw] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Form custom creation
  const [newUserId, setNewUserId] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  useEffect(() => {
    if (logged) fetchSubmissions();
  }, [logged]);

  const tryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === 'Pamplemousse') setLogged(true);
    else alert('Mot de passe incorrect');
  };

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from('achievements')
      .select('id, user_id, first_name, description, created_at')
      .order('created_at', { ascending: false });
    setSubmissions(data || []);
  };

  const handleAccept = async (row: Submission) => {
    const input = window.prompt('Combien de points attribuer ?', '0');
    const pts = Number(input);
    if (isNaN(pts)) {
      alert('Nombre de points invalide.');
      return;
    }
    await supabase.from('user_achievements').insert({
      user_id: row.user_id,
      first_name: row.first_name,
      description: row.description,
      points: pts,
      achieved_at: new Date().toISOString(),
      result: 'accepted',
    });
    await supabase.from('achievements').delete().eq('id', row.id);
    fetchSubmissions();
  };

  const handleRefuse = async (row: Submission) => {
    await supabase.from('user_achievements').insert({
      user_id: row.user_id,
      first_name: row.first_name,
      description: row.description,
      points: 0,
      achieved_at: new Date().toISOString(),
      result: 'refused',
    });
    await supabase.from('achievements').delete().eq('id', row.id);
    fetchSubmissions();
  };

  const handleCreate = async () => {
    setCreateMsg(null);
    if (!newUserId || !newFirstName || !newDesc || !newPoints) {
      setCreateMsg('Tous les champs sont requis.');
      return;
    }
    const pts = Number(newPoints);
    if (isNaN(pts)) {
      setCreateMsg('Points invalide.');
      return;
    }
    // Directly create accepted achievement for any user
    const { error } = await supabase.from('user_achievements').insert({
      user_id: newUserId,
      first_name: newFirstName,
      description: newDesc,
      points: pts,
      achieved_at: new Date().toISOString(),
      result: 'accepted',
    });
    if (error) {
      console.error('Erreur création:', error);
      setCreateMsg('Erreur lors de la création.');
    } else {
      setCreateMsg('Achievement créé avec succès !');
      setNewUserId('');
      setNewFirstName('');
      setNewDesc('');
      setNewPoints('');
    }
  };

  if (!logged) {
    return (
      <main className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl mb-4">Admin — Connexion</h1>
        <form onSubmit={tryLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Mot de passe"
            value={pw}
            onChange={e => setPw(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded">
            Entrer
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl">Administration des réalisations</h1>

      {/* Creation Form */}
      <section className="p-4 border rounded space-y-4 max-w-xl">
        <h2 className="text-xl font-semibold mb-2">Créer un achievement manuellement</h2>
        {createMsg && <p className="text-green-600">{createMsg}</p>}
        <input
          placeholder="User ID"
          value={newUserId}
          onChange={e => setNewUserId(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          placeholder="Prénom"
          value={newFirstName}
          onChange={e => setNewFirstName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
        />
        <input
          placeholder="Points à attribuer"
          value={newPoints}
          onChange={e => setNewPoints(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Créer
        </button>
      </section>

      {/* Pending Submissions */}
      <section className="space-y-4 max-w-3xl">
        <h2 className="text-xl">Demandes en attente</h2>
        {submissions.length === 0 && <p>Aucune demande.</p>}
        {submissions.map(row => (
          <div key={row.id} className="p-4 border rounded flex justify-between items-center">
            <div>
              <p><strong>{row.first_name}</strong> : {row.description}</p>
              <p className="text-sm text-gray-500">le {new Date(row.created_at).toLocaleString()}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleAccept(row)}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                ✅ Accepter
              </button>
              <button
                onClick={() => handleRefuse(row)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                ❌ Refuser
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
