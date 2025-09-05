#!/bin/bash
set -e

# Load environment variables from .env
if [ ! -f .env ]; then
  echo "Error: .env file not found!" >&2
  exit 1
fi

export $(grep -v '^#' .env | xargs)

# Create the database if it doesn't exist
if ! node --env-file=.env -r ts-node/register src/database/initialize.ts; then
  echo "Error: Database initialization failed!" >&2
  exit 2
fi

# Run migrations
if ! kysely migrate:latest; then
  echo "Error: Migration failed!" >&2
  exit 3
else 
  echo "Database initialized and migrations applied successfully."
fi

