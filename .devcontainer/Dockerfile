FROM mcr.microsoft.com/playwright:v1.58.2-noble

# Install sudo and allow pwuser to run elevated commands when needed.
RUN apt-get update \
    && apt-get install -y --no-install-recommends sudo \
    && usermod -aG sudo pwuser \
    && echo "pwuser ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/pwuser \
    && chmod 0440 /etc/sudoers.d/pwuser \
    && rm -rf /var/lib/apt/lists/*
