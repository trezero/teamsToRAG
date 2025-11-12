# Multi-stage Dockerfile for Teams RAG Application

# Stage 1: Backend (Python)
FROM python:3.10-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
# Install GPU requirements first to leverage caching
COPY backend/gpu-requirements.txt ./gpu-requirements.txt
RUN pip install --default-timeout=100 --retries=5 -r gpu-requirements.txt

# Install application requirements
COPY backend/app-requirements.txt ./app-requirements.txt
RUN pip install --default-timeout=100 --retries=5 -r app-requirements.txt

COPY backend/ .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Stage 2: Frontend (Node.js)
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
RUN npm install --production --no-package-lock
COPY frontend/ ./

# Build the application
RUN npm run build

# Stage 3: Production (Nginx + Python)
FROM python:3.10-slim AS production

# Install nginx and build dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Copy backend source code
# Copy backend source code and dependencies from the backend stage
COPY --from=backend /app /app/backend
COPY --from=backend /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages

# Copy built frontend from frontend-build stage
COPY --from=frontend-build /app/build /app/frontend/build

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && mkdir -p /var/cache/nginx /var/lib/nginx/body \
    && chown -R app:app /app \
    && chown -R app:app /var/log/nginx \
    && chown -R app:app /var/cache/nginx \
    && chown -R app:app /var/lib/nginx \
    && chown -R app:app /etc/nginx \
    && touch /var/run/nginx.pid \
    && chown app:app /var/run/nginx.pid

USER app

# Expose ports
EXPOSE 80 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start both services
CMD ["/start.sh"]
