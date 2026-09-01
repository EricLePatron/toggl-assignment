# Toggl assignment

fait un prototype de toggl (https://focus.toggl.com/21635876/workspaces/21635113/calendar) selon ces spécifications : 

Ce PRD ne contient aucune feature nouvelle. C'est un squelette, pas un prototype de feature.

2. Portée

Dans le périmètre :

Reproduire la structure de navigation complète de Toggl Focus (barre latérale + écrans principaux listés en section 4).

Reproduire le design visuel — couleurs, typographie, espacements, composants (cartes, pills, badges, icônes) — à partir des repères de design déjà extraits de l'app réelle (section 5).

Peupler chaque écran avec des données mockées réalistes et cohérentes entre elles (section 6).

Hors périmètre (volontairement) :

Aucune nouvelle feature, aucune fonctionnalité IA — on attend le brief.

Aucun backend, aucune API, aucune base de données — tout est mocké en dur dans le code front.

Aucune authentification.

Aucune interaction fonctionnelle à l'intérieur d'un écran (voir section 7) — seule la navigation entre écrans principaux fonctionne (hypothèse A ci-dessus).

Pas de version mobile/responsive — l'app réelle est utilisée en desktop web, on reste sur ce format.

3. Architecture de navigation à répliquer

Barre latérale gauche, persistante sur tous les écrans, de haut en bas :

Badge logo "2.0" + nom du workspace ("Chollet Eric's organi...", tronqué) + chevron de sélection de workspace.

Section SUIVRE : "Minuteur" (route par défaut de l'app).

Section ANALYSER : "Rapports".

Section PLAN : "Projets", "Tâches", "Chronologie" (avec une étoile de favori).

Section GÉRER : "Membres", "Approbations" (étoile), "Congé" (étoile).

En bas : avatar circulaire "CE", icônes cloche/téléchargement/aide, encart "Mettre à niveau" avec badge "30 JOURS", liens "Télécharger des applications" et "⚙ Paramètres administratifs".

Chaque item de nav est cliquable et change l'écran affiché (hypothèse A). L'item actif est visuellement mis en évidence (fond en dégradé violet→rose).

4. Écrans à répliquer, détail par détail

Pour chaque écran, je précise ce qu'on a déjà vérifié en direct dans l'app (donc fiable pour Lovable tel quel) vs ce qui reste plus approximatif faute d'avoir testé ce sous-écran en détail — Lovable devra alors rester cohérent avec le style des écrans déjà bien documentés plutôt que d'improviser un style différent.

4.1 Minuteur / Calendrier (SUIVRE) — écran par défaut, déjà bien documenté

Barre du haut : titre contextuel, boutons secondaires ("Learn Toggl Focus", nom du projet en cours type "Toggl assignement" avec icône dossier verte), "# Étiquettes", icônes $ et ↑, compteur du minuteur en cours (ex. "0:18:30"), bouton rond rouge (stop), menu kebab (⋮).

Barre de progression "Enregistré Xh Ym · Prévu ... Zh · Voir les rapports >", en dégradé violet→rose avec segment vert.

Sélecteur de semaine ("< Cette semaine · S35 >") + sélecteur de vue (Semaine/dropdown) + icônes de bascule d'affichage (calendrier/grille/liste) + icône réglages + icône panneau latéral.

Grille calendrier hebdomadaire (Lun–Dim), blocs de tâches colorés par projet (vert, rose/magenta), heures affichées par jour, ligne "maintenant" indicative.

4.2 Rapports (ANALYSER) — 6 sous-onglets

Sous-onglets : Résumé, Utilisation, Charge de travail, Rentabilité, Journaux de temps, Temps libre.

Résumé : vue synthèse générale — style à aligner sur Charge de travail/Rentabilité ci-dessous (mêmes filtres en haut, même famille de composants).

Charge de travail : graphe hebdomadaire, ligne = heures de travail cible, barres = temps enregistré ; question affichée "Suis-je surchargé de travail ?".

Rentabilité : chiffres Revenu / Coût / Profit / Marge (% vs cible), bandeau "Données manquantes" listant les membres sans taux de coût et les projets facturables sans taux actif.

Utilisation, Journaux de temps, Temps libre : structure de page cohérente avec les autres rapports (mêmes filtres en haut, même style de tableau/graphe) — contenu approximatif, à garder simple et sobre plutôt que d'inventer des métriques improbables.

4.3 Projets (PLAN)

Liste des projets (voir données en section 6).

Détail d'un projet, 6 sous-onglets : Aperçu, Tâches, Tableau (kanban 4 colonnes Todo/In Progress/Blocked/Done, avec bouton ✨ de création IA visible mais inerte), Chronologie, Tableau de bord (Revenu/Coût/Profit), Membres.

Un projet a : Client, Dates, toggles Récurrent/Estimation/Facturable/Frais fixes (grisés "Premium" par défaut, cohérent avec le compte en essai).

4.4 Tâches (PLAN)

Liste/tableau des tâches avec colonnes : Projet, Dates, Estimation, Priorité, Étiquette, Assigné, Statut (Todo/In Progress/Blocked/Done), Billable.

4.5 Chronologie (PLAN)

Vue Gantt-like par personne, capacité disponible affichée (ex. "40h disponible"), badges de sur-allocation (ex. "+4h").

Sur un compte à peu de membres, prévoir un état à moitié vide avec message d'invitation ("Voyez qui est surbooké ou sous-capacité d'un coup d'œil. Inviter des membres.") — cohérent avec ce qu'on a observé.

4.6 Membres, Approbations, Congé (GÉRER)

États simples, cohérents avec un compte à faible effectif : liste de membres basique pour "Membres" ; états vides pour "Approbations" (workflow de validation de feuilles de temps) et "Congé" (module Premium, bandeau "$2/utilisateur/mois" visible, non activé).

4.7 Overlay "Demander à Toggl ⌘K" (chat Toggl AI)

Accessible depuis un raccourci global — champ de saisie centré, historique de conversation, réponses structurées (tableaux, sections "À retenir", bullet points d'actions).

Pour ce squelette : l'overlay s'ouvre visuellement (⌘K) et affiche un exemple de conversation déjà écrit (statique, pas de vraie saisie fonctionnelle) — utile de le montrer dès maintenant puisqu'il fait partie de "toute l'interface existante", mais son contenu reste figé.

5. Système de design — repères

Ces repères sont extraits de l'exploration en direct de l'app réelle (voir "Exploration produit — Toggl Focus.md" et la maquette H6 déjà publiée) — ils doivent être suivis strictement pour rester crédible dès l'ouverture à froid.

Fond général : quasi-noir à teinte violette (#0b0a10 / #0c0b10).

Barre latérale et surfaces de cartes : gris très foncé légèrement plus clair que le fond (#131019 à #1e1826), bordures fines (#2a2534).

Texte : blanc cassé (#f3f1f7) en primaire, gris-violet (#a49dae) en secondaire, gris plus sombre pour les libellés discrets.

Accent : dégradé violet → rose (#a855f7 → #ec4899), utilisé sur l'item de nav actif, les boutons primaires, les barres de progression.

Couleurs sémantiques (distinctes de l'accent) : rouge corail pour critique/enregistrement (#ff5c7a), orange pour avertissement (#f5a623), vert pour positif (#3ee08b).

Typographie : une police sans-serif géométrique moderne type Inter (Google Fonts), chiffres alignés en tabulaire pour les colonnes numériques, libellés en petites capitales espacées pour les en-têtes de données (ex. "TEMPS SUIVI").

Composants : boutons en pilule très arrondis, cartes à coins arrondis (~12–16px) avec bordure fine, badges/chips de couleur pour les projets et statuts.

6. Données mockées — cohérence entre écrans

Réutiliser un jeu de données unique et cohérent partout (mêmes chiffres visibles dans Calendrier, Rapports et Projets), basé sur ce qu'on a observé en conditions réelles :

Workspace : "Chollet Eric's organisation", utilisateur "Chollet Eric" (avatar "CE").

Projets : Certification (11h suivies / 0h facturable / 5 entrées), Rituels Agiles (10,5h / 0h / 25 entrées), MedGPT (5h / 0h / 2 entrées), Intégration – CGM (3h / 3h facturable / 1 entrée), Intégration – JulieSolution (3h / 3h facturable / 1 entrée), Toggl assignement (2,5h / 0h / 3 entrées).

Tâches types (pour peupler Tableau/Chronologie) : des tâches réalistes de certification réglementaire (dossier technique, analyse de risques, notice d'utilisation…) pour rester cohérent avec le contexte MedGPT déjà utilisé dans l'exploration.

Semaine affichée par défaut : semaine courante avec quelques entrées réparties sur 2-3 jours, pas les 7 jours pleins (cohérent avec un usage réel, pas une démo trop parfaite).

Bandeau essai : "30 JOURS" restants, "Vous essayez 10 fonctionnalités Premium sur ce projet — récurrents, estimation, facturation & plus."

7. Règles d'interaction — ce qui est inerte

Tout, à l'intérieur d'un écran, est visuel uniquement (état "dead link" explicitement toléré par le guide) :

Le minuteur ne démarre/n'arrête rien réellement (le bouton stop est affiché mais inerte).

Les boutons d'action (créer tâche, créer projet, sauvegarder, exporter CSV, ✨ création IA) sont visibles, réagissent au survol (hover) pour rester crédibles visuellement, mais ne déclenchent aucune action.

Aucun formulaire ne se soumet, aucun champ n'est réellement éditable (ou alors visuellement focusable sans persister la saisie).

Le kanban n'est pas draggable, la Chronologie n'est pas éditable, le calendrier n'accepte pas de drag&drop.

Les filtres, tris et recherches affichés ne filtrent rien — l'état affiché est toujours le même jeu de données mock.

Seule la navigation entre les écrans principaux de la barre latérale (section 3) est fonctionnelle.

8. Stack technique suggérée

React + Tailwind (stack par défaut de Lovable), routing simple (ex. react-router) pour la navigation entre écrans principaux.

Toutes les données mockées dans des fichiers/objets JS ou TS statiques (fixtures), pas d'appel réseau.

Structurer le code pour qu'ajouter un nouvel écran ou un nouvel item de nav plus tard (une fois le brief connu) soit trivial — c'est le seul vrai critère de qualité technique à ce stade, puisque ce squelette sera modifié dans l'urgence des 24h.

9. Critères d'acceptation

Un lien déployé, ouvrable par n'importe qui sans compte ni connexion.

Ouvert à froid, ressemble à s'y méprendre à une capture réelle de Toggl Focus — c'est le seul test qui compte à ce stade.

Navigable entre tous les écrans listés en section 4 sans erreur, sans qu'aucun clic à l'intérieur d'un écran ne produise un effet inattendu (page blanche, erreur console, etc.).

Aucune fonctionnalité, aucun texte, aucune mention n'évoque une feature qui n'existe pas encore dans le vrai Toggl Focus.

10. Prochaine étape

Dès réception du brief : ce squelette devient la base sur laquelle la vraie feature (encore inconnue) sera construite et rendue interactive — insérée dans la nav existante plutôt que comme un espace à part, conformément à l'exigence du guide de l'assignment.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://toggl-assignment.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e7311d8f-591a-41b5-acd2-bb56b8492ec9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
