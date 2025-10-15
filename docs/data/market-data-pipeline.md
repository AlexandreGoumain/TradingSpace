# Pipeline de données de marché

## Sources
- Bourses (CME, NYSE, Eurex) via connexions co-localisées.
- Crypto exchanges (Binance, Coinbase, Deribit) via WebSocket basse latence.
- Providers historiques (Quandl, Polygon, Refinitiv) pour backfill.

## Étapes
1. **Acquisition**
   - Connecteurs spécifiques (FIX, ITCH, REST) avec buffering.
   - Heartbeat et monitoring latence.
2. **Normalisation**
   - Conversion formats propriétaires -> schéma commun (symbol, exchange, timestamps nanosecondes).
   - Gestion des corporate actions, roll futures.
3. **Enrichissement**
   - Ajout metadata (sector, tick size, session time), mapping cross-asset.
4. **Distribution**
   - Flux temps réel via WebSocket multiplexé.
   - Snapshots + diffs (L2, L3) via protocoles compacts (SBE, Protobuf).
5. **Persistance**
   - Stockage chaud (Redis) pour UI, stockage froid (ClickHouse/S3) pour historique.
6. **Qualité & surveillance**
   - Détection d'anomalies (spikes, trous), alertes automatiques.
   - Reconciliation avec sources secondaires.

## SLA
- Latence bout en bout : < 25 ms (co-location) / < 80 ms (internet).
- Disponibilité : 99.99 % market hours.
- Rétention tick : 2 ans, agrégés illimité.

## Outils de monitoring
- Dashboards Grafana (latence, throughput, erreurs).
- Alerting PagerDuty/Slack.
- Replays via ClickHouse pour audits.
