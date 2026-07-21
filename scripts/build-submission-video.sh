#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

work="${TMPDIR:-/tmp}/pitt-devweek-video"
rm -rf "$work"
mkdir -p "$work"

common_video=(-an -r 30 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -movflags +faststart)

still() {
  local input="$1" duration="$2" output="$3"
  ffmpeg -hide_banner -loglevel error -y -loop 1 -i "$input" -t "$duration" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x071817" \
    "${common_video[@]}" "$output"
}

run_clip() {
  local input="$1" target="$2" overlay_image="$3" output="$4"
  local source ratio
  source="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$input")"
  ratio="$(awk -v target="$target" -v source="$source" 'BEGIN { printf "%.8f", target/source }')"
  ffmpeg -hide_banner -loglevel error -y -i "$input" -loop 1 -i "$overlay_image" -t "$source" \
    -filter_complex "[0:v]setpts=${ratio}*PTS[base];[1:v]format=rgba[mark];[base][mark]overlay=0:0:shortest=1[out]" \
    -map "[out]" "${common_video[@]}" -t "$target" "$output"
}

still SUBMISSION/video-assets/intro-1.png 6 "$work/01.mp4"
still SUBMISSION/video-assets/intro-2.png 7 "$work/02.mp4"
still SUBMISSION/screenshots/01-planning-context.png 17 "$work/03.mp4"
still SUBMISSION/screenshots/01-planning-context.png 17 "$work/04.mp4"
still SUBMISSION/screenshots/01-planning-context.png 8 "$work/05.mp4"
run_clip recordings/codex-side-browser/run-1-price-hike.mov 16 SUBMISSION/video-assets/outcome-1.png "$work/06.mp4"
run_clip recordings/codex-side-browser/run-2-price-drop.mov 18 SUBMISSION/video-assets/outcome-2.png "$work/07.mp4"
run_clip recordings/codex-side-browser/run-3-not-cost-worthy.mov 20 SUBMISSION/video-assets/outcome-3.png "$work/08.mp4"
run_clip recordings/codex-side-browser/run-4-run-out-close-early.mov 18 SUBMISSION/video-assets/outcome-4.png "$work/09.mp4"

ffmpeg -hide_banner -loglevel error -y -ss 0 -i recordings/codex-side-browser/run-1-price-hike.mov -t 10.5 "${common_video[@]}" "$work/10a.mp4"
ffmpeg -hide_banner -loglevel error -y -ss 8 -i recordings/codex-side-browser/run-3-not-cost-worthy.mov -t 10.5 "${common_video[@]}" "$work/10b.mp4"
printf "file '%s'\nfile '%s'\n" "$work/10a.mp4" "$work/10b.mp4" > "$work/codex-concat.txt"
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$work/codex-concat.txt" -c copy "$work/10.mp4"

still SUBMISSION/screenshots/04-report-and-machine-handoff.png 9 "$work/11.mp4"
still SUBMISSION/video-assets/outro.png 8 "$work/12.mp4"

: > "$work/video-concat.txt"
for part in "$work"/[0-9][0-9].mp4; do printf "file '%s'\n" "$part" >> "$work/video-concat.txt"; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$work/video-concat.txt" -c copy "$work/video.mp4"

cue_dir="SUBMISSION/audio/cues"
ffmpeg -hide_banner -loglevel error -y \
  -i "$cue_dir/01-intro-authority.wav" \
  -i "$cue_dir/02-intro-context.wav" \
  -i "$cue_dir/03-product-route.wav" \
  -i "$cue_dir/04-route-signals.wav" \
  -i "$cue_dir/05-fuel-economics.wav" \
  -i "$cue_dir/06-outcome-1.wav" \
  -i "$cue_dir/07-outcome-2.wav" \
  -i "$cue_dir/08-outcome-3.wav" \
  -i "$cue_dir/09-outcome-4.wav" \
  -i "$cue_dir/10-codex-collaboration.wav" \
  -i "$cue_dir/11-machine-handoff.wav" \
  -i "$cue_dir/12-magic-roundabout.wav" \
  -filter_complex "[0:a]adelay=0[a0];[1:a]adelay=6000[a1];[2:a]adelay=13000[a2];[3:a]adelay=30000[a3];[4:a]adelay=47000[a4];[5:a]adelay=55000[a5];[6:a]adelay=71000[a6];[7:a]adelay=89000[a7];[8:a]adelay=109000[a8];[9:a]adelay=127000[a9];[10:a]adelay=148000[a10];[11:a]adelay=157000[a11];[a0][a1][a2][a3][a4][a5][a6][a7][a8][a9][a10][a11]amix=inputs=12:duration=longest:normalize=0,alimiter=limit=0.95,apad=pad_dur=165[a]" \
  -map "[a]" -t 165 -c:a pcm_s16le "$work/audio.wav"

mkdir -p SUBMISSION/final-video
ffmpeg -hide_banner -loglevel error -y -i "$work/video.mp4" -i "$work/audio.wav" -i SUBMISSION/PITT_VIDEO_CAPTIONS.srt \
  -map 0:v -map 1:a -map 2:0 -t 165 -c:v copy -c:a aac -b:a 192k -c:s mov_text -metadata:s:s:0 language=eng -movflags +faststart \
  SUBMISSION/final-video/pitt-devweek-submission.mp4

ffprobe -v error -show_entries format=duration,size -of default=nw=1 SUBMISSION/final-video/pitt-devweek-submission.mp4
