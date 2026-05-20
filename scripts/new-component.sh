#!/bin/bash
# Genera un componente con la estructura base del proyecto
# Uso: ./scripts/new-component.sh NombreComponente

set -e
NAME=$1
[ -z "$NAME" ] && echo "Uso: $0 NombreComponente" && exit 1

KEBAB=$(echo "$NAME" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')
FILE="src/components/${KEBAB}.tsx"
[ -f "$FILE" ] && echo "Ya existe: $FILE" && exit 1

cat > "$FILE" << TEMPLATE
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

type ${NAME}Props = {
  // definir props aquí
};

export function ${NAME}({}: ${NAME}Props) {
  const theme = useTheme();

  return (
    <View style={styles.container} />
  );
}

const styles = StyleSheet.create({
  container: {},
});
TEMPLATE

echo "✓ Creado: $FILE"
