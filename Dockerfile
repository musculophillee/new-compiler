FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install compilers and tools
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    python3 \
    python3-pip \
    default-jdk \
    golang \
    nodejs \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy repository
COPY . /app

# Set dynamic port environment
ENV PORT=10000

EXPOSE 10000

# Start server
CMD ["python3", "compiler/server.py"]
