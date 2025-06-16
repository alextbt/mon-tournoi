// src/app/rules/page.tsx
'use client';

import PageLayout from '@/components/PageLayout';

export default function RulesPage() {
  return (
    <PageLayout title="Règles du tournoi">
      <div className="max-w-3xl mx-auto space-y-12 py-12 px-4">
        {/* Objectif */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Objectif du tournoi
          </h2>
          <p className="text-white/70">
            Accumuler le plus de points dans les différentes catégories afin de devenir le champion du tournoi.
          </p>
        </section>

        {/* Format */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Format de la compétition
          </h2>
          <p className="text-white/70">
            Les joueurs participent individuellement au tournoi. Chacun choisit ses activités parmi les jeux et sports disponibles.
          </p>
        </section>

        {/* Points */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Gagner des points
          </h2>
          <p className="text-white/70">
            <strong>Réalisations</strong> : points pour la participation (ex. une partie jouée, une séance de sport).<br/>
            <strong>Succès</strong> : défis spéciaux plus difficiles, rapportant davantage de points.<br/>
            Notez que les succès et réalisations sont vérifiables à travers des sites comme Tracker.gg ou DPM.LOL. N&apos;hésitez pas à utiliser ces sites pour vérifier vos performances et réalisations 
            eSport. Pour le Sport, il peut vous être demandé des preuves de l&apos;exercice effectué, surtout si ce dernier rapporte beaucoup de points. La preuve est admise par tous moyens (relevé 
            électronique, témoin, vidéo...). Votre bonne foi est présumée, mais sachez que des contrôles et vérifications de la progression de chacun des joueurs a lieu très souvent. Pour que la compétition 
            soit la plus saine possible, soyez vigilants sur ce que vous validez.
          </p>
        </section>

        {/* Classements */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Classements
          </h2>
          <p className="text-white/70">
            Un classement individuel est mis à jour en temps réel pour suivre votre progression et comparer vos points avec les autres participants.
          </p>
        </section>

        {/* Réclamations */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Réclamations & propositions
          </h2>
          <p className="text-white/70">
            Pour signaler une erreur de points ou suggérer des améliorations, utilisez le formulaire de réclamation ou rejoignez-nous sur Discord.
          </p>
        </section>

        {/* Récompense */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Récompense
          </h2>
          <p className="text-white/70">
            Une petite récompense symbolique sera offerte au grand gagnant. Le plaisir de la compétition prime avant tout !
          </p>
        </section>

        {/* Dates clés */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Dates clés
          </h2>
          <p className="text-white/70">
            Du <strong>16 juin</strong> au <strong>31 août</strong>. De nouveaux défis seront ajoutés chaque semaine !
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
