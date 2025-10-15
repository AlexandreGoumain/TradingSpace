# Architecture système proposée

## Stack technologique
- **Front-end** : TypeScript, React/Next.js 14, rendu hybride, WebGL (Deck.gl + custom shaders) pour charts.
- **State management** : Zustand + RxJS pour flux temps réel, Web Workers pour calculs lourds.
- **Back-end** : microservices (NestJS ou Go) orchestrés par Kubernetes, gRPC interne.
- **Data streaming** : Kafka pour ingestion, Redis Streams pour cache temps réel, ClickHouse pour historisation.
- **Market data** : connecteurs FIX/ITCH/FAST, websockets propriétaires, adaptateurs modulaires.
- **Order routing** : service d'exécution low-latency en Go/C++, connexions directes brokers/exchanges.

## Schéma logique
1. **Ingestion** : Collecte multi-sources, normalisation par Symbol Service.
2. **Bus temps réel** : Kafka topics (quotes, trades, depth, alerts).
3. **Aggregation Layer** : microservices pour calculs (VWAP, delta, footprint) alimentant Redis.
4. **API Gateway** : GraphQL + WebSocket multiplexés, authentification JWT + OAuth2.
5. **Client** : consomme données via WebSocket + REST, synchronise layouts, exécutions, scripts.
6. **Observabilité** : Prometheus, Grafana, tracing OpenTelemetry, alerting PagerDuty.

## Modules critiques
- **Market Data Service** : gestion de la latence, snapshots, diff incremental, detection anomalies.
- **Order Management System (OMS)** : ordres, positions, risk checks pré-trade, journaux MiFID-ready.
- **Risk Engine** : limites, stress tests, VaR, margining.
- **Strategy Engine** : sandbox isolée pour algos utilisateurs, throttling et sandboxing WASM.

## Sécurité
- Authentification multi-facteurs (TOTP, U2F).
- RBAC granulaire (desk, trader, auditor).
- Chiffrement TLS 1.3, stockage chiffré (KMS).
- Journaux immuables (append-only) pour conformité.

## Scalabilité & résilience
- Autoscaling horizontal des services via HPA (latence, CPU).
- Partitionnement par classes d'actifs.
- Circuit breakers et retry backoff.
- DRP multi-région, RPO < 30s, RTO < 5 min.

## Roadmap technique
1. **MVP Data + Trading** : WebSocket unifié, OMS basique, UI AppShell.
2. **Order Flow avancé** : calcul footprint, heatmap GPU, latence < 50ms bout en bout.
3. **Automations & Marketplace** : sandbox WASM, store, monétisation.

## Standards & conformité
- ISO 27001, SOC2 Type II.
- GDPR, MiFID II, FINRA OATS.
- Audit annuel externe, bug bounty.
