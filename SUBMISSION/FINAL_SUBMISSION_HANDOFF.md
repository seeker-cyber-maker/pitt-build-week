# PITT Final Submission Handoff

## Ready artifacts

- Final video: `SUBMISSION/final-video/pitt-devweek-submission-v3.mp4`
- Duration: 2:58.53
- Format: 1920x1080 H.264 video, AAC audio, embedded English subtitle track
- Caption upload file: `SUBMISSION/PITT_VIDEO_CAPTIONS_V3.srt`
- Narration regeneration: `scripts/generate-narration-v3.sh`
- Rebuild command: `scripts/build-submission-video-v3.sh`
- Verification command: `scripts/verify-submission-video-v3.sh`
- Public demo: https://seeker-cyber-maker.github.io/pitt-build-week/
- Public repository: https://github.com/seeker-cyber-maker/pitt-build-week
- Track: Work and Productivity
- Codex session ID: `019f8596-b0a4-7471-afc1-1b100df7f0e1`

## Canonical four outcomes

1. **Price hike, refuel:** PITT recalculates after the higher price; the driver chooses the still-worthwhile stop and reserve recovers.
2. **Wait for lower price:** the driver passes the price hike; the later price drop makes the stop worthwhile, and the driver chooses to refuel.
3. **Pass twice, continue safely:** a morning fill makes both extra stops uneconomic (`$0`, then `$2.73` saving versus `$16.80` detour cost). The driver passes twice; the route remains viable at `55.2%` reserve.
4. **Pass twice, closure offered:** without the morning-fill buffer, the driver passes both offers and fuel reaches `0%`. PITT blocks unsafe continuation and offers early closure. The driver confirms; remaining stops stay recorded as undelivered.

Authority wording is deliberate: PITT calculates, flags, blocks unsafe continuation, and offers options. The driver chooses, confirms, refuels, passes, or closes the route.

## Human-gated finish

1. Resolve entrant eligibility before submitting. The published rules expressly exclude Quebec residents.
2. Upload the v3 MP4 publicly to YouTube and attach the v3 SRT captions.
3. Verify the YouTube URL works while signed out and that narration and captions are synchronized.
4. Enter the prepared copy from `SUBMISSION/DEVPOST_SUBMISSION.md` into Devpost.
5. Add the public demo, repository, YouTube URL, Work and Productivity track, and Codex session ID.
6. Confirm team member names, roles, email addresses, and GitHub handles.
7. Submit before July 21, 2026 at 5:00 PM PDT / 8:00 PM EDT.

Do not represent the seeded proof of concept as live traffic, live weather, a production routing service, or automated vehicle control. The project demonstrates a driver-controlled decision workflow using reproducible scenario data.
