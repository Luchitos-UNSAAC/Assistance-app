#!/bin/bash
set -e

echo "Starting application..."
cd "$(dirname "$0")"
pnpm run dev &
#
#echo "Starting Inngest..."
#npx inngest-cli@latest dev &

wait
