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

| Champ | Pourquoi | Exemple |
|-------|----------|---------|
| **Temps de contact dispatch** | Preuve que le chauffeur a essayé de prévenir | "Dispatch contacté à 14h30, aucune réponse" |
| **Code d'événement** | Catégoriser rapidement sans lire tout le texte | RETARD / RESERVE / PANNE / CONDITIONS |

**Hors scope :** Coordonnées GPS précises, identité du client, valeur de la cargaison.

---

## Question 3 — Distinction observed/seeded/unknown

> La distinction `observed` / `seeded` / `unknown` a-t-elle besoin d'un champ visible, ou `provenance` + `limitations` suffisent ?

### Réponse de Patrick :

`provenance` + `limitations` **suffisent pour le Build Week**, mais pour un produit réel il faudrait un champ `data_quality` visible :

| Valeur | Signification pour dispatch |
|--------|----------------------------|
| `observed` | Le chauffeur a constaté lui-même |
| `seeded` | Donnée du scénario démo (pas pour production) |
| `unknown` | Information manquante — ne pas décider dessus |

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
