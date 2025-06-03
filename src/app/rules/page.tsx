'use client';

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-purple-100 px-6 py-12 text-gray-800">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-800 mb-10 text-center">📜 Règles du Grand Tournoi de l’Été</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-700 mb-2">🎯 Objectif du tournoi</h2>
          <p>Accumuler le plus de points dans les différentes catégories (jeux, sport, culture générale) afin de devenir le champion du tournoi.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-700 mb-2">👥 Format de la compétition</h2>
          <p>Les joueurs participent individuellement au tournoi mais certains événements nécessitent la participation en équipe. Rejoignez une équipe en entrant le nom de l&apos;équipe à l&apos;inscription. 
            Notez que l&apos;inscription à une équipe est définitive.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-700 mb-2">🏆 Gagner des points</h2>
          <p>Chaque activité, jeu ou défi peut rapporter des points selon des critères définis. Des succès spécifiques permettent d’en gagner davantage.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-700 mb-2">📊 Classements</h2>
          <p>Un classement individuel et un classement par équipe seront mis à jour tout au long du tournoi sur le site.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-700 mb-2">✍️ Réclamations et propositions</h2>
          <p>Si vous avez des suggestions à faire sur l&apos;organisation du tournoi, du site dédié, sur l&apos;ajout de catégories ou de réalisations (dans les jeux, les sports ou en culture générale), 
            n&apos;hésitez pas à en faire part dans le salon dédié sur le Discord.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-700 mb-2">🏆 Récompense</h2>
          <p>Deux récompenses seront distribuées, respectivement au gagnant et à l&apos;équipe gagnante. Les prix sont mineurs, ne faisant figure que de symbole. 
            Jouez pour la compétition, pas pour le prix.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-700 mb-2">📅 Dates clés</h2>
          <p>Le tournoi commence le <strong>16 juin</strong> et se termine le <strong>31 août</strong>. De nouveaux défis apparaîtront chaque semaine !</p>
        </section>
      </div>
    </main>
  );
}
