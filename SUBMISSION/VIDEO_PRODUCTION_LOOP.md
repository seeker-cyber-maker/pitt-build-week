# PITT segment production loop

This is the authoritative workflow for the final v3 cut. Never assemble the whole video by guessing at a global timeline.

## Fast path

```bash
# Only needed when narration text changes:
scripts/generate-narration-v3.sh

# Rebuild the deterministic cut:
scripts/build-submission-video-v3.sh

# Decode and contract-check the result:
scripts/verify-submission-video-v3.sh
```

Then open `SUBMISSION/final-video/pitt-devweek-submission-v3.mp4` and manually review the action anchors in `SUBMISSION/NARRATION_SYNC_PLAN_V3.md`. A passing command-line check does not replace watching the edit.

## Root causes fixed by this workflow

1. The first cut globally compressed each raw run, which also compressed clicks and state changes.
2. Its narration files were split from one long recording at silence boundaries. Those boundaries leaked the next scene into the previous WAV: Outcome 1 said "Outcome 2," Outcome 2 began Outcome 3, Outcome 4 began the Codex section, and the report cue lost its opening sentence.
3. Paragraph cues were only aligned to section starts, not to their visible actions.
4. The Codex split-screen was shown during all four outcomes instead of only during the contribution section.
5. Independently generated cues varied by more than 5 dB. Peak limiting did not correct perceived loudness.

## Loop for every segment

1. **Isolate narration.** One text file produces exactly one WAV. Do not split a master recording by silence.
2. **Verify words.** Transcribe the WAV with Whisper. Reject it if the transcript contains text from another segment, misses a sentence, or gives an ambiguous pronunciation. Spoken sources use `Pitt`; captions use `PITT`.
3. **Measure.** Record WAV duration and word timestamps for the operative verbs.
4. **Cut picture around events.** Preserve clicks at normal speed. Remove setup, scrolling, and the long idle gaps between legs.
5. **Synchronize.** The visual transition must land within 0.35 seconds of its matching verb: `rises`, `passes`, `drops`, `refuels`, `zero`, `offers`, or `confirms`.
6. **Hold result.** Freeze or hold the resulting UI for at least 1.5 seconds after the sentence so judges can read it.
7. **Normalize audio.** Normalize every cue to -18 LUFS integrated, -1.5 dB true peak, LRA 7 before mixing.
   Use modest delivery variation by scene: brisk for exposition, warm for collaboration, dry/playful for the closing joke. Keep safety and driver-authority lines deliberate. Never exceed 1.06x TTS speed.
8. **Review in isolation.** Render and inspect the segment before adding it to the master.
9. **Review the join.** Check the outgoing result frame, the incoming title/state, and the audio gap.
10. **Promote only after QA.** The build fails if a cue is missing, the final file does not decode, or duration exceeds three minutes.
11. **Protect cue boundaries.** Add explicit `300ms` pre-roll before normalization and verify 300–400 ms of silence in every rendered scene. Never use a unitless FFmpeg `adelay` value.
12. **Verify the mux.** Extract every scene from the final AAC track and transcribe it independently; whole-master Whisper runs may lose alignment and hallucinate across long silences.

## Picture policy

- Outcomes 1–4: crop to the browser only (`1280x720` from `x=640,y=180`) and scale to 1920x1080.
- Codex contribution: one normal-speed split-screen excerpt only. Do not replay all four runs here.
- Consequential clicks: normal speed; never globally time-compress outcome footage.
- Idle time: replace it with a short result hold, not footage of waiting for the next leg.
- If narration outlasts action footage: hold the meaningful result state. Do not pad with unrelated footage.
- Authority language is literal: PITT may calculate, flag, block unsafe continuation, or offer an option. Only the driver chooses, confirms, refuels, passes, or closes the route.

## Acceptance checks

- Each cue contains only its own scene's words.
- Every operative verb has a corresponding visible action or state change.
- Browser interactions remain legible and occur at normal speed.
- Outcome footage contains no Codex panel.
- The Codex panel appears once, only in the contribution segment.
- Per-cue normalized loudness is within 1 LU of the target.
- The final file has H.264 video, AAC audio, English subtitles, decodes end-to-end, and is under 180 seconds.
