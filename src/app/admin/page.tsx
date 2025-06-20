// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Submission = {
  id: number;
  user_id: string;
  first_name: string;
  achievement: string;
  created_at: string;
};

export default function AdminPage() {
  const [logged, setLogged] = useState(false);
  const [pw, setPw] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Fetch submissions when logged in
  useEffect(() => {
    if (logged) fetchSubmissions();
  }, [logged]);

  // Retrieve pending achievement requests
  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from('achievements')
      .select('id, user_id, first_name, achievement, created_at')
      .order('created_at', { ascending: false });
    setSubmissions(data || []);
  };

  // Attempt admin login
  const tryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === 'Pamplemousse') {
      setLogged(true);
    } else {
      alert('Mot de passe incorrect');
    }
  };

  // Accept a submission: prompt for points, insert into user_achievements, then delete
  const handleAccept = async (row: Submission) => {
    const input = window.prompt('Combien de points attribuer ?', '0');
    const pts = Number(input);
    if (isNaN(pts)) {
      alert('Nombre de points invalide.');
      return;
    }
    // Insert into user_achievements: use 'description' for the text column
    await supabase.from('user_achievements').insert({
      user_id: row.user_id,
      first_name: row.first_name,
      description: row.achievement,
      points: pts,
      achieved_at: new Date().toISOString(),
      result: 'accepted',
    });
    // Remove from raw requests
    await supabase.from('achievements').delete().eq('id', row.id);
    fetchSubmissions();
  };

  // Refuse a submission: insert with 0 points, then delete
  const handleRefuse = async (row: Submission) => {
    await supabase.from('user_achievements').insert({
      user_id: row.user_id,
      first_name: row.first_name,
      description: row.achievement,
      points: 0,
      achieved_at: new Date().toISOString(),
      result: 'refused',
    });
    await supabase.from('achievements').delete().eq('id', row.id);
    fetchSubmissions();
  };

  // Render login form
  if (!logged) {
    return (
      <main className="p-8">
        <h1>Admin — connexion</h1>
        <form onSubmit={tryLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Mot de passe"
            value={pw}
            onChange={e => setPw(e.target.value)}
            className="border p-2 rounded"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Entrer
          </button>
        </form>
      </main>
    );
  }

  // Render submissions list
  return (
    <main className="p-8 space-y-6">
      <h1>Demandes de réalisations</h1>
      {submissions.length === 0 && <p>Aucune demande en attente.</p>}
      {submissions.map(row => (
        <div key={row.id} className="p-4 border rounded flex justify-between items-center">
          <div>
            <p><strong>{row.first_name}</strong> demande : {row.achievement}</p>
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
    </main>
  );
}
