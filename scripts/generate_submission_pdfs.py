#!/usr/bin/env python3
"""Generate submission PDFs from markdown sources using WeasyPrint + Liberation."""

import os
import sys
import markdown
from weasyprint import HTML

# Paths
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUBMISSION_DIR = os.path.join(REPO_ROOT, "SUBMISSION")
PDFS_DIR = os.path.join(SUBMISSION_DIR, "pdfs")

CSS_TEMPLATE = """
@page { size: A4; margin: 2cm; }

body {
    font-family: 'Liberation Sans', 'Liberation Serif', sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
}

h1 {
    font-size: 20pt;
    font-weight: bold;
    color: #0d1b2a;
    border-bottom: 2px solid #1b263b;
    padding-bottom: 0.3em;
    margin-top: 0;
    page-break-after: avoid;
}

h2 {
    font-size: 14pt;
    font-weight: bold;
    color: #1b263b;
    margin-top: 1.5em;
    page-break-after: avoid;
}

h3 {
    font-size: 12pt;
    font-weight: bold;
    color: #2d3a4a;
    margin-top: 1.2em;
    page-break-after: avoid;
}

h4 {
    font-size: 11pt;
    font-weight: bold;
    color: #3d4a5a;
    margin-top: 1em;
    page-break-after: avoid;
}

p {
    margin: 0.8em 0;
    text-align: justify;
}

blockquote {
    border-left: 3px solid #4a6fa5;
    margin: 1em 0;
    padding: 0.5em 1em;
    background: #f5f7fa;
    color: #3a4a5a;
    font-size: 10pt;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 10pt;
    page-break-inside: avoid;
}

th {
    background: #1b263b;
    color: white;
    font-weight: bold;
    text-align: left;
    padding: 0.5em;
    border: 1px solid #2d3a4a;
}

td {
    padding: 0.4em 0.5em;
    border: 1px solid #ccc;
    vertical-align: top;
}

tr:nth-child(even) {
    background: #f8f9fa;
}

code {
    font-family: 'Liberation Mono', monospace;
    font-size: 9.5pt;
    background: #f0f0f0;
    padding: 0.1em 0.3em;
    border-radius: 2px;
}

pre {
    background: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: 3px;
    padding: 0.8em;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.4;
    page-break-inside: avoid;
}

pre code {
    background: none;
    padding: 0;
}

ul, ol {
    margin: 0.6em 0;
    padding-left: 1.8em;
}

li {
    margin: 0.3em 0;
}

a {
    color: #4a6fa5;
    text-decoration: none;
}

hr {
    border: none;
    border-top: 1px solid #ccc;
    margin: 1.5em 0;
}

strong {
    font-weight: bold;
    color: #0d1b2a;
}

em {
    font-style: italic;
}

.page-header {
    text-align: right;
    font-size: 8pt;
    color: #888;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.5em;
    margin-bottom: 1em;
}
"""


def md_to_pdf(md_path: str, pdf_path: str, header_text: str = "") -> None:
    """Convert a markdown file to PDF via WeasyPrint."""
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    # Convert markdown to HTML
    html_body = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "toc", "nl2br"],
    )

    header_html = f'<div class="page-header">{header_text}</div>' if header_text else ""

    full_html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>{os.path.basename(pdf_path)}</title>
<style>{CSS_TEMPLATE}</style>
</head>
<body>
{header_html}
{html_body}
</body>
</html>"""

    HTML(string=full_html).write_pdf(pdf_path)
    print(f"  ✓ {pdf_path}")


FILES = [
    ("CHECKLIST.md", "PITT_Checklist.pdf", "PITT Build Week — Submission Checklist"),
    ("PRODUCT_NARRATIVE.md", "PITT_Product_Narrative.pdf", "PITT Build Week — Product Narrative"),
    ("DEVPOST_SUBMISSION.md", "PITT_Devpost_Submission.pdf", "PITT Build Week — Devpost Submission"),
    ("DEVWEEK_REFERENCES.md", "PITT_DevWeek_References.pdf", "PITT Build Week — References"),
    ("VIDEO_SCRIPT.md", "PITT_Video_Script.pdf", "PITT Build Week — Video Script (2:30)"),
    ("PATRICK_QUESTIONNAIRE.md", "PITT_Questionnaire.pdf", "PITT Build Week — Operational Questionnaire"),
    ("PATRICK_SYNTHESIS.md", "PITT_Synthesis.pdf", "PITT Build Week — Synthesis"),
]


def main() -> None:
    os.makedirs(PDFS_DIR, exist_ok=True)
    print(f"Generating submission PDFs → {PDFS_DIR}")
    print("-" * 50)

    errors = []
    for md_name, pdf_name, header in FILES:
        md_path = os.path.join(SUBMISSION_DIR, md_name)
        pdf_path = os.path.join(PDFS_DIR, pdf_name)
        if not os.path.exists(md_path):
            errors.append(f"Missing source: {md_path}")
            continue
        try:
            md_to_pdf(md_path, pdf_path, header)
        except Exception as e:
            errors.append(f"{pdf_name}: {e}")

    print("-" * 50)
    if errors:
        print("Errors:")
        for e in errors:
            print(f"  ✗ {e}")
        sys.exit(1)
    else:
        print("All PDFs generated successfully.")


if __name__ == "__main__":
    main()
