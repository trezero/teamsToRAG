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
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
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

# Install dependencies (always use npm install for consistency)
RUN npm install --production --no-package-lock

# Copy frontend source
COPY frontend/ .

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
COPY --from=backend /app /app/backend

# Copy and install backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy built frontend from frontend-build stage
COPY --from=frontend-build /app/build /app/frontend/build

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

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
CMD ["sh", "-c", "nginx && python main.py"]
