#!/bin/sh
set -e

echo "Using DB: $DB_FILE_NAME"
echo "Running Drizzle Migrations..."

pnpm drizzle-kit push

echo "Starting Next.js..."
pnpm start
