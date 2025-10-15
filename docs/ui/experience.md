# Expérience utilisateur & Architecture d'interface

## Principes UX
- **Clarté hiérarchique** : zones de lecture et d'action distinctes, contraste fort, typographie lisible.
- **Interactions rapides** : raccourcis clavier, commandes contextuelles, drag & drop.
- **Feedback constant** : animations micro-interaction, confirmations d'ordre, statut des connexions.
- **Personnalisation contrôlée** : layout modulable avec templates sauvegardables, thèmes clair/sombre adaptatifs.

## Layout principal (Desktop)
1. **Top Bar adaptative** : sélection d'actifs, état de session, PnL, menu utilisateur, recherche universelle.
2. **Zone de travail multi-panes** :
   - Grid flexible (1x1 à 4x4) inspirée de TradingView, redimensionnable.
   - Synchronisation des actifs et des unités de temps entre panneaux.
   - Dockable panels pour carnets d'ordres, profils de volume, heatmaps.
3. **Side Dock droit** : modules analytiques (order flow, statistiques, alertes).
4. **Bottom Strip** : journal d'activité, liste d'ordres, positions ouvertes, latency monitor.

## Layouts spécialisés
- **Mode Order Flow** : focus sur carnet de profondeur, tape, histogrammes volumes, empreinte (footprint) ATAS-like.
- **Mode Stratégie** : multi charts + éditeur de scripts, tests, versioning.
- **Mode Surveillance** : mur de widgets macros, corrélations, signaux.

## Navigation & découvertes
- Onboarding en 3 étapes via overlay guidé.
- Command palette (⌘K) pour accéder à toutes les fonctionnalités et templates.
- Marketplace intégrée avec prévisualisation des scripts, modules et layouts.

## Accessibilité
- Contraste AA minimum.
- Support clavier complet, focus states visibles.
- Mode daltonien, options de taille de police.

## Responsive & Mobile
- **Mobile** : stack vertical, chart interactif, carnet condensé, execution rapide.
- **Tablette** : double pane, support stylus.

## Personnalisation avancée
- Templates de layout sauvegardés dans le cloud.
- Snippets de scripts partagés.
- Automations low-code via blocs (if/then) déclenchés par événements du marché.

## Intégrations & notifications
- Webhooks pour alertes externes.
- Notifications push mobiles.
- Centre de messages avec filtres par criticité.

## Mesure de satisfaction
- Heatmaps anonymes pour comprendre interactions.
- Feedback contextualisé ("Aidez-nous à améliorer ce module").
