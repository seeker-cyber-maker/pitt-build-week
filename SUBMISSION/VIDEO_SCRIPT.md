# PITT Video Script

> Spoken walkthrough, target 2 minutes 45 seconds. Devpost requires a public YouTube demonstration video under three minutes.
> Match the visible planning preview and three-step flow: local plan → Trip watch → Driver review → Report draft.

---

## Opening (≈ 10 seconds)

"This is PITT — a trip-exception and report assistant for delivery drivers.

We built it during Build Week to answer one question: when a refrigerated delivery hits a delay and fuel gets tight, can we give the driver a clear picture and a reviewable report — without pretending we have live fleet data?

Everything you are about to see runs locally. The scenario is seeded. The calculations are deterministic. The driver stays in control."

---

## Local Planning Preview (≈ 20 seconds)

_[Screen shows the simulated planning ledger and local map simulation.]_

"Before the active trip, PITT shows a small local planning preview. Five simulated deliveries are sorted from ASAP through flexible work. The system compares that order with a deliberately wasteful loop drawn on a made-up corridor map.

The recommended version inserts a reachable simulated fuel stop before the next leg would cross the 14-percent reserve floor. It balances a seeded per-litre price against the added detour cost, and applies seeded weekday traffic at predicted presence times. This is deliberately not live navigation: the coordinates, stations, traffic, prices, and fuel math are all local demo data."

---

## Step 1 — Trip Watch (≈ 30 seconds)

_[Screen shows the Trip Watch panel with the "Demo scenario · local data only" label visible in the header.]_

"The demo opens in Trip Watch. It advances a five-leg seeded day, so fuel goes down on each leg and only rises when the driver chooses the planned refuel. Two simulated price events let the driver keep the plan or recalculate it.

The exception card uses Jordan Lee's refrigerated delivery to North Market Distribution Centre. It shows 24-percent fuel, a 12-percent reserve floor, and a 28-minute delay.

Notice the 'Demo scenario' label in the header. That label is always visible so a reviewer knows this is seeded data, not a live feed.

When we click 'Check fuel reserve,' PITT runs a local calculation: 24 percent fuel minus 17 percent projected burn gives 7 percent at arrival — that is 5 points below the 12-percent policy floor. The reserve state is urgent."

---

## Step 2 — Driver Review and Acknowledgment (≈ 35 seconds)

_[Screen shows the alert panel with the projected reserve, fuel bar, and recommendation card.]_

"Step two shows the result. Projected arrival reserve is 7 percent, below the policy floor. The status badge says 'Review required.'

PITT suggests one pre-approved corridor stop: Northbound Service Plaza, 19 kilometers away, with a 15-minute detour. Below that, you see alternatives — continue without stopping, or review a different approved stop.

This is not a navigation instruction. It is a reviewable option. The driver decides.

To proceed, the driver checks 'I reviewed the recommendation and want a report draft.' That checkbox is the gate — without it, the report button stays disabled.

This is important: PITT does not act on its own. The driver's review unlocks the next step."

---

## Step 3 — Report Draft and Confirmation (≈ 35 seconds)

_[Screen shows the report draft panel with the 'Fallback draft' badge and the confirmation sidebar.]_

"Step three is the report. Right now, no AI provider is configured, so the badge says 'Fallback draft' and the source says 'Local calculation.'

The report restates the delay, projected reserve, recommended stop, selection basis, alternatives, review status, and completed delivery outcomes. If the driver closed early, unattempted stops are explicitly marked undelivered. Every line comes from the same deterministic state you just saw.

When an approved AI endpoint is configured, PITT sends a minimal, redacted payload to draft a more natural narrative. The result is labeled 'AI-assisted,' and every deterministic fact is preserved verbatim. If the call fails or returns something unexpected, PITT falls back to this deterministic draft automatically.

The sidebar reminds the driver: PITT does not contact carrier systems, change the planned corridor, or control a vehicle. The driver clicks 'Confirm review,' and a confirmation message appears: 'Review recorded. No external action was taken.'"

---

## How Codex and GPT-5.6 Supported the Build (≈ 15 seconds)

"A word on how we used AI tooling to build this.

Codex managed the integration lane — setting up the collaboration structure, defining scope contracts, merging validated contributions, and maintaining test evidence across branches.

GPT-5.6 supported the bounded product and report-contract design. The optional adapter can later draft a natural-language summary from deterministic facts, without changing severity or issuing instructions. For this recording, we intentionally use the deterministic local fallback only."

---

## Closing (≈ 5 seconds)

"PITT is a narrow, local demonstration. It does not claim live data, production safety, regulatory compliance, or real-time optimization. What it does is turn a fuel-reserve exception into a visible, reviewable decision — and that is the whole story.

Thank you."

---

## Timing Notes

| Section | Target |
| --- | --- |
| Opening | 0:00–0:10 |
| Local planning preview | 0:10–0:30 |
| Step 1 — Trip Watch | 0:30–1:00 |
| Step 2 — Driver Review | 1:00–1:35 |
| Step 3 — Report Draft | 1:35–2:10 |
| AI Tooling | 2:10–2:25 |
| Closing | 2:25–2:30 |

Target: approximately 2 minutes 30 seconds, leaving margin for natural narration and UI pauses while remaining under the three-minute Devpost limit.
