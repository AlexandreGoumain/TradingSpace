# Design system & composants clés

## Design system
- **Palette** : dérivée d'une base sombre (#0C111A) avec accents cyan (#3BE0FF) et orange (#FF8A3B) pour l'action.
- **Typographies** : Titres en Inter SemiBold, contenus en Inter Regular, chiffres en JetBrains Mono.
- **Iconographie** : set vectoriel monochrome avec états actifs colorisés.
- **Grille** : 8px base spacing, breakpoints 480 / 768 / 1024 / 1440 / 1920.
- **Thèmes** : clair, sombre, high contrast; mode adaptatif automatique.

## Composants structurels
- **AppShell** : top bar, workspace, dock, footer, notifications.
- **WorkspaceGrid** : gestion des layouts, drag & resize, synchronisation symbol/timeframe.
- **Panel** : conteneur dockable avec header (titre, actions, menus contextuels) et contenu.

## Composants data
- **ChartPane** : rendu WebGL multi-overlays, supports overlays (EMA, VWAP), études volumétriques.
- **DepthOfMarket** : carnet de profondeur double colonne, heatmap densité.
- **VolumeProfile** : histogramme horizontal par prix, Value Area automatique.
- **FootprintView** : cluster de volume bid/ask, delta, imbalances.
- **OrderTape** : flux d'ordres en temps réel, filtres par taille, iceberg detection.
- **TradeAnalytics** : tableaux KPI, PnL, drawdown, risk metrics.

## Composants interaction
- **OrderTicket** : modes marché/limite/stop, OCO, bracket orders.
- **ScalpingPad** : boutons buy/sell rapides, taille dynamique, hotkeys configurables.
- **AlertBuilder** : conditions multi-dimensionnelles (prix, volume, indicateurs custom).
- **CommandPalette** : recherche universelle + actions rapides.

## Composants support
- **NotificationCenter** : toasts, bandeau d'alerte critique, centre historique.
- **LatencyMonitor** : indicateur en temps réel de la qualité de connexion.
- **SessionStatus** : montre les ouvertures/fermetures de marchés, statut de connectivité brokers.
- **ContextHelp** : bulles d'aide interactives avec tutoriels vidéo.

## Scripts & extensions
- **ScriptEditor** : éditeur code (Monaco) avec autocomplétion, linting, versioning.
- **BacktestRunner** : configuration de scénarios, visualisation des résultats, comparateur.
- **MarketplaceCard** : vignettes pour modules tiers, rating, CTA install.

## États & feedback
- Skeleton loading, shimmer pour data volumétrique.
- États offline/degraded avec mode lecture seule.
- Historique des modifications et undo multi-niveau.
