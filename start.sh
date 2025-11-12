#!/bin/sh

# Start Nginx in the background
nginx -g 'daemon off;' &

# Start the FastAPI backend with Gunicorn
# Ensure the working directory is correct
cd /app/backend
exec gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 main:app