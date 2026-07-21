#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

tts="${QWEN_TTS_BIN:-$HOME/.local/bin/qwen-tts}"
text_dir="SUBMISSION/audio/v3/text"
out_dir="SUBMISSION/audio/v3"
base_style="Natural documentary narration. Pronounce Pitt exactly like the word pit in pit stop. Clear consonants, complete words, even volume, and short pauses between sentences."

[[ -x "$tts" ]] || { printf 'Missing Qwen TTS executable: %s\n' "$tts" >&2; exit 1; }

free_percent="$(memory_pressure 2>/dev/null | awk -F': ' '/System-wide memory free percentage/ { gsub(/%/, "", $2); print $2; exit }')"
if [[ "$free_percent" =~ ^[0-9]+$ ]] && (( free_percent < 15 )); then
  printf 'Refusing to load Qwen TTS with only %s%% memory free.\n' "$free_percent" >&2
  exit 75
fi

mkdir -p "$out_dir"
if (( $# )); then
  text_files=()
  for name in "$@"; do text_files+=("$text_dir/$name.txt"); done
else
  text_files=("$text_dir"/*.txt)
fi

for text_file in "${text_files[@]}"; do
  [[ -s "$text_file" ]] || { printf 'Missing narration text: %s\n' "$text_file" >&2; exit 1; }
  name="$(basename "$text_file" .txt)"
  style="$base_style"
  speed="1.0"
  case "$name" in
    01-intro-authority) style="$base_style Confident opening hook with restrained urgency."; speed="1.03" ;;
    02-intro-context|03-product-layer) style="$base_style Brisk and engaging explainer tone."; speed="1.04" ;;
    04-moving-signals) style="$base_style Energetic technical explainer tone with gentle emphasis on traffic, weather, roadwork, and refueling."; speed="1.04" ;;
    09-codex-collaboration) style="$base_style Warm conversational delivery with a subtle smile on moral support and the game joke. Finish firmly on driver authority."; speed="1.02" ;;
    10-machine-handoff) style="$base_style Crisp, assured handoff tone."; speed="1.03" ;;
    11-magic-roundabout) style="$base_style Light, dry closing humor with a clear pause before the wizard line."; speed="1.02" ;;
  esac
  printf 'Generating %s\n' "$name"
  "$tts" say --voice serena --style "$style" --lang en --speed "$speed" \
    --file "$text_file" --out "$out_dir/$name.wav"
done

printf 'Generated %s v3 narration cues.\n' "${#text_files[@]}"
