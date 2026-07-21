#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

version="${PITT_VIDEO_VERSION:-v2}"
case "$version" in
  v2)
    audio_dir="SUBMISSION/audio/v2"
    captions="SUBMISSION/PITT_VIDEO_CAPTIONS_V2.srt"
    output="SUBMISSION/final-video/pitt-devweek-submission-v2.mp4"
    target_duration="167.5"
    audio_filter='loudnorm=I=-18:TP=-1.5:LRA=7'
    durations=(5.0 6.6 10.1 17.2 13.0 16.0 32.0 22.5 25.0 11.6 8.5)
    ;;
  v3)
    audio_dir="SUBMISSION/audio/v3"
    captions="SUBMISSION/PITT_VIDEO_CAPTIONS_V3.srt"
    output="SUBMISSION/final-video/pitt-devweek-submission-v3.mp4"
    target_duration="178.5"
    audio_filter='adelay=300ms,loudnorm=I=-18:TP=-1.5:LRA=7,atempo=1.04'
    durations=(5.7 6.4 9.7 17.1 11.8 16.0 37.1 28.5 25.9 10.4 9.9)
    ;;
  *) printf 'Unsupported video version: %s\n' "$version" >&2; exit 2 ;;
esac

work="${TMPDIR:-/tmp}/pitt-devweek-video-$version"
mkdir -p "$work"
find "$work" -type f -delete

video_args=(-an -r 30 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -movflags +faststart)
browser_filter='crop=1280:720:640:180,scale=1920:1080'

still() {
  local input="$1" duration="$2" output="$3"
  ffmpeg -hide_banner -loglevel error -y -loop 1 -i "$input" -t "$duration" \
    -vf 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x071817' \
    "${video_args[@]}" "$output"
}

browser_clip() {
  local input="$1" start="$2" duration="$3" overlay="$4" output="$5"
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -i "$input" -loop 1 -i "$overlay" -t "$duration" \
    -filter_complex "[0:v]${browser_filter}[base];[1:v]format=rgba[mark];[base][mark]overlay=0:0:shortest=1[out]" \
    -map '[out]' "${video_args[@]}" "$output"
}

browser_hold() {
  local input="$1" at="$2" duration="$3" overlay="$4" output="$5"
  local frame="$work/hold-$(basename "$output" .mp4).png"
  ffmpeg -hide_banner -loglevel error -y -ss "$at" -i "$input" -vf "$browser_filter" -frames:v 1 "$frame"
  ffmpeg -hide_banner -loglevel error -y -loop 1 -i "$frame" -loop 1 -i "$overlay" -t "$duration" \
    -filter_complex '[0:v][1:v]overlay=0:0:shortest=1[out]' -map '[out]' "${video_args[@]}" "$output"
}

full_clip() {
  local input="$1" start="$2" duration="$3" output="$4"
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -i "$input" -t "$duration" \
    -vf 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black' \
    "${video_args[@]}" "$output"
}

concat_video() {
  local output="$1"; shift
  local list="$work/$(basename "$output" .mp4)-concat.txt"
  : > "$list"
  for input in "$@"; do printf "file '%s'\n" "$input" >> "$list"; done
  ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$list" -c copy "$output"
}

require_cue() {
  [[ -s "$audio_dir/$1.wav" ]] || {
    printf 'Missing %s narration cue %s.\n' "$version" "$1" >&2
    exit 1
  }
}

# Opening and product context: picture follows the narration section, without fake interaction.
still SUBMISSION/video-assets/intro-1.png "${durations[0]}" "$work/01.mp4"
still SUBMISSION/video-assets/intro-2.png "${durations[1]}" "$work/02.mp4"
still SUBMISSION/screenshots/01-planning-context.png "${durations[2]}" "$work/03.mp4"
still SUBMISSION/screenshots/01-planning-context.png "${durations[3]}" "$work/04.mp4"

# Outcome 1: rises at 2.44 s, refuel at 7.92 s, reserve recovers at 9.64 s.
r1=recordings/codex-side-browser/run-1-price-hike.mov
o1=SUBMISSION/video-assets/outcome-1.png
browser_hold "$r1" 12.0 2.4 "$o1" "$work/05a.mp4"
browser_clip "$r1" 12.0 1.0 "$o1" "$work/05b.mp4"
browser_hold "$r1" 13.3 4.2 "$o1" "$work/05c.mp4"
if [[ "$version" == v3 ]]; then browser_hold "$r1" 13.3 0.6 "$o1" "$work/05pre-d.mp4"; fi
browser_clip "$r1" 14.0 1.0 "$o1" "$work/05d.mp4"
browser_hold "$r1" 15.2 0.8 "$o1" "$work/05e.mp4"
browser_clip "$r1" 16.0 1.0 "$o1" "$work/05f.mp4"
if [[ "$version" == v3 ]]; then o1_final_hold=0.8; else o1_final_hold=2.6; fi
browser_hold "$r1" 17.0 "$o1_final_hold" "$o1" "$work/05g.mp4"
if [[ "$version" == v3 ]]; then
  concat_video "$work/05.mp4" "$work"/05{a,b,c}.mp4 "$work/05pre-d.mp4" "$work"/05{d,e,f,g}.mp4
else
  concat_video "$work/05.mp4" "$work"/05{a,b,c,d,e,f,g}.mp4
fi

# Outcome 2: passes at 3.60 s, route advances at 5.30 s, drops at 8.20 s, refuel at 12.74 s.
r2=recordings/codex-side-browser/run-2-price-drop.mov
o2=SUBMISSION/video-assets/outcome-2.png
browser_hold "$r2" 14.0 3.3 "$o2" "$work/06a.mp4"
browser_clip "$r2" 15.0 1.0 "$o2" "$work/06b.mp4"
browser_clip "$r2" 16.0 1.3 "$o2" "$work/06c.mp4"
browser_hold "$r2" 17.0 2.3 "$o2" "$work/06d.mp4"
browser_clip "$r2" 17.0 1.0 "$o2" "$work/06e.mp4"
browser_hold "$r2" 18.5 3.5 "$o2" "$work/06f.mp4"
if [[ "$version" == v3 ]]; then browser_hold "$r2" 18.5 0.8 "$o2" "$work/06pre-g.mp4"; fi
browser_clip "$r2" 19.0 1.0 "$o2" "$work/06g.mp4"
browser_clip "$r2" 21.0 1.0 "$o2" "$work/06h.mp4"
if [[ "$version" == v3 ]]; then o2_final_hold=0.8; else o2_final_hold=1.6; fi
browser_hold "$r2" 22.0 "$o2_final_hold" "$o2" "$work/06i.mp4"
if [[ "$version" == v3 ]]; then
  concat_video "$work/06.mp4" "$work"/06{a,b,c,d,e,f}.mp4 "$work/06pre-g.mp4" "$work"/06{g,h,i}.mp4
else
  concat_video "$work/06.mp4" "$work"/06{a,b,c,d,e,f,g,h,i}.mp4
fi

# Outcome 3: morning fill through 3.96 s; first rejection at 9.68 s; first pass at 12.12 s;
# lower price at 14.84 s; second rejection at 27.46 s; second pass at 29.02 s.
r3=recordings/codex-side-browser/run-3-not-cost-worthy.mov
o3=SUBMISSION/video-assets/outcome-3.png
if [[ "$version" == v3 ]]; then browser_hold "$r3" 12.0 4.3 "$o3" "$work/07pre.mp4"; fi
browser_hold "$r3" 12.0 4.3 "$o3" "$work/07a.mp4"
browser_clip "$r3" 12.0 1.0 "$o3" "$work/07b.mp4"
browser_hold "$r3" 13.0 6.4 "$o3" "$work/07c.mp4"
browser_clip "$r3" 14.0 1.0 "$o3" "$work/07d.mp4"
browser_hold "$r3" 15.0 0.7 "$o3" "$work/07e.mp4"
browser_clip "$r3" 16.0 1.0 "$o3" "$work/07f.mp4"
browser_clip "$r3" 17.0 1.0 "$o3" "$work/07g.mp4"
if [[ "$version" == v3 ]]; then o3_middle_hold=13.4; o3_final_hold=3.0; else o3_middle_hold=13.2; o3_final_hold=2.4; fi
browser_hold "$r3" 18.0 "$o3_middle_hold" "$o3" "$work/07h.mp4"
browser_clip "$r3" 19.0 1.0 "$o3" "$work/07i.mp4"
browser_hold "$r3" 20.0 "$o3_final_hold" "$o3" "$work/07j.mp4"
if [[ "$version" == v3 ]]; then
  concat_video "$work/07.mp4" "$work/07pre.mp4" "$work"/07{a,b,c,d,e,f,g,h,i,j}.mp4
else
  concat_video "$work/07.mp4" "$work"/07{a,b,c,d,e,f,g,h,i,j}.mp4
fi

# Outcome 4: first pass at 2.18 s, second pass remains visible through 5.24 s,
# zero at 8.62 s, blocked continuation and the closure offer remain visible from 10.30 s,
# and the driver confirms closure at 16.22 s.
r4=recordings/codex-side-browser/run-4-run-out-close-early.mov
o4=SUBMISSION/video-assets/outcome-4.png
if [[ "$version" == v3 ]]; then browser_hold "$r4" 14.0 4.6 "$o4" "$work/08pre.mp4"; fi
browser_hold "$r4" 14.0 1.8 "$o4" "$work/08a.mp4"
browser_clip "$r4" 15.0 1.0 "$o4" "$work/08b.mp4"
browser_clip "$r4" 16.2 0.8 "$o4" "$work/08c.mp4"
browser_clip "$r4" 17.4 0.6 "$o4" "$work/08d.mp4"
browser_clip "$r4" 19.0 1.0 "$o4" "$work/08e.mp4"
browser_hold "$r4" 20.0 2.6 "$o4" "$work/08f.mp4"
browser_clip "$r4" 20.2 1.0 "$o4" "$work/08g.mp4"
if [[ "$version" == v3 ]]; then o4_choice_hold=8.1; else o4_choice_hold=6.7; fi
browser_hold "$r4" 21.2 "$o4_choice_hold" "$o4" "$work/08h.mp4"
browser_clip "$r4" 22.2 1.0 "$o4" "$work/08i.mp4"
browser_hold "$r4" 23.0 6.0 "$o4" "$work/08j.mp4"
if [[ "$version" == v3 ]]; then
  concat_video "$work/08.mp4" "$work/08pre.mp4" "$work"/08{a,b,c,d,e,f,g,h,i,j}.mp4
else
  concat_video "$work/08.mp4" "$work"/08{a,b,c,d,e,f,g,h,i,j}.mp4
fi

# Codex appears once, at normal speed, only for the contribution narration.
full_clip "$r1" 0 23.28 "$work/09a.mp4"
ffmpeg -hide_banner -loglevel error -y -sseof -0.1 -i "$r1" -vf 'scale=1920:1080' -frames:v 1 "$work/codex-hold.png"
if [[ "$version" == v3 ]]; then codex_hold=2.62; else codex_hold=1.72; fi
still "$work/codex-hold.png" "$codex_hold" "$work/09b.mp4"
concat_video "$work/09.mp4" "$work/09a.mp4" "$work/09b.mp4"

still SUBMISSION/screenshots/04-report-and-machine-handoff.png "${durations[9]}" "$work/10.mp4"
still SUBMISSION/video-assets/outro.png "${durations[10]}" "$work/11.mp4"

concat_video "$work/video.mp4" "$work"/{01,02,03,04,05,06,07,08,09,10,11}.mp4

# Normalize each scene independently, then pad it to the exact picture duration.
names=(01-intro-authority 02-intro-context 03-product-layer 04-moving-signals 05-outcome-1 06-outcome-2 07-outcome-3 08-outcome-4 09-codex-collaboration 10-machine-handoff 11-magic-roundabout)
: > "$work/audio-concat.txt"
for i in "${!names[@]}"; do
  name="${names[$i]}"; duration="${durations[$i]}"
  require_cue "$name"
  scene_audio_filter="$audio_filter"
  if [[ "$version" == v3 && "$name" == 01-intro-authority ]]; then
    scene_audio_filter="$scene_audio_filter,volume=-1.6dB"
  fi
  ffmpeg -hide_banner -loglevel error -y -i "$audio_dir/$name.wav" \
    -af "$scene_audio_filter,apad=whole_dur=$duration,atrim=duration=$duration" -ar 48000 -ac 1 -c:a pcm_s16le "$work/audio-$name.wav"
  printf "file '%s'\n" "$work/audio-$name.wav" >> "$work/audio-concat.txt"
done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$work/audio-concat.txt" -c copy "$work/audio.wav"

mkdir -p SUBMISSION/final-video
ffmpeg -hide_banner -loglevel error -y -i "$work/video.mp4" -i "$work/audio.wav" -i "$captions" \
  -map 0:v -map 1:a -map 2:0 -t "$target_duration" -c:v copy -c:a aac -b:a 192k -c:s mov_text \
  -metadata:s:s:0 language=eng -movflags +faststart "$output"

ffmpeg -v error -i "$output" -f null -
duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$output")"
awk -v d="$duration" 'BEGIN { if (d > 180.0) exit 1 }'
ffprobe -v error -show_entries format=duration,size -show_entries stream=index,codec_name,codec_type:stream_tags=language -of json \
  "$output"
