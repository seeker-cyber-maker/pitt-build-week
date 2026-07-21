#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

video="SUBMISSION/final-video/pitt-devweek-submission-v2.mp4"
captions="SUBMISSION/PITT_VIDEO_CAPTIONS_V2.srt"
cue_dir="SUBMISSION/audio/v2"
expected=(01-intro-authority 02-intro-context 03-product-layer 04-moving-signals 05-outcome-1 06-outcome-2 07-outcome-3 08-outcome-4 09-codex-collaboration 10-machine-handoff 11-magic-roundabout)

[[ -s "$video" ]] || { printf 'Missing final video: %s\n' "$video" >&2; exit 1; }
[[ -s "$captions" ]] || { printf 'Missing captions: %s\n' "$captions" >&2; exit 1; }

for name in "${expected[@]}"; do
  [[ -s "$cue_dir/$name.wav" ]] || { printf 'Missing cue: %s.wav\n' "$name" >&2; exit 1; }
  [[ -s "$cue_dir/text/$name.txt" ]] || { printf 'Missing cue text: %s.txt\n' "$name" >&2; exit 1; }
done

duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$video")"
awk -v d="$duration" 'BEGIN { if (d <= 0 || d > 180) exit 1 }' || {
  printf 'Video duration must be greater than zero and at most 180 seconds; got %s.\n' "$duration" >&2
  exit 1
}

stream_types="$(ffprobe -v error -show_entries stream=codec_type -of csv=p=0 "$video" | sort | tr '\n' ' ')"
[[ "$stream_types" == 'audio subtitle video ' ]] || {
  printf 'Expected audio, subtitle, and video streams; got: %s\n' "$stream_types" >&2
  exit 1
}

ffmpeg -v error -i "$video" -f null -

printf 'PASS: %s seconds; audio, subtitle, and video streams present; full decode succeeded.\n' "$duration"
printf 'Manual QA still required: review every action anchor in SUBMISSION/NARRATION_SYNC_PLAN.md and listen across every scene join.\n'
