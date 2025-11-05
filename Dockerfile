# Use Node.js 20 LTS on Alpine for smaller image size
FROM node:20-alpine

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/
COPY .env.sample ./.env.sample

# Create cache directory for SQLite
RUN mkdir -p .cache

# Set environment
ENV NODE_ENV=production

# Expose no ports (CLI application, no HTTP server)

# Set entrypoint to run the application
ENTRYPOINT ["node", "src/index.js"]

# Default command (can be overridden)
CMD ["menu"]
