#!/usr/bin/env python3
"""Create one readable, deterministic collaboration report from harness handoffs."""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HANDOFFS = ROOT / "HANDOFFS"
OUTPUT = ROOT / "CONTROL" / "COLLATION_REPORT.md"


def status_of(markdown: str) -> str:
    for line in markdown.splitlines():
        if line.lower().startswith("- **status:**"):
            return line.split(":", 1)[1].strip()
    return "not declared"


def main() -> None:
    records = []
    for path in sorted(HANDOFFS.glob("*.md")):
        if path.name == "_TEMPLATE.md":
            continue
        content = path.read_text(encoding="utf-8").strip()
        records.append((path.stem, status_of(content), content))

    lines = [
        "# PITT Collaboration Report",
        "",
        "Generated locally from `HANDOFFS/*.md`. This report does not validate code or merge branches.",
        "",
        "## Status Summary",
        "",
        "| Harness | Status |",
        "| --- | --- |",
    ]
    lines.extend(f"| {name} | {status} |" for name, status, _ in records)
    if not records:
        lines.append("| None | No harness handoffs found |")

    for name, _, content in records:
        lines.extend(["", "---", "", content])

    OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} from {len(records)} handoff(s).")


if __name__ == "__main__":
    main()
