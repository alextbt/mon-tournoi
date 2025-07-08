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
            Accumuler le plus de points dans différentes catégories pour devenir champion tout en s’amusant.
          </p>
        </section>

        {/* Format */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Format
          </h2>
          <p className="text-white/70">
            Compétition individuelle : choisissez librement vos activités parmi les jeux vidéo et sports proposés.
          </p>
        </section>

        {/* Valeur des points */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Valeur des points
          </h2>
          <p className="text-white/70">
            Pour rester ludique et équitable, le barème récompense à la fois la durée et l’effort :
          </p>
          <ul className="list-disc list-inside text-white/70">
            <li>
              <strong>Durée</strong> : une session de 30 minutes rapporte presque autant que 30 minutes de jeu ou de sport.
            </li>
            <li>
              <strong>Performance</strong> : vos résultats ajustent le total de points pour valoriser vos efforts.
            </li>
          </ul>
        </section>

        {/* Gagner des points */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Gagner des points
          </h2>
          <p className="text-white/70">
            <strong>Réalisations</strong> : sessions de jeu ou de sport (ex. une partie jouée, une séance de sport).
            <br />
            <strong>Succès</strong> : défis spéciaux à plus forte valeur.
          </p>
          <p className="text-white/70">
            Vérifiez vos performances via Tracker.gg ou DPM.LOL pour l’eSport. Pour le sport, une preuve (capture, vidéo, témoin) peut être demandée en cas de gros gains de points.
          </p>
        </section>

        {/* Événements */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Événements
          </h2>
          <p className="text-white/70">
            Les événements sont des challenges temporaires (environ deux semaines chacun) qui chamboulent le barème régulier :
          </p>
          <ul className="list-disc list-inside text-white/70">
            <li>Ils offrent des points bonus pour tester de nouvelles activités.</li>
            <li>Ils ne permettent pas à un participant en bas du classement de passer directement en tête.</li>
            <li>Restez informé·e des prochains événements pour maximiser vos gains.</li>
          </ul>
        </section>

        {/* Classements */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Classements
          </h2>
          <p className="text-white/70">
            Un classement individuel mis à jour en temps réel pour suivre votre progression et vous comparer aux autres.
          </p>
        </section>

        {/* Phase finale */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Phase finale
          </h2>
          <p className="text-white/70">
            À partir de fin juillet, la dernière ligne droite commence : quelques semaines pour creuser l’écart.
            Les points finaux favorisent la polyvalence et le talent dans plusieurs catégories.
            Pour viser le podium, élargissez votre champ d’action !
          </p>
        </section>

        {/* Réclamations & suggestions */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Réclamations & suggestions
          </h2>
          <p className="text-white/70">
            Signalez une erreur de points ou faites une proposition via le formulaire dédié.
          </p>
        </section>

        {/* Récompense */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Récompense
          </h2>
          <p className="text-white/70">
            Une récompense symbolique sera remise au grand·e gagnant·e, mais le plaisir et l’esprit de compétition priment avant tout.
          </p>
        </section>

        {/* Dates clés */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2 pl-3 border-l-4 border-accent-purple">
            Dates clés
          </h2>
          <p className="text-white/70">
            Du <strong>16 juin</strong> au <strong>31 août</strong>.<br />
            De nouveaux défis et événements sont annoncés chaque semaine.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
