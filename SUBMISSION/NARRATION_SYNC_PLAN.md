# PITT narration synchronization plan

This is the authoritative edit decision list for the measured Qwen3-TTS narration. Treat narration and picture as a coupled timing problem: narration announces the decision, the click happens on the final operative word, and the resulting UI receives a short quiet hold.

## Fixed visual inventory

| Source | Raw duration | Required visual beats |
| --- | ---: | --- |
| Intro cards | 13.0 s | Card one 6 s; card two 7 s |
| `run-1-price-hike.mov` | 23.50 s | First leg; spike; cost impact; revised refuel; recovered reserve |
| `run-2-price-drop.mov` | 28.57 s | Pass spike; continue; drop; refuel; recovered reserve |
| `run-3-not-cost-worthy.mov` | 31.90 s | Morning fill; first economic rejection; later price drop; second rejection |
| `run-4-run-out-close-early.mov` | 29.03 s | Pass; pass; zero fuel; blocked continuation; close early |
| Outro card | 8.0 s | Warning line; joke; two-beat silent hold |

Raw four-run footage totals **113.00 seconds**. These are source clips, not mandatory full-length inserts; remove repeated setup and pointer travel according to the measured cue table below.

## Synchronization rules

1. Start each outcome line 0.3–0.5 seconds before its first relevant action.
2. Land the words **rises**, **passes**, **drops**, **not worthwhile**, **zero**, and **closes** within roughly 0.25 seconds of the matching click or visible state change.
3. Leave 1.0–1.8 seconds without speech after every cost explanation so viewers can read it.
4. Preserve every decision click at normal speed. Compress only scrolling, pointer travel, and repeated setup.
5. If narration is longer than its picture, extend the visible result state or use a planning-ledger cutaway. Do not speed up consequential clicks.
6. If picture is longer than narration, use the silence as a reading window before trimming the source.
7. Adjust Qwen speed globally only within about 0.94–1.06. Fix larger mismatch by rewriting or changing picture holds so the voice remains natural.

## Measured Qwen3-TTS result

The synchronized draft rendered with the Serena voice at speed `1.0` in **141.071 seconds**. This includes the judge-facing audience/differentiation line and the separately regenerated Codex collaboration cue with moral support. It leaves **23.929 seconds** of picture-only reading time in the recommended 2:45 cut, or 38.929 seconds beneath the absolute three-minute limit.

The continuous master is `audio/pitt-narration-qwen3-sync.wav`. It has also been split at measured paragraph silences so the editor can move a visual beat without time-stretching the voice:

| Cue | Measured voice | Place on timeline | Picture direction |
| --- | ---: | ---: | --- |
| `01-intro-authority.wav` | 4.626 s | 0:00–0:06 | Card one; leave about 1.4 s clean after the line. |
| `02-intro-context.wav` | 6.260 s | 0:06–0:13 | Card two; leave about 0.7 s clean. |
| `03-product-route.wav` | 16.640 s | 0:13–0:30 | Show the delivery-day problem, then ledger and route. Cut to the comparison on “Navigation finds a route”; hold the decision layer on “records what happened.” |
| `04-route-signals.wav` | 16.153 s | 0:30–0:47 | Move across traffic, weather movement, then construction in spoken order. |
| `05-fuel-economics.wav` | 7.727 s | 0:47–0:55 | Hold on price tradeoff through the last word. |
| `06-outcome-1.wav` | 12.936 s | 0:55–1:11 | Trim run one to spike, analysis, click, and recovered reserve. Land “chooses” on the refuel click; preserve roughly 3 s of result hold. |
| `07-outcome-2.wav` | 13.959 s | 1:11–1:29 | Trim run two to pass, drop, later refuel, and reserve. Land “passes” and “refuels” on their buttons; preserve roughly 4 s of result hold. |
| `08-outcome-3.wav` | 14.422 s | 1:29–1:49 | Trim run three to the morning-fill state and both economic checks. Land “cannot recover another detour” on the displayed comparison; leave roughly 5.6 s to read it. |
| `09-outcome-4.wav` | 13.421 s | 1:49–2:07 | Trim run four to pass, pass, zero, and close early. Land “zero” on the fuel state and “closes” on the button; preserve roughly 4.6 s on the closed route. |
| `10-codex-collaboration.wav` | 20.080 s | 2:07–2:28 | Codex side browser, prompt, changed product, passing tests, and one human beat for “moral support when the demo fought back.” |
| `11-machine-handoff.wav` | 7.292 s | 2:28–2:37 | Report and machine handoff; leave about 1.7 s to read the boundary. |
| `12-magic-roundabout.wav` | 7.555 s | 2:37–2:45 | Outro card; finish with a short silent beat. |

This cue-based **2:45** assembly is the recommended edit. The 12 WAV cues total the same 141.071 seconds as the rebuilt master; their larger timeline windows supply the reading pauses. If a new web recording changes an action time, slide its matching cue inside the allocated window before rewriting or regenerating speech.

Use these persistent outcome labels in the same upper corner: `1/4 — Price rises: recalculate`, `2/4 — Price drops: refuel`, `3/4 — Cheap fuel, bad detour`, and `4/4 — Pass twice: close early`.

## Codex collaboration footage exception

Keep the existing recording of Codex recording the website video. It is archival process footage whose subject is the collaboration and recording workflow, not the specific webpage state visible inside it. Later product changes do not make that clip stale and do not justify re-recording it. Use it as background throughout the Codex collaboration cue, with optional crops or overlays of the prompt and test results.
