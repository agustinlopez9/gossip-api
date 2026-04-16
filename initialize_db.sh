#!/bin/bash
set -e

if [ ! -f .env ]; then
  echo "Error: .env file not found!" >&2
  exit 1
fi

export $(grep -v '^#' .env | xargs)

if ! npx tsx src/database/initialize.ts; then
  echo "Error: Database initialization failed!" >&2
  exit 2
fi

if ! npx kysely migrate latest; then
  echo "Error: Migration failed!" >&2
  exit 3
fi

if ! npx tsx src/database/seeds/runSeeds.ts; then
  echo "Error: Seeding failed!" >&2
  exit 4
fi

echo "✅ Database initialized, migrations applied, and data seeded successfully."

