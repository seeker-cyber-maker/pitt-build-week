# PITT Video Script

> Spoken walkthrough, approximately three minutes.
> Match the visible three-step flow: Trip watch → Driver review → Report draft.

---

## Opening (≈ 20 seconds)

"This is PITT — a trip-exception and report assistant for delivery drivers.

We built it during Build Week to answer one question: when a refrigerated delivery hits a delay and fuel gets tight, can we give the driver a clear picture and a reviewable report — without pretending we have live fleet data?

Everything you are about to see runs locally. The scenario is seeded. The calculations are deterministic. The driver stays in control."

---

## Step 1 — Trip Watch (≈ 40 seconds)

_[Screen shows the Trip Watch panel with the "Demo scenario · local data only" label visible in the header.]_

"The demo opens on a trip card. Jordan Lee is delivering refrigerated groceries to North Market Distribution Centre along the A-40 East corridor.

You can see the seeded fuel state — 24 percent — the carrier's 12-percent reserve floor, and a 28-minute delay.

Notice the 'Demo scenario' label in the header. That label is always visible so a reviewer knows this is seeded data, not a live feed.

When we click 'Check fuel reserve,' PITT runs a local calculation: 24 percent fuel minus 17 percent projected burn gives 7 percent at arrival — that is 5 points below the 12-percent policy floor. The reserve state is urgent."

---

## Step 2 — Driver Review and Acknowledgment (≈ 50 seconds)

_[Screen shows the alert panel with the projected reserve, fuel bar, and recommendation card.]_

"Step two shows the result. Projected arrival reserve is 7 percent, below the policy floor. The status badge says 'Review required.'

PITT suggests one pre-approved corridor stop: Northbound Service Plaza, 19 kilometers away, with a 15-minute detour. Below that, you see alternatives — continue without stopping, or review a different approved stop.

This is not a navigation instruction. It is a reviewable option. The driver decides.

To proceed, the driver checks 'I reviewed the recommendation and want a report draft.' That checkbox is the gate — without it, the report button stays disabled.

This is important: PITT does not act on its own. The driver's review unlocks the next step."

---

## Step 3 — Report Draft and Confirmation (≈ 50 seconds)

_[Screen shows the report draft panel with the 'Fallback draft' badge and the confirmation sidebar.]_

"Step three is the report. Right now, no AI provider is configured, so the badge says 'Fallback draft' and the source says 'Local calculation.'

The report restates the delay, the projected reserve, the recommended stop, the selection basis, the alternatives, and the driver review status. Every line comes from the same deterministic calculation you just saw.

When an approved AI endpoint is configured, PITT sends a minimal, redacted payload to draft a more natural narrative. The result is labeled 'AI-assisted,' and every deterministic fact is preserved verbatim. If the call fails or returns something unexpected, PITT falls back to this deterministic draft automatically.

The sidebar reminds the driver: PITT does not contact carrier systems, change the planned corridor, or control a vehicle. The driver clicks 'Confirm review,' and a confirmation message appears: 'Review recorded. No external action was taken.'"

---

## How Codex and GPT-5.6 Supported the Build (≈ 20 seconds)

"A word on how we used AI tooling to build this.

Codex managed the integration lane — setting up the collaboration structure, defining scope contracts, merging validated contributions, and maintaining test evidence across branches.

GPT-5.6 was available as the approved AI endpoint behind the report-drafting adapter. When configured, it drafts a natural-language summary from the deterministic facts. It does not add facts, change severity, or issue instructions. The fallback deterministic report is always available without it."

---

## Closing (≈ 10 seconds)

"PITT is a narrow, local demonstration. It does not claim live data, production safety, regulatory compliance, or real-time optimization. What it does is turn a fuel-reserve exception into a visible, reviewable decision — and that is the whole story.

Thank you."

---

## Timing Notes

| Section | Target |
| --- | --- |
| Opening | 0:00–0:20 |
| Step 1 — Trip Watch | 0:20–1:00 |
| Step 2 — Driver Review | 1:00–1:50 |
| Step 3 — Report Draft | 1:50–2:40 |
| AI Tooling | 2:40–3:00 |
| Closing | 3:00–3:10 |

Total: approximately 3 minutes.
