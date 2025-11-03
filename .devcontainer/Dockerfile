FROM denoland/deno:latest

# Install additional tools if needed
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir /home/deno && chown deno:deno /home/deno

# Set the working directory
WORKDIR /workspace

# Switch to non-root user for security
USER deno
