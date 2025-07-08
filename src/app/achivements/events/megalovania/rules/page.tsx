'use client';

import React from 'react';
import Link from 'next/link';

export default function MegalovaniaRulesPage() {
  return (
    <main className="min-h-screen bg-black text-white px-8 py-12 determination text-lg">
      <div className="h-12" />

      <section className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-4xl font-semibold text-center mb-8">Introduction</h2>
        <p className="text-2xl">
          Dans Undertale, le combat est représenté par votre <span className="text-red-600">« âme »</span>, incarnée par un cœur dans
          un encadré. Pour affronter Sans, vous devrez maîtriser les commandes et comprendre les mécaniques propres à cet ennemi.
        </p>

        <h3 className="text-3xl font-semibold">1. Interface de combat</h3>
        <ul className="text-2xl list-disc list-inside space-y-2">
          <li>
            <span className="text-red-600 strong">Âme (votre cœur)</span> : se déplace à l’intérieur d’une boîte pour esquiver les attaques.
          </li>
          <li>
            <span className="text-yellow-300 strong">Points de vie (HP)</span> : affichés en jaune en bas de l’écran. Lorsque vous subissez une attaque,
            vos HP baissent. Si la barre atteint zéro, c’est perdu.
          </li>
          <li>
            <span className="text-purple-400 strong">Poison</span> : les attaques de Sans vous empoisonne. Vous ne pouvez rien faire contre ce poison. Vous perdez, dans le temps, la quantité de HP violacée. 
            Notez que vous ne pouvez pas mourir du poison.
          </li>
          <li>
            <strong>Menu</strong> : en bas de l’écran, quatre options : <span className="text-yellow-300">
            <code>FIGHT</code>, <code>ACT</code>, <code>ITEM</code>, <code>MERCY</code></span>.
          </li>
        </ul>

        <h3 className="text-3xl font-semibold">2. Les commandes</h3>
        <ul className="text-2xl list-disc list-inside space-y-2 mb-8">
            <li>
            Pour naviguez dans les menus ou esquiver, utilisez les touches directionnelles du clavier (↑↓→←). 
          </li>
          <li>Pour confirmer, cliquez sur la touche de validation « Z » ou « Entrée ».</li>
          <li>Pour annuler une action ou revenir en arrière dans les menus, cliquez sur « X ».</li>
        </ul>

        <h3 className="text-3xl font-semibold mb-8">3. Fonctionnalités du combat</h3>
        <ul className="text-2xl list-disc list-inside space-y-2 mb-8">
          <li>
            <code>FIGHT</code> : attaquer Sans. Vous infligez des dégâts en pressant la touche de validation lors du passage de la barre. Notez que Sans n’a qu’un seul point de vie et meurt en une attaque. 
            Cependant, il esquivera chacune de vos attaques... à l’exception de la dernière ! Vous devez ainsi survivre le plus longtemps possible afin de pouvoir lui infligez le coup fatal au moment où Sans 
            fatigue !
          </li>
          <li>
            <code>ACT</code> : interagir (check). Permet d’obtenir les informations statistiques de Sans. Pas d’effet spécial pour le combat.
          </li>
          <li>
            <code>ITEM</code> : consommer un objet pour restaurer vos HP. Les L. Hero rendent peu d’HP, le Steak et les I. Noodles rendent beaucoup d’HP tandis que la Pie rend tous vos HP. Utilisez vos objets 
            avec partimonie afin de pouvoir survivre !
          </li>
          <li>
            <code>MERCY</code> : épargner (ou clémence). Vous pouvez décider d’épargner Sans au lieu de le tuer, mais ce n’est pas possible avant la fin du combat.
          </li>
        </ul>

        <h3 className="text-3xl font-semibold">4. Phases d’attaque de Sans</h3>
        <p className="text-2xl mb-8">
          Le combat contre Sans est composé de multiples phases où il enchaîne des patterns d’os et de crânes, et autres projectiles. Vous devez déplacer votre cœur pour éviter chaque salve.
        </p>
        <ul className="text-2xl list-disc list-inside space-y-2">
          <li>
            Utilisez les flèches directionnelles de votre clavier pour bouger votre âme. 
          </li>
          <li>
            Dans certaines phases, la gravité change → votre cœur rebondit et devient plus lourd.
          </li>
          <li>
            Coeur <span className="text-red-600">rouge</span> : vous pouvez bouger votre coeur comme vous le souhaitez dans le cadre. 
          </li>
          <li>
            Coeur <span className="text-blue-600">bleu</span> : le cœur devient parfois bleu, changeant la physique de déplacement. En bleu, votre coeur est lourd et vous ne pouvez plus que le faire sauter. 
            La gravité peut s’appliquer sur n’importe quelle paroi. Sautez dans le sens inverse de la gravité pour éviter des attaques.
          </li>
        </ul>

        <h3 className="text-3xl font-semibold">5. Attribution des points</h3>
        <p className="text-2xl">
          Pour chaque attaque réalisée (option <code>FIGHT</code>), vous gagnez <strong>3 points</strong>.
          Les points bonus en fonction des phases terminées sont ajoutés manuellement après vérification.
        </p>

        <h3 className="text-3xl font-semibold">6. Conseils pratiques</h3>
        <ul className="text-2xl list-disc list-inside space-y-2">
          <li>Restez concentré : les patterns s’accélèrent.</li>
          <li>Apprenez les rythmes : Sans attaque toujours aux mêmes timings.</li>
          <li>Utilisez vos objets (<code>ITEM</code>) à bon escient pour restaurer vos HP.</li>
          <li>Attention parfois à la couleur des os qui viennent vous attaquer ! Si les os sont bleutés, il vous feront subir des dégâts s’ils détectent un mouvement à leur passage ! Il faut donc ne pas bouger
            lorsqu’un os bleu passe !
          </li>
        </ul>

        <div className="text-center">
          <Link href="/achivements/events/megalovania">
            <button className="mt-6 bg-blue-600 text-black font-bold px-6 py-3 rounded hover:bg-blue-700 transition">
              Retour au combat
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
