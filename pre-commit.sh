#!/bin/bash

# Pre-commit hook script
# Frontend-only checks (backend removed)

set -e

echo "Running pre-commit checks..."
echo ""

# Get the project directory (prefer git root)
if command -v git >/dev/null 2>&1; then
    PROJECT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
else
    PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi
cd "$PROJECT_DIR"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Must run from project root directory"
    exit 1
fi

# Frontend checks only (backend removed)
echo ""
echo "📦 Running JavaScript/TypeScript checks..."

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "Warning: npm not found, skipping JavaScript checks"
else
    # Run ESLint
    echo "🔍 Checking JavaScript/TypeScript code with ESLint..."
    npm run lint || {
        echo "❌ ESLint failed!"
        exit 1
    }
fi

echo ""
echo "✅ All checks passed! Proceeding with commit..."
