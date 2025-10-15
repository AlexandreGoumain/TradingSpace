# TradingSpace

Prototype d'interface de trading top 1 %, fusionnant l'ergonomie de TradingView avec la puissance d'ATAS, Sierra Chart et Bookmap.

## Prototype interactif
- Interface web statique située dans [`web/`](web/) avec graphique temps réel, carnet d'ordres, flux d'exécutions et tableau de bord.
- Données mockées pour illustrer la profondeur de marché et les métriques clés.
- Basculer entre mode clair/sombre et timeframes pour visualiser la réactivité du layout.

### Lancer l'interface
```bash
cd web
python -m http.server 8000
```
Puis ouvrir [http://localhost:8000](http://localhost:8000) dans un navigateur moderne.

### Tests
```bash
python -m unittest tests.test_layout
```

## Documentation stratégique
- [Vision produit](docs/product-vision.md)
- [Expérience utilisateur](docs/ui/experience.md)
- [Design system & composants](docs/ui/components.md)
- [Architecture système](docs/architecture/system-architecture.md)
- [Pipeline de données](docs/data/market-data-pipeline.md)
- [Roadmap](docs/roadmap.md)

## Objectifs
- Offrir une expérience accessible, modulable et ultra performante.
- Permettre aux traders actifs, analystes techniques, desks risques et développeurs quant d'opérer dans le même environnement.
- Construire une plateforme extensible, sécurisée et conforme aux standards internationaux.
