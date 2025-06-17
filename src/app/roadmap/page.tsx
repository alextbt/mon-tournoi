// src/app/roadmap/page.tsx
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
    '2025-06-18': 'Ajout de la catégorie « Escalade ».',
    '2025-06-19': 'Amélioration de la page « Musculation » : ajout d’exercices spécifiques et de réalisation spéciales (poids lourds).',
    '2025-06-21': 'Ajout du jeu TFT. Ajout de la catégorie événements limités.'
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
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-semibold">Version actuelle</h2>
            <p>v1.0 – Lancement officiel du site Grand Tournoi de l’Été !</p>
          </div>
        )}

        {/* contenu Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Calendrier</h2>
            {/* grille des dates */}
            <div className="grid grid-cols-7 gap-2">
              {roadmapDates.map(date => {
                const isSelected = selectedDate === date;
                const hasEvent = Boolean(events[date]);
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-2 rounded text-sm text-white transition
                      ${isSelected
                        ? 'bg-accent-purple'
                        : hasEvent
                        ? 'bg-white/20 hover:bg-white/30 ring-2 ring-accent-purple'
                        : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    {date.slice(8)}
                  </button>
                );
              })}
            </div>

            {/* détails date sélectionnée */}
            {selectedDate && (
              <div className="mt-4 p-4 bg-white/10 rounded text-white">
                <h3 className="font-medium">
                  {new Date(selectedDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <p className="mt-2 text-white/80">
                  {events[selectedDate]
                    ? events[selectedDate]
                    : "Aucune mise à jour programmée pour cette date."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
