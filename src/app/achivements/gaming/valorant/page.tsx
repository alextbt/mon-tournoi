// src/app/valorant/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

type Success = { id: number; title: string; description: string; points: number };

export default function ValorantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Data
  const [successes, setSuccesses] = useState<Success[]>([]);
  const [doneIds, setDoneIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [totalGamePoints, setTotalGamePoints] = useState(0);
  const [lastGamePoints, setLastGamePoints] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [agent, setAgent] = useState('');
  const [kills, setKills] = useState('');
  const [deaths, setDeaths] = useState('');
  const [assists, setAssists] = useState('');
  const [subTotalValorant, setSubTotalValorant] = useState(0);
  const [account, setAccount] = useState('');
  const [msg, setMsg] = useState('');

  // Initial fetch
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const userId = session.user.id;

      // fetch game records
      const { data: games } = await supabase
        .from('game_records').select('points')
        .eq('user_id', userId).eq('game','Valorant');
      const gamesTotal = (games||[]).reduce((sum, r) => sum + Math.max(r.points,0),0);
      setTotalGamePoints(gamesTotal);

      // fetch successes
      const { data: rawSuccesses } = await supabase
        .from('successes').select('id,title,description,points')
        .eq('category','Valorant').order('points',{ascending:true});
      setSuccesses(rawSuccesses || []);

      // fetch user successes
      const { data: rawUser } = await supabase
        .from('user_successes').select('success_id')
        .eq('user_id',userId);
      setDoneIds(new Set((rawUser||[]).map(u=>u.success_id)));

      // calc subtotal
      const successPts = (rawSuccesses||[])
        .filter(s=> (rawUser||[]).some(u=>u.success_id===s.id))
        .reduce((sum,s)=>sum+s.points,0);
      const total = successPts + gamesTotal;
      setSubTotalValorant(total);

      // fetch account
      const { data: acc } = await supabase
        .from('user_game_accounts').select('account_name')
        .eq('user_id', userId).eq('game','Valorant').maybeSingle();
      setAccount(acc?.account_name||'');

      setLoading(false);
    })();
  }, []);

  // update subtotal on changes
  useEffect(() => {
    const successPts = successes
      .filter(s=>doneIds.has(s.id)).reduce((sum,s)=>sum+s.points,0);
    const total = successPts + totalGamePoints;
    setSubTotalValorant(total);
    (async () => {
      const { data:{session} } = await supabase.auth.getSession(); if(!session) return;
      await supabase.from('user_points').upsert({user_id:session.user.id, valorant_points:total},{onConflict:'user_id'});
    })();
  }, [doneIds,totalGamePoints,successes]);

  const handleValidateSuccess = async(s:Success)=>{
    const { data:{session} } = await supabase.auth.getSession(); if(!session)return;
    await supabase.from('user_successes').insert({user_id:session.user.id,success_id:s.id});
    setDoneIds(prev=>new Set(prev).add(s.id));
  };
  const handleUnvalidateSuccess = async(s:Success)=>{
    const { data:{session} } = await supabase.auth.getSession(); if(!session)return;
    await supabase.from('user_successes').delete().eq('user_id',session.user.id).eq('success_id',s.id);
    setDoneIds(prev=>{const n=new Set(prev);n.delete(s.id);return n;});
  };

  const handleRecordGame = async(e:React.FormEvent)=>{
    e.preventDefault();
    const k=Number(kills)||0,d=Number(deaths)||0,a=Number(assists)||0;
    const pts=Math.max(k-d/2+a*0.65,0);
    setLastGamePoints(pts);
    const { data:{session} } = await supabase.auth.getSession(); if(!session)return;
    await supabase.from('game_records').insert([{user_id:session.user.id,player_first_name:playerName,character_name:agent,k,d,assists:a,points:pts,game:'Valorant'}]);
    setTotalGamePoints(prev=>prev+pts);
    setPlayerName('');setAgent('');setKills('');setDeaths('');setAssists('');
  };

  const handleSaveAccount = async()=>{
    const { data:{session} } = await supabase.auth.getSession(); if(!session){router.replace('/login');return;}
    await supabase.from('user_game_accounts').upsert({user_id:session.user.id,game:'Valorant',account_name:account},{onConflict:'user_id,game'});
    setMsg('Nom VALORANT enregistré !');setTimeout(()=>setMsg(''),3000);
  };

  const filtered = useMemo(() =>
    successes.filter(s=>s.title.toLowerCase().includes(searchTerm.toLowerCase())||s.description.toLowerCase().includes(searchTerm.toLowerCase())),
    [successes,searchTerm]
  );

  if(loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <p className="text-red-500 text-2xl">Chargement…</p>
    </div>
  );

  return (
    <>
      {/* Background VALORANT */}
      <div className="fixed inset-0 bg-cover bg-center" style={{backgroundImage:"url('/images/valorant-bg.jpg')"}} />
      {/* Header */}
      <header className="relative z-10 p-4 bg-black/70 backdrop-blur-md border-b border-red-600">
        <h1 className="text-4xl font-bold text-red-500">VALORANT – Succès et réalisations</h1>
      </header>
      {/* Main */}
      <main className="relative z-10 flex flex-col md:flex-row gap-8 p-8 text-lg text-white">
        {/* Left Column */}
        <aside className="md:w-2/5 flex flex-col gap-8">
          {/* Record Game */}
          <section className="bg-gray-900 bg-opacity-60 backdrop-blur-sm ring-2 ring-red-600 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-red-400 mb-4">Enregistrer une partie</h2>
            <form onSubmit={handleRecordGame} className="space-y-4">
              <input type="text" value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="Prénom" className="w-full p-3 rounded bg-gray-800" required />
              <input type="text" value={agent} onChange={e=>setAgent(e.target.value)} placeholder="Agent" className="w-full p-3 rounded bg-gray-800" required />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={kills} onChange={e=>setKills(e.target.value)} placeholder="K" className="p-3 rounded bg-gray-800" />
                <input type="number" value={deaths} onChange={e=>setDeaths(e.target.value)} placeholder="D" className="p-3 rounded bg-gray-800" />
                <input type="number" value={assists} onChange={e=>setAssists(e.target.value)} placeholder="A" className="p-3 rounded bg-gray-800" />
              </div>
              <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold">Enregistrer</button>
            </form>
            <p className="mt-4 text-white/70 text-sm">
  Points = <code>K - (D/2) + (A × 0,65)</code> (valeur minimale 0).
</p>
{lastGamePoints !== null && (
  <p className="mt-3 text-white">
    Dernière partie : <strong>+{lastGamePoints} pts</strong>
  </p>
)}
<p>Total parties: <strong>{totalGamePoints}</strong></p>
          </section>
          {/* Account */}
          <section className="bg-gray-900 bg-opacity-60 backdrop-blur-sm ring-2 ring-red-600 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl text-red-400 mb-3">Compte VALORANT</h3>
            <div className="flex gap-2">
              <input type="text" value={account} onChange={e=>setAccount(e.target.value)} placeholder="Ex: Jett#1234" className="flex-1 p-3 rounded bg-gray-800" />
              <button onClick={handleSaveAccount} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">Sauvegarder</button>
            </div>
            {msg && <p className="mt-2 text-red-300">{msg}</p>}
          </section>
          {/* Subtotal */}
          <section className="bg-gray-900 bg-opacity-60 backdrop-blur-sm ring-2 ring-red-600 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl text-red-400 mb-2">Sous-total</h3>
            <p className="text-2xl font-bold">{subTotalValorant} pts</p>
          </section>
        </aside>
        {/* Right Column Successes */}
        <section className="flex-1 bg-gray-900 bg-opacity-60 backdrop-blur-sm ring-2 ring-red-600 p-8 rounded-xl shadow-lg overflow-auto">
          <h2 className="text-2xl text-red-400 mb-4">Succès VALORANT</h2>
          <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Recherche…" className="w-full mb-4 p-3 rounded bg-gray-800" />
          <ul className="space-y-4">
            {filtered.map(s=>{
              const done=doneIds.has(s.id);
              return (
                <li key={s.id} className="flex justify-between bg-gray-800 p-4 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-white">{s.title}</h3>
                    <p className="text-gray-400 text-sm">{s.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-red-400">+{s.points}</span>
                    {done
                      ? <button onClick={()=>handleUnvalidateSuccess(s)} className="px-3 py-1 bg-gray-700 rounded">Annuler</button>
                      : <button onClick={()=>handleValidateSuccess(s)} className="px-3 py-1 bg-red-600 rounded">Valider</button>
                    }
                  </div>
                </li>
              );
            })}
            {filtered.length===0 && <li className="text-gray-400 text-center">Aucun succès.</li>}
          </ul>
        </section>
      </main>
      {/* Footer */}
      <footer className="text-center py-4 relative z-10">
        <Link href="/achivements" className="text-red-400 hover:underline">← Retour catégories</Link>
      </footer>
    </>
  );
}
