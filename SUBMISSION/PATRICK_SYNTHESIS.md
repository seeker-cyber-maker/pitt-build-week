# Synthèse opérationnelle — PITT Build Week

**Source :** Patrick Simard, camionneur cross-border, 25+ ans d'expérience  
**Date :** 2026-07-19  
**Document :** Questionnaire opérationnel complet (5 questions)  

---

## 🎯 Points clés pour l'équipe

### 1. Deux usages, deux formats

| Usage | Cible | Format | Longueur |
|-------|-------|--------|----------|
| **Alerte live** | Chauffeur au volant | Bullet points, push | 3-4 lignes max |
| **Rapport employeur** | Dispatch / back-office | Narrative structurée | Paragraphe complet |

> *"Le chauffeur n'a pas le temps de lire un paragraphe en conduisant."*

### 2. Le reefer n'a souvent pas de jauge

| Équipement | Jauge ? | Méthode réelle |
|------------|---------|---------------|
| Camion (tractor) | Oui | Tableau de bord |
| Reefer (remorque) | **Non** | Marteau + oreille, temps écoulé, visual |

**Conséquence :** Ajouter `estimated` comme valeur `data_quality` dans le contrat.

### 3. Workflow inspection réel

Les compagnies recommandent un arrêt tous les **4 heures ou moins** pour vérifier :
- Pneus (pression, usure, clous)
- Fuel du reefer (niveau estimé)
- État général de l'équipement

### 4. Température = consommation fuel

| Température cible | Impact fuel |
|-------------------|-------------|
| -10°F | + cher |
| 4°C | - cher |

Le rapport doit inclure `target_temperature` pour que dispatch comprenne le burn rate.

### 5. Le transporteur configure son propre rapport

Chaque compagnie a :
- Ses ententes de prix flotte avec une pétrolière spécifique
- Ses champs obligatoires internes
- Ses clients réguliers avec temps d'attente connu

> *"Le format du rapport devrait être programmable/configurable par le client."*

---

## 📋 Champs suggérés pour `pitt.report-draft.v1` (future version)

| Champ | Pourquoi | Source |
|-------|----------|--------|
| `reefer_start_time` | Heure démarrage moteur reefer | Saisie chauffeur / ELD |
| `fuel_fill_time` | Heure dernier plein | Saisie chauffeur |
| `target_temperature` | Température cible cargo | Ordre de transport |
| `scheduled_appointment` | Heure RV prévue | Ordre de transport |
| `actual_arrival` | Heure arrivée réelle | GPS / saisie |
| `unplanned_delay` | Délai imprévu client | Calculé : actual - scheduled |
| `carrier_fuel_partner` | Partenaire pétrolier flotte | Config transporteur |
| `driver_comments` | Notes inspection, état trailer | Texte libre chauffeur |

---

## 📝 Templates recommandés

### Alerte live (mobile, au volant)

```
⚠️ Niveau fuel bas
⏱️ Délai imprévu : 25 km
🚧 Détour : A30
⚽ Arrêt suggéré : Petro-Can A-40 Est
         [ Accepter détour ]  [ Ignorer ]
```

### Rapport employeur (desktop, dispatch)

> *"A 28-minute delay changes projected fuel reserve to 7%, below the 12% policy floor. The supplied review option is Northbound Service Plaza, 19 km away with a planned 15-minute detour. Driver review is required before any external action."*

---

## 🚫 Hors scope Build Week

| Élément | Pourquoi hors scope |
|----------|---------------------|
| Photos (remorque, arrimage, scellés) | Trop lourd, UI complexe |
| ELD live | Nécessite intégration télématique |
| Intégration pétrolière | API externe, credentials |
| Poids légal | Règlementation variable |
| Accidents matériels / litiges | Produit PITT = exceptions opérationnelles, pas incidents |

---

## ✅ Décisions pour l'intégrateur

1. **Garder** `pitt.report-draft.v1` comme format par défaut
2. **Documenter** la possibilité de template configurable par transporteur
3. **Ajouter** `data_quality: estimated` dans le contrat (observed / estimated / seeded / unknown)
4. **Planifier** les 8 champs reefer pour v2 du contrat
5. **Distinguer** `alert_template` et `report_template` dans la documentation

---

## 📁 Documents associés

- `SUBMISSION/PATRICK_QUESTIONNAIRE.md` — réponses détaillées aux 5 questions
- `CONTROL/CONTRACTS/REPORT_DRAFT_V1.md` — contrat actuel
- `CONTROL/OPERATIONAL_DESIGN_INPUTS.md` — profil opérationnel Patrick

---

*Synthèse prête pour review équipe — 2026-07-19*
