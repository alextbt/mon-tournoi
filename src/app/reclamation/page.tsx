// src/app/reclamation/page.tsx
'use client';

import PageLayout from '@/components/PageLayout';

export default function ReclamationPage() {
  return (
    <PageLayout title="Réclamation">
      <div className="max-w-md mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold text-white mb-6">
          Formulaire de réclamation
        </h1>
        <form className="space-y-6">
          {/* Email de contact */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Votre adresse email
            </label>
            <input
              id="email"
              type="email"
              placeholder="votre.email@example.com"
              className="w-full p-2 border border-gray-600 rounded bg-bg-mid text-white focus:outline-none"
            />
          </div>

          {/* Texte de la réclamation */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-white mb-1">
              Décrivez votre réclamation
            </label>
            <textarea
              id="message"
              rows={6}
              placeholder="Expliquez votre demande ou problème..."
              className="w-full p-2 border border-gray-600 rounded bg-bg-mid text-white focus:outline-none"
            />
          </div>

          {/* Bouton d'envoi */}
          <button
            type="submit"
            className="w-full py-3 bg-accent-purple hover:bg-accent-purple/90 text-white font-semibold rounded-lg transition"
          >
            Envoyer la réclamation
          </button>
        </form>
      </div>
    </PageLayout>
  );
}
