# Questionnaire opérationnel — PITT Build Week

**Répondant :** Patrick Simard (camionneur, 25+ ans d'expérience cross-border)  
**Date :** 2026-07-19  
**Statut :** En cours  

---

## Documents de référence

| Document | Statut |
|----------|--------|
| Rapport d'incident/accident (exemple fourni par Patrick) | ❌ **Image jointe illisible** — réessayer plus tard |
| Image : `/opt/data/cache/images/img_ecbbb1d485bb.jpg` | API vision indisponible (erreur 400) |

> **Note :** L'exemple de rapport d'incident/accident a été envoyé mais n'a pas pu être analysé automatiquement. À réintégrer manuellement dès que l'API vision est de retour.

---

## Question 1 — Utilité du rapport vs. paperasse

> Le rapport PITT actuel génère une narrative automatique (ex: *"A 28-minute delay changes projected fuel reserve to 7%..."*). Un vrai rapport d'incident camionnage laisse beaucoup de place à l'explication écrite du chauffeur. Le format actuel est-il suffisant pour expliquer une exception sans que ça devienne du "paperwork theater" ?

### Réponse de Patrick :

**Distinction claire entre deux usages :**

| Usage | Cible | Format | Niveau de détail |
|-------|-------|--------|------------------|
| **Alerte live au chauffeur** | Le chauffeur sur la route | Push / notification | **Minimal** — juste "Alerte : niveau de fuel REEFER bas" |
| **Rapport à l'employeur** | Dispatch / back-office | Document structuré | **Détaillé** — narrative complète avec faits et limites |

**Pour l'alerte live :**
Le chauffeur n'a pas le temps de lire un paragraphe en conduisant. L'alerte doit être :
- **Instantanée** : push ou sonore
- **Ciblée** : "Fuel REEFER bas" ou "Réserve en dessous du plancher"
- **Actionnable** : un bouton "Voir détails" si le chauffeur veut approfondir à l'arrêt

**Pour le rapport employeur (la partie encadrée du vrai formulaire) :**
La narrative PITT actuelle est **appropriée** — elle résume la situation en phrases complètes sans jargon. C'est la partie que le chauffeur transmet à dispatch après coup.

**Amélioration souhaitée :**
Le format du rapport devrait être **programmable/configurable par le client** (transporteur). Exemples :
- Certains veulent juste les faits numériques
- D'autres veulent la narrative complète
- D'autres encore veulent un mix avec leurs propres champs obligatoires

**Recommandation :** Garder `pitt.report-draft.v1` comme format par défaut, mais documenter qu'un transporteur peut configurer le template de sortie selon ses besoins internes.

---

## Question 2 — Champs utiles pour dispatch (non-sensibles)

> Quels 1-2 champs rendraient le rapport plus utile pour le dispatch tout en restant non-sensibles ?

### Réponse de Patrick :

**Contexte réel du transport réfrigéré (reefer) :**

| Étape | Ce qui compte pour dispatch | Impact fuel/réserve |
|-------|---------------------------|-------------------|
| **Avant chargement** | Fueller camion + reefer (poids légal) | Consommation reefer incluse dans le calcul |
| **Pré-chargement** | Température cible (-10°F vs 4°C) | -10°F coûte plus cher en fuel que 4°C |
| **Inspection trailer** | Chute reefer intacte, sol nettoyé | — |
| **Chargement** | Photo arrimage + scellés, photo remorque vide | — |
| **En route** | Heure démarrage moteur reefer, heure fuel | Burn rate réel vs estimé |
| **Arrivée client** | Heure RV prévue vs réelle, attente imprévue | Délai non prévu = réserve réduite |
| **Attente alimentaire** | Douane, DOT, food inspection, shipper, consignee | Très longue ; le transporteur veut qualifier ce temps lui-même par client |

**Insight clé :**

> "Le transporteur pourrait vouloir qualifier le temps d'attente à calculer lui-même pour les clients réguliers."

Les compagnies ont des ententes de prix flotte négociées annuellement avec une pétrolière spécifique. Le système devrait connaître ces détails pour configurer les arrêts suggérés.

**Champs suggérés pour `pitt.report-draft.v1` :**

| Champ | Pourquoi | Source |
|-------|----------|--------|
| `reefer_start_time` | Heure de démarrage du moteur reefer | Saisie chauffeur ou ELD |
| `fuel_fill_time` | Heure du dernier plein | Saisie chauffeur |
| `target_temperature` | Température cible de la cargaison | Ordre de transport |
| `scheduled_appointment` | Heure de rendez-vous prévue | Ordre de transport |
| `actual_arrival` | Heure d'arrivée réelle | GPS ou saisie |
| `unplanned_delay` | Délai imprévu chez le client | Calculé : actual - scheduled |
| `carrier_fuel_partner` | Partenaire pétrolier flotte | Config transporteur |
| `driver_comments` | Notes de l'inspection, état trailer, anomalies | Texte libre chauffeur |

**Photos suggérées (hors scope Build Week, mais utile pour produit réel) :**
- Remorque vide avant chargement
- Chargement avec arrimage en place
- Scellés apposés

**Hors scope Build Week :** Photos, ELD live, intégration pétrolière, poids légal. À documenter comme future roadmap.

---

## Question 3 — Distinction observed/seeded/unknown

> La distinction `observed` / `seeded` / `unknown` a-t-elle besoin d'un champ visible, ou `provenance` + `limitations` suffisent ?

### Réponse de Patrick :

**Dans la vraie vie, le chauffeur n'a pas toujours de jauge numérique.**

| Type de mesure | Comment ça se passe sur la route | Fiabilité |
|----------------|-----------------------------------|-----------|
| **Camion (tractor)** | Jauge au tableau de bord | Précis |
| **Reefer (remorque)** | Souvent **pas de jauge** | Estimée |
| | Frapper le réservoir avec le manche du marteau, écouter le son | Approximatif |
| | Calculer par expérience : taille du réservoir × temps écoulé | Heuristique |
| | Inspection visuelle (anti-cifonnement sur la tank) | Confirme présence/absence |

**Ce que les compagnies recommandent réellement :**
- Arrêt tous les **4 heures ou moins** pour vérifier :
  - Pneus (pression, usure, clous)
  - Fuel du reefer (niveau estimé)
  - État général de l'équipement

**Distinction nécessaire dans le rapport :**

| Valeur | Signification | Quand l'utiliser |
|--------|---------------|------------------|
| `observed` | Jauge numérique, capteur ELD, compteur précis | Camion, température reefer |
| `estimated` | Expérience chauffeur, heuristique temps/écoulé | Fuel reefer sans jauge |
| `seeded` | Donnée du scénario démo | Build Week uniquement |
| `unknown` | Info manquante, pas vérifiée | À éviter, mais honnête |

**Recommandation :**
- Oui, un champ `data_quality` visible est nécessaire pour un produit réel.
- Ajouter la valeur `estimated` — c'est la réalité du métier.
- Dispatch doit savoir si le fuel reefer est mesuré (`observed`) ou estimé (`estimated`) pour évaluer la marge d'erreur.
- Exemple d'affichage : *"Fuel reefer : 45% (estimated) — basé sur temps écoulé depuis dernier plein"*

---

## Question 4 — Phrasage : assistant vs. ordres

> Quel phrasé sonne comme une ébauche utile plutôt qu'un système donnant des ordres au chauffeur ?

### Réponse de Patrick :

**BON (assistant) :**
- "Recommandation : considérer un arrêt à..."
- "Réserve projetée : X% — à vérifier"
- "Option suggérée..."

**MAUVAIS (ordres) :**
- "Arrête-toi immédiatement à..."
- "Tu DOIS contacter dispatch"
- "Itinéraire modifié" (sans confirmation)

**Le chauffeur est le décideur final.** Le rapport doit l'aider à expliquer sa décision, pas la prendre à sa place.

---

## Question 5 — Comparaison avec rapport d'incident réel

> Basé sur l'image jointe (non analysée — voir note ci-dessus), quels champs d'un vrai rapport d'incident manquent dans PITT ?

### À compléter :

Dès que l'image sera lisible, comparer les champs du formulaire réel avec :
- `pitt.report-input.v1`
- `pitt.report-draft.v1`

Identifier les écarts et proposer des ajouts pertinents sans rendre le rapport lourd.

---

## Résumé des recommandations

| # | Recommandation | Priorité | Lane |
|---|---------------|----------|------|
| 1 | Ajouter `driver_comments` (texte libre, 500 chars) | Haute | AI/report |
| 2 | Ajouter `dispatch_contact_time` (optionnel) | Moyenne | AI/report |
| 3 | Ajouter `event_code` catégoriel | Moyenne | Scenario |
| 4 | Documenter le bon/mauvais phrasage | Basse | Submission |
| 5 | Analyser l'image de rapport réel | En attente | — |

---

*Questionnaire en cours — dernière mise à jour : 2026-07-19*
