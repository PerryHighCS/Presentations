# Keep this tag in sync with playwright== in requirements.txt. The image ships
# the matching browsers in /ms-playwright (PLAYWRIGHT_BROWSERS_PATH).
FROM mcr.microsoft.com/playwright:v1.64.1-noble

# pdfimages for scripts/extract-pdf-images.sh. Python, gh, and the vscode user
# come from features in devcontainer.json.
RUN apt-get update \
    && apt-get install -y --no-install-recommends poppler-utils python-is-python3 \
    && rm -rf /var/lib/apt/lists/*
