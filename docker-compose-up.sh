#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  Step 1: Running tests..."
echo "=========================================="

if [ -d "book-library-backend" ]; then
  cd book-library-backend
  if npm test; then
    echo ""
    echo "✓ Tests passed"
    cd "$SCRIPT_DIR"
  else
    echo ""
    echo "✗ Tests FAILED - docker compose will NOT be run"
    echo "  Please fix the failing tests before building and starting containers."
    exit 1
  fi
else
  echo "Warning: book-library-backend not found, skipping tests"
  cd "$SCRIPT_DIR"
fi

echo ""
echo "=========================================="
echo "  Step 2: Building and starting containers..."
echo "=========================================="

docker compose build
docker compose up -d

echo ""
echo "✓ Done. Containers are running."
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:3000"
