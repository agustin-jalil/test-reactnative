#!/bin/bash
# Genera una screen en src/app/
# Uso: ./scripts/new-screen.sh nombre-screen [grupo]
# Ejemplo: ./scripts/new-screen.sh perfil (app)

set -e
NAME=$1
GROUP=$2
[ -z "$NAME" ] && echo "Uso: $0 nombre-screen [grupo]" && exit 1

if [ -n "$GROUP" ]; then
  DIR="src/app/${GROUP}"
  FILE="${DIR}/${NAME}.tsx"
else
  FILE="src/app/${NAME}.tsx"
fi

mkdir -p "$(dirname "$FILE")"
[ -f "$FILE" ] && echo "Ya existe: $FILE" && exit 1

PASCAL=$(echo "$NAME" | sed 's/-\([a-z]\)/\U\1/g' | sed 's/^\([a-z]\)/\U\1/')

cat > "$FILE" << TEMPLATE
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export default function ${PASCAL}Screen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">${PASCAL}</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
TEMPLATE

echo "✓ Creado: $FILE"
