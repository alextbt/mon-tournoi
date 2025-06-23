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
  '2025-06-24': 'Ajout de la catégorie Overwatch 2.',
  '2025-06-25': 'Modification de l’interface du profil pour inclure les événements en cours ainsi que leurs points. Ajout de la catégorie événement dans le classement.',
  '2025-06-26': 'Début de l’événement « Hadès ».',
  '2025-06-28': 'Ajout de la possibilité de lier son compte Chess.com avec son profil.',
  '2025-06-29': 'Début de l’événement « Sanctuaire ».',
  '2025-07-07': 'Fin de l’événement « Un grand pas pour l’humanité ! ».',
  '2025-07-13': 'Ajout d’une nouvelle source dans le Sanctuaire.',
  '2025-07-17': 'Fin de l’événement « Hadès ».',
  '2025-07-27': 'Fin de l’événement « Sanctuaire ».',
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
              v1.2 – Sortie de la version 1.2.
            </p>
            <p>
              Ajout dans la catégorie eSport des Échecs et dans la catégorie Sport du Cyclisme. Ajout des événements limités (un nouvel événement est déjà disponible !). Ajout de nouveaux succès pour
               toutes les catégories. Ajout des onglets TFT, ARAM, BRAWL et ARENA sur la page LOL. Modifications et ajout de succès pour les catégories LOL et VALORANT. 
               Rééquilibrage des points pour TOUTES les catégories : beaucoup de catégories verront leur succès ou réalisations réduites. Une baisse des points pour tous les joueurs a eu lieu. 
            </p>

            <h3 className="text-xl font-semibold">Anciennes mises à jour</h3>
            <div className="space-y-2">
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
