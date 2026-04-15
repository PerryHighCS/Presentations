#!/usr/bin/env bash
set -euo pipefail

# Extract embedded images from PDF files into one folder per PDF.
# Default source directory: current working directory
#
# Usage:
#   scripts/extract-pdf-images.sh
#   scripts/extract-pdf-images.sh Decks/AR1/LockTronics

src_dir="${1:-.}"

if [[ ! -d "$src_dir" ]]; then
  echo "Error: source directory not found: $src_dir" >&2
  exit 1
fi

if ! command -v pdfimages >/dev/null 2>&1; then
  echo "Error: pdfimages not found. Install poppler-utils first." >&2
  exit 1
fi

shopt -s nullglob
pdfs=("$src_dir"/*.pdf)

if [[ ${#pdfs[@]} -eq 0 ]]; then
  echo "No PDF files found in $src_dir"
  exit 0
fi

for pdf in "${pdfs[@]}"; do
  base="${pdf%.pdf}"
  outdir="${base}_images"
  mkdir -p "$outdir"

  echo "Extracting: $pdf"
  pdfimages -all "$pdf" "$outdir/image"

done

echo "Done. Extracted image folders:"
for dir in "$src_dir"/*_images; do
  [[ -d "$dir" ]] || continue
  count=$(find "$dir" -maxdepth 1 -type f | wc -l)
  echo "  $dir ($count files)"
done
