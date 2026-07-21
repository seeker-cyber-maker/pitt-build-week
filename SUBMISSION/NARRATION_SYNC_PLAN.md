# PITT narration and picture synchronization plan — v2

The v2 production loop supersedes the first-cut timeline. Follow `SUBMISSION/VIDEO_PRODUCTION_LOOP.md`; generate narration with `scripts/generate-narration-v2.sh`; build with `scripts/build-submission-video-v2.sh`.

## Master timeline

| Start | Length | Scene | Picture rule |
| ---: | ---: | --- | --- |
| 0:00.0 | 5.0 s | Authority intro | Splash card |
| 0:05.0 | 6.6 s | Moving conditions | Splash card |
| 0:11.6 | 10.1 s | Decision layer | Planning screenshot |
| 0:21.7 | 17.2 s | Traffic, weather, work zones, fuel | Planning screenshot |
| 0:38.9 | 13.0 s | Outcome 1 | Browser-only event cuts |
| 0:51.9 | 16.0 s | Outcome 2 | Browser-only event cuts |
| 1:07.9 | 32.0 s | Outcome 3 | Browser-only event cuts; both rejected stops visible |
| 1:39.9 | 22.5 s | Outcome 4 | Browser-only event cuts; PITT offers closure, driver confirms |
| 2:02.4 | 25.0 s | Codex contribution | One split-screen run only; prototype-not-game authority line |
| 2:27.4 | 11.6 s | Report and machine handoff | Report screenshot |
| 2:39.0 | 8.5 s | Magic-roundabout outro | Outro card |

Expected master duration: **2:47.5**, below the three-minute limit.

## Measured action anchors

These timestamps are relative to the start of each outcome cue. They came from local Whisper word alignment and are encoded in the build script.

| Outcome | Spoken anchor | Cue time | Visible event |
| --- | --- | ---: | --- |
| 1 | `rises` | 2.44 s | Price-spike card appears |
| 1 | `refuel` | 7.92 s | Driver selects refuel |
| 1 | `recovers` | 9.64 s | 55.2% reserve result appears |
| 2 | `passes` | 3.60 s | First opportunity is passed |
| 2 | `advances` | 5.30 s | Leg 2 appears |
| 2 | `drops` | 8.20 s | Lower-price card appears |
| 2 | `refuel` | 12.74 s | Driver selects the refuel stop |
| 3 | `not worth` | 9.46 s | First $0 saving versus $16.80 detour check |
| 3 | `passes` | 11.62 s | Driver passes the first offer |
| 3 | `price appears` | 14.76 s | Later price-drop card appears |
| 3 | `$2.73 against $16.80` | 16.98 s | Second economic comparison remains readable |
| 3 | `not cost-worthy` | 24.84 s | Second rejection remains readable |
| 3 | `passes again` | 27.08 s | Driver passes the second offer |
| 3 | `route remains viable` | 28.68 s | Viable reserve state remains visible |
| 4 | `passes` | 2.18 s | First opportunity is passed; the second pass follows visibly |
| 4 | `zero` | 8.62 s | 0% fuel state appears |
| 4 | `blocks` | 10.30 s | Disabled continuation remains visible |
| 4 | `offers` | 12.78 s | Close-route option remains visible |
| 4 | `confirms` | 16.22 s | Driver selects Close route early |

## Audio contract

- Eleven text files under `SUBMISSION/audio/v2/text/` generate eleven independent WAVs.
- No silence-based splitting of a continuous master is allowed.
- Each cue is normalized before assembly to -18 LUFS integrated, -1.5 dB true peak, LRA 7.
- Measured normalized cues range from -17.1 to -18.9 LUFS; there is no separately loud Codex cue.
- Captions are in `SUBMISSION/PITT_VIDEO_CAPTIONS_V2.srt` and are embedded as an English subtitle track.

## Visual contract

- Outcome footage is cropped to the browser only and never globally sped up.
- Setup, scrolling, and inter-leg idle time are removed.
- Consequential clicks play at normal speed, followed by meaningful result holds.
- Codex split-screen footage appears exactly once, only during the Codex contribution narration.
- If more picture is needed, extend a result hold or insert relevant project evidence. Do not replay another full outcome behind the Codex narration.
