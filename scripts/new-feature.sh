#!/bin/bash
# Crea una rama de feature y valida el entorno antes de empezar
# Uso: ./scripts/new-feature.sh nombre-feature

set -e
NAME=$1
[ -z "$NAME" ] && echo "Uso: $0 nombre-feature" && exit 1

BRANCH="feature/${NAME}"

echo "→ Corriendo expo-doctor antes de crear la rama..."
npx expo-doctor

echo "→ Creando rama ${BRANCH}..."
git checkout -b "$BRANCH"

echo "✓ Rama ${BRANCH} creada y entorno validado"
