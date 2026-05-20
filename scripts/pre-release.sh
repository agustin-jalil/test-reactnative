#!/bin/bash
# Checklist pre-release — bloquea si algo falla
# Uso: ./scripts/pre-release.sh

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}  Pre-release checklist${NC}"
echo "  ====================="
echo ""

echo -e "${BLUE}→${NC} [1/3] expo-doctor..."
npx expo-doctor
echo ""

echo -e "${BLUE}→${NC} [2/3] lint..."
npx expo lint
echo ""

echo -e "${BLUE}→${NC} [3/3] typecheck..."
npx tsc --noEmit
echo ""

echo -e "${GREEN}✓ Todo OK — listo para release${NC}"
echo ""
