FROM mcr.microsoft.com/playwright:v1.59.1-noble

# Layer 1: Python runtime/tooling and pdfimage dependencies.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip python3-venv python3-dev poppler-utils \
    && rm -rf /var/lib/apt/lists/* 

# Layer 2: Other devcontainer setup.
RUN apt-get update \
    && apt-get install -y --no-install-recommends sudo \
    && (id -u vscode >/dev/null 2>&1 || useradd -m -s /bin/bash vscode) \
    && usermod -aG sudo vscode \
    && echo "vscode ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vscode \
    && chmod 0440 /etc/sudoers.d/vscode \
    && ln -sf /usr/bin/python3 /usr/local/bin/python \
    && rm -rf /var/lib/apt/lists/* \
    && pip3 install --break-system-packages python-pptx
