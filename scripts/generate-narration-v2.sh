#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

tts="${QWEN_TTS_BIN:-$HOME/.local/bin/qwen-tts}"
text_dir="SUBMISSION/audio/v2/text"
out_dir="SUBMISSION/audio/v2"
style="Clear, calm, consistent documentary narration. Even volume and pace. Brief natural pauses between sentences."

[[ -x "$tts" ]] || { printf 'Missing Qwen TTS executable: %s\n' "$tts" >&2; exit 1; }

free_percent="$(memory_pressure 2>/dev/null | awk -F': ' '/System-wide memory free percentage/ { gsub(/%/, "", $2); print $2; exit }')"
if [[ "$free_percent" =~ ^[0-9]+$ ]] && (( free_percent < 15 )); then
  printf 'Refusing to load Qwen TTS with only %s%% memory free.\n' "$free_percent" >&2
  exit 75
fi

mkdir -p "$out_dir"
for text_file in "$text_dir"/*.txt; do
  name="$(basename "$text_file" .txt)"
  printf 'Generating %s\n' "$name"
  "$tts" say --voice serena --style "$style" --lang en --speed 1.0 \
    --file "$text_file" --out "$out_dir/$name.wav"
done

printf 'Generated %s isolated narration cues.\n' "$(find "$out_dir" -maxdepth 1 -name '*.wav' | wc -l | tr -d ' ')"
