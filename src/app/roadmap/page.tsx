'use client';

import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';

type Tab = 'maj' | 'roadmap';

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState<Tab>('maj');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 1) Map des événements par date
const events: Record<string, string> = {
  '2025-06-16': 'Ajout des catégories : « LOL », « VALORANT » et « Musculation ».',
  '2025-06-17': 'Correction du tableau de classement. Activation du bonus/malus de choix du profil (Joueur / Sportif). Ajout du calcul des points dans la catégorie Musculation. Ajout du bouton des demandes.',
  '2025-06-18': 'Sortie de la version 1.1 : Ajout de la catégorie « Escalade ».',
  '2025-06-19': 'Refonte de la page LOL et VALORANT pour une meilleure clarté.',
  '2025-06-20': 'Amélioration de la page « Musculation » : ajout d’exercices spécifiques et de réalisations spéciales (poids lourds).',
  '2025-06-21': 'Ajout de l’onglet TFT sur le jeu League of Legends.',
  '2025-06-22': 'Sortie de la version 1.2 : Ajout dans la catégorie eSport des Échecs et dans la catégorie Sport du Cyclisme. Ajout des événements limités (un nouvel événement est déjà disponible !). Ajout de nouveaux succès pour toutes les catégories.',
  '2025-06-23': 'Modifications et ajout de succès pour les catégories LOL et VALORANT. Ajout des onglets TFT, ARAM, BRAWL et ARENA pour LOL. Rééquilibrage des points pour TOUTES les catégories : beaucoup de catégories verront leur succès ou réalisations réduites. Une baisse de plus de 20% des points dans toutes les catégories est à prévoir.', 
  '2025-06-24': 'Correction des bugs de classement, profil (réalisations spéciales). Ajout d’une colonne "Événements" sur le classement. Justification des points Escalade.',
  '2025-06-25': 'Modification de l’interface du profil pour inclure les événements en cours ainsi que leurs points. Ajout de la catégorie événement dans le classement.',
  '2025-06-27': 'Correction de la page Cyclisme.',
  '2025-06-28': 'Ajout de la possibilité de lier son compte Chess.com avec son profil.',
  '2025-07-01': 'Modification de la page Musculation : retrait de la partie sur la course. Ajout d’une nouvelle catégorie Course dans le Sport. Elle contiendra également la marche et exercices de course spéciaux. Création d’une nouvelle page « Réalisations spéciales » (actuellement sur la page musculation).',
  '2025-07-02': 'Début de l’événement « Sanctuaire ».',
  '2025-07-04': 'Correction et actualisation de la page Classement et Profil. Ajout de la colonne « Réalisations » dans le classement.',
  '2025-07-08': 'Mise à jour v1.3 : fin de l’événement « Un grand pas pour l’humanité ! » ; début des événements « Spear of Justice » et « Megalovania » ; ajout de la possibilité d’enregistrer des séances de marche sur la page Course et correction de la page ; précision du gain de points dans les catégories de cyclisme et d’échecs ; réduction des points obtenus à travers la réalisation de voies normales, difficiles et très difficiles pour l’escalade ainsi que pour les performances sur la page cyclisme ; refonte de la page des règles (règles plus précises et plus explicites ainsi que l’explication du choix du comptage des points pour toutes les catégories) et refonte totale de la page musculation : visuel des exercices avec méthodes et conseils pour chaque exercices, équilibrage des points pour tous les exercices (à la place de l’uniformisation actuelle). Enregistrement supplémentaire des séances en fonction des parties du corps travaillées. Ajout de points supplémentaire par séries de plusieurs jours d’entraînement et autres.',
  '2025-07-09': 'Nouveaux défis hebdomadaires pour le « Sanctuaire ». Complétion de certains éléments et fonctionnalités de la page Musculation.',
  '2025-07-10': 'Correction des pages « Spear of Justice » et « Megalovania ».',
  '2025-07-11': 'Actualisation des pages générales de Sport et de Esport.',
  '2025-07-13': 'Ajout d’une nouvelle source dans le « Sanctuaire ».',
  '2025-07-16': 'Nouveaux défis hebdomadaires pour le « Sanctuaire ».',
  
  '2025-07-19': 'Ajout de la catégorie Esport « Osu ».',
  '2025-07-21': 'Fin de l’événement « Spear of Justice ».',
  '2025-07-23': 'Nouveaux défis hebdomadaires pour le « Sanctuaire ».',
  '2025-07-28': 'Fin de l’événement « Megalovania ». Début de l’événement « Hadès ».',
  '2025-07-30': 'Fin de l’événement « Sanctuaire ».',
  '2025-08-11': 'Fin de l’événement « Hadès ».',
};

  // 2) Génère toutes les dates entre deux bornes incluses
  const generateDates = (from: string, to: string): string[] => {
    const dates: string[] = [];
    const curr = new Date(from);
    const end = new Date(to);
    while (curr <= end) {
      dates.push(curr.toISOString().slice(0, 10));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  // 3) Liste des dates de la roadmap
  const roadmapDates = useMemo(
    () => generateDates('2025-06-16', '2025-08-31'),
    []
  );

  // Date d'aujourd'hui au format YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);

  return (
    <PageLayout title="Roadmap & MàJ">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <h2>Notez que les mises à jour prévues et annoncées sortent généralement au soir de la date prévue.</h2>

        {/* onglets */}
        <div className="flex border-b border-white/30">
          <button
            onClick={() => setActiveTab('maj')}
            className={`px-4 py-2 -mb-px font-medium ${
              activeTab === 'maj'
                ? 'border-b-2 border-accent-purple text-white'
                : 'text-white/70'
            }`}
          >
            MàJ
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`ml-4 px-4 py-2 -mb-px font-medium ${
              activeTab === 'roadmap'
                ? 'border-b-2 border-accent-purple text-white'
                : 'text-white/70'
            }`}
          >
            Roadmap
          </button>
        </div>

        {/* contenu MàJ */}
        {activeTab === 'maj' && (
          <div className="text-white space-y-6">
            <h2 className="text-2xl font-semibold">Version actuelle</h2>
            <p>
              v1.3 – Mise à jour du mardi 8 juillet
            </p>
            <p>
              <strong>Événements</strong> 
              </p>
              <p>
              - L’événement « Hadès » a été fortement décalé en raison de problèmes liés à la base de donnée, demandant beaucoup de travail pour être réparé. Étant donné que l’événement n’est pas une priorité en 
              soi, le temps que tout cela soit réglé, l’événement commençera fin juillet et va durer deux semaines jusqu’à mi-août. Allez voir la Roadmap pour plus d’informations. Merci de votre patience. <br></br>
              - Fin de l’événement « Un grand pas pour l’humanité ! ». <br></br>
              - Début des événements « Spear of Justice » et « Megalovania ».
              </p>
              <p>
                <strong>Sport et Esport</strong>
                </p>
                <p>
              - Modification de la page Course : ajout de la possibilité d’enregistrer des séances de marche et corrections de la page. <br></br>
              - Modification de la page Escalade : réduction des points obtenus à travers la réalisation de voies difficiles (12 pts par voie → 8 pts par voie). <br></br>
              - Modification de la page Musculation : refonte totale de la page musculation. Cette refonte implique : une refonte graphique, un visuel des exercices avec méthodes et conseils pour 
              chaque exercices, un équilibrage des points pour tous les exercices en fonction de la difficulté à monter en poids (à la place de l’uniformisation actuelle), des succès spéciaux dédiés à chaque partie
              du corps travaillée, un ajout de points supplémentaire par séries de plusieurs jours d’entraînement ainsi qu’un classement spécial permettant de se comparer ou de partager ses résultats avec les 
              autres. 
              </p>
              <p>
                <strong>Autres modifications générales</strong>
                </p>
                <p>
              - Précision du gain de points dans les catégories de cyclisme, de course et d’échecs. <br></br>
              - Refonte de la page des règles : règles plus précises et plus explicites ainsi que l’explication du choix du comptage des points pour toutes les catégories. <br></br>
              - Adaptation du format de la page Profil pour téléphone.
            </p>
            <h3 className="text-xl font-semibold">Anciennes mises à jour</h3>
            <div className="space-y-2">
            <details className="bg-white/10 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium">
                  v1.2.3 – Mise à jour du mercredi 2 juillet
                </summary>
                <p className="mt-2 text-white/80">
                  Modification de la page Musculation : retrait de la partie sur la course. Ajout d’une nouvelle catégorie Course dans le Sport. Elle contiendra également la marche et exercices de course spéciaux. 
              Création d’une nouvelle page « Réalisations spéciales » (autrefois sur la page musculation) : elle accueille désormais des réalisations spéciales de votre choix, quoi que ce soit ! Début de 
              l’événement « Sanctuaire ».  
                </p>
              </details>
              <details className="bg-white/10 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium">
                  v1.2.2 – Mise à jour du lundi 30 juin.
                </summary>
                <p className="mt-2 text-white/80">
                  Décalage de la Roadmap : les mises à jour des derniers jours n’ont pas eu lieu à cause de problèmes plus urgents à gérer dans la base de donnée. Veuillez m’excuser ! 
              En attendant la v1.3 qui arrive lundi prochain, la Roadmap a été mise à jour pour la semaine à venir avec les éléments prévus. De plus voici les modifications apportées : 
              Correction de la page cyclisme. Ajout de la liaison du profil chess.com avec le tournoi, permettant de gagner des points. Mise à jour du profil afin de comptabiliser les points de la catégorie
              des échecs et du cyclisme. Actualisation des points d’événement. 
                </p>
              </details>
              <details className="bg-white/10 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium">
                  v1.2.1 – Mise à jour du mercredi 25 juin.
                </summary>
                <p className="mt-2 text-white/80">
                  Correction des bugs de classement, profil (réalisations spéciales). Ajout d’une colonne &quot;Événements&quot; sur le classement. Justification des points Escalade. Modification de l’interface 
              du profil pour inclure les événements en cours ainsi que leurs points. Ajout de la catégorie événement dans le classement. 
                </p>
              </details>
              <details className="bg-white/10 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium">
                  v1.2 – Mise à jour du lundi 23 juin.
                </summary>
                <p className="mt-2 text-white/80">
                  Ajout dans la catégorie eSport des Échecs et dans la catégorie Sport du Cyclisme. Ajout des événements limités (un nouvel événement est déjà disponible !). Ajout de nouveaux succès pour
               toutes les catégories. Ajout des onglets TFT, ARAM, BRAWL et ARENA sur la page LOL. Modifications et ajout de succès pour les catégories LOL et VALORANT. 
               Rééquilibrage des points pour TOUTES les catégories : beaucoup de catégories verront leur succès ou réalisations réduites. Une baisse des points pour tous les joueurs a eu lieu.
                </p>
              </details>
              <details className="bg-white/10 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium">
                  v1.1 – Mise à jour du jeudi 19 juin.
                </summary>
                <p className="mt-2 text-white/80">
                  Ajout de la catégorie Escalade. Ajout d&apos;une dizaine de succès dans les catégories eSport.
                </p>
              </details>
              <details className="bg-white/10 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium">
                  v1.0 – Lancement officiel du site Grand Tournoi de l’Été !
                </summary>
                <p className="mt-2 text-white/80">
                  Sortie initiale avec les catégories LOL, VALORANT et Musculation, système de points de jeu et premier lot de succès.
                </p>
              </details>
            </div>
          </div>
        )}

        {/* contenu Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Calendrier</h2>

            {/* détails + calendrier en grid fixe */}
            <div className="grid grid-rows-[minmax(8rem,auto)_1fr] gap-4">
              {/* zone détails (hauteur minimale) */}
              <div className="min-h-[8rem] p-4 bg-white/10 rounded text-white">
                {selectedDate ? (
                  <>
                    <h3 className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <p className="mt-2 text-white/80">
                      {events[selectedDate] ?? "Aucune mise à jour programmée pour cette date."}
                    </p>
                  </>
                ) : (
                  <p className="text-white/50">
                    Sélectionne une date pour voir le détail de la mise à jour.
                  </p>
                )}
              </div>

              {/* zone calendrier */}
              <div className="grid grid-cols-7 gap-2">
                {roadmapDates.map(date => {
                  const isSelected = selectedDate === date;
                  const hasEvent = Boolean(events[date]);
                  const isPast = date < today;

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 rounded text-sm transition ${
                        isSelected
                          ? 'bg-accent-purple text-white'
                          : isPast
                          ? 'bg-white/5 text-white/50'
                          : hasEvent
                          ? 'bg-white/20 hover:bg-white/30 ring-2 ring-accent-purple text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {date.slice(8)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
