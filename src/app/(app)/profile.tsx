import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Brand, H_PAD, NAV_SAFE_PAD, Spacing } from '@/constants/theme';
import { useGlass, useIsDark } from '@/hooks/use-glass';
import { useAuth } from '@/hooks/use-auth';
import { useUiStore } from '@/stores/ui.store';

type MenuRow  = { id: string; icon: string; label: string; sublabel?: string; value?: string; destructive?: boolean; onPress?: () => void; toggle?: boolean; toggleValue?: boolean; onToggle?: (v: boolean) => void };
type MenuSection = { title: string; rows: MenuRow[] };

function StatCard({ label, value, accent, G }: { label: string; value: string; accent?: boolean; G: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: G.cardBg, borderColor: G.cardBorder }, accent && { backgroundColor: G.accentSoft, borderColor: G.cardBorderActive }]}>
      <Text style={[styles.statValue, { color: accent ? G.accent : G.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: G.textMuted }]}>{label}</Text>
    </View>
  );
}

function MenuRowItem({ row, last, G }: { row: MenuRow; last: boolean; G: any }) {
  return (
    <TouchableOpacity onPress={row.onPress} accessibilityLabel={row.label} activeOpacity={row.toggle ? 1 : 0.65}
      style={[styles.menuRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: G.cardBorder }]}>
      <View style={[styles.menuIcon, { backgroundColor: G.cardBg }, row.destructive && { backgroundColor: G.negative + '18' }]}>
        <Text style={styles.menuIconTxt}>{row.icon}</Text>
      </View>
      <View style={styles.menuMeta}>
        <Text style={[styles.menuLabel, { color: row.destructive ? G.negative : G.textPrimary }]}>{row.label}</Text>
        {row.sublabel && <Text style={[styles.menuSublabel, { color: G.textMuted }]}>{row.sublabel}</Text>}
      </View>
      {row.toggle
        ? <Switch value={row.toggleValue} onValueChange={row.onToggle} trackColor={{ false: G.cardBorder, true: G.accent }} thumbColor="#fff" />
        : row.value
          ? <Text style={[styles.menuValue, { color: G.textSecondary }]}>{row.value}</Text>
          : <Text style={[styles.menuChevron, { color: G.textMuted }]}>›</Text>
      }
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const G      = useGlass();
  const isDark = useIsDark();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { themeMode, setThemeMode } = useUiStore();

  const displayName = user?.name  ?? 'Juan Sánchez';
  const email       = user?.email ?? 'juan@ejemplo.com';
  const initials    = displayName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();

  function toggleTheme(v: boolean) {
    setThemeMode(v ? 'light' : 'dark');
  }

  const SECTIONS: MenuSection[] = [
    {
      title: 'Mi cuenta',
      rows: [
        { id: 'personal', icon: '👤', label: 'Datos personales',     sublabel: 'Nombre, apellido, DNI',       onPress: () => {} },
        { id: 'email',    icon: '✉️', label: 'Correo electrónico',   value: email,                            onPress: () => {} },
        { id: 'phone',    icon: '📱', label: 'Teléfono',             value: '+54 9 351 ···',                  onPress: () => {} },
        { id: 'cbu',      icon: '🏦', label: 'CBU / Alias',          sublabel: 'Copiar datos bancarios',      onPress: () => {} },
      ],
    },
    {
      title: 'Seguridad',
      rows: [
        { id: 'pin',       icon: '🔐', label: 'PIN de seguridad',         sublabel: 'Cambiar PIN de 6 dígitos', onPress: () => {} },
        { id: 'biometric', icon: '🪪', label: 'Face ID / Huella',         value: 'Activo',                      onPress: () => {} },
        { id: '2fa',       icon: '🛡️', label: 'Autenticación 2FA',        value: 'Inactivo',                    onPress: () => {} },
        { id: 'devices',   icon: '💻', label: 'Dispositivos conectados',  sublabel: '2 dispositivos',           onPress: () => {} },
      ],
    },
    {
      title: 'Preferencias',
      rows: [
        { id: 'theme',    icon: isDark ? '🌙' : '☀️', label: 'Modo claro', sublabel: isDark ? 'Tema oscuro activo' : 'Tema claro activo', toggle: true, toggleValue: !isDark, onToggle: toggleTheme },
        { id: 'notif',    icon: '🔔', label: 'Notificaciones', sublabel: 'Push, email, SMS',  onPress: () => {} },
        { id: 'currency', icon: '💱', label: 'Moneda principal', value: 'ARS',               onPress: () => {} },
        { id: 'language', icon: '🌐', label: 'Idioma',           value: 'Español',            onPress: () => {} },
      ],
    },
    {
      title: 'Soporte',
      rows: [
        { id: 'help',    icon: '❓', label: 'Centro de ayuda',           onPress: () => {} },
        { id: 'chat',    icon: '💬', label: 'Chat con soporte',          sublabel: 'Lun–Vie 9–18h', onPress: () => {} },
        { id: 'terms',   icon: '📄', label: 'Términos y condiciones',   onPress: () => {} },
        { id: 'privacy', icon: '🔒', label: 'Política de privacidad',   onPress: () => {} },
      ],
    },
    {
      title: '',
      rows: [
        { id: 'logout', icon: '↩', label: 'Cerrar sesión', destructive: true, onPress: logout },
      ],
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: G.bgFrom }]}>
      <LinearGradient colors={[G.bgFrom, G.bgMid, G.bgTo]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.headerOrb, { backgroundColor: G.orb1 }]} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: NAV_SAFE_PAD }]}>

          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
            <View style={styles.avatarWrap}>
              <LinearGradient colors={[Brand.primary, Brand.secondary]} style={styles.avatar}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
              <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: G.bgFrom, borderColor: G.cardBorder }]} accessibilityLabel="Cambiar foto">
                <Text style={[styles.editAvatarIcon, { color: G.textSecondary }]}>✎</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.heroName,  { color: G.textPrimary }]}>{displayName}</Text>
            <Text style={[styles.heroEmail, { color: G.textSecondary }]}>{email}</Text>
            <View style={[styles.verifiedBadge, { backgroundColor: G.positive + '18', borderColor: G.positive + '40' }]}>
              <Text style={[styles.verifiedTxt, { color: G.positive }]}>✓ Cuenta verificada</Text>
            </View>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
            <StatCard label="Transacciones" value="148"     G={G} />
            <StatCard label="Balance"        value="$8.1k"  G={G} accent />
            <StatCard label="Miembro desde"  value="May '25" G={G} />
          </Animated.View>

          {/* Plan */}
          <Animated.View entering={FadeInDown.delay(160).duration(400)}>
            <View style={[styles.planCard, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]}>
              <View style={styles.planLeft}>
                <Text style={styles.planIcon}>⚡</Text>
                <View>
                  <Text style={[styles.planName, { color: G.textPrimary }]}>Plan Básico</Text>
                  <Text style={[styles.planSub,  { color: G.textMuted }]}>Límite diario $50.000</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.upgradeBtn, { backgroundColor: G.accentSoft, borderColor: G.cardBorderActive }]} accessibilityLabel="Mejorar plan">
                <Text style={[styles.upgradeTxt, { color: G.accent }]}>Mejorar →</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Secciones */}
          {SECTIONS.map((section, si) => (
            <Animated.View key={section.title || `s${si}`} entering={FadeInDown.delay(200 + si * 60).duration(400)}>
              {section.title
                ? <Text style={[styles.sectionHeader, { color: G.textMuted }]}>{section.title}</Text>
                : <View style={{ height: 8 }} />}
              <View style={[styles.menuCard, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]}>
                {section.rows.map((row, ri) => (
                  <MenuRowItem key={row.id} row={row} last={ri === section.rows.length - 1} G={G} />
                ))}
              </View>
            </Animated.View>
          ))}

          <Text style={[styles.version, { color: G.textMuted }]}>SFVC v1.0.0 · Build 1</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  safe: { flex: 1 },
  headerOrb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -100, alignSelf: 'center', pointerEvents: 'none' },
  scrollContent: { paddingHorizontal: H_PAD, paddingTop: Spacing.two, gap: 12 },
  hero:          { alignItems: 'center', paddingVertical: Spacing.three, gap: 8 },
  avatarWrap:    { position: 'relative', marginBottom: 4 },
  avatar:        { width: 82, height: 82, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  avatarInitials:{ fontSize: 30, fontWeight: '800', color: '#fff' },
  editAvatarBtn: { position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  editAvatarIcon:{ fontSize: 13 },
  heroName:      { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  heroEmail:     { fontSize: 13 },
  verifiedBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 0.5 },
  verifiedTxt:   { fontSize: 11, fontWeight: '600' },
  statsRow:      { flexDirection: 'row', gap: 8 },
  statCard:      { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 16, borderWidth: 0.5, gap: 4 },
  statValue:     { fontSize: 17, fontWeight: '800' },
  statLabel:     { fontSize: 9, letterSpacing: 0.4 },
  planCard:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 16, borderWidth: 0.5 },
  planLeft:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planIcon:      { fontSize: 20 },
  planName:      { fontSize: 14, fontWeight: '700' },
  planSub:       { fontSize: 11, marginTop: 1 },
  upgradeBtn:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 0.5 },
  upgradeTxt:    { fontSize: 12, fontWeight: '700' },
  sectionHeader: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, paddingLeft: 4, marginTop: 4, marginBottom: -4 },
  menuCard:      { borderRadius: 18, borderWidth: 0.5, overflow: 'hidden' },
  menuRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  menuIcon:      { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuIconTxt:   { fontSize: 16 },
  menuMeta:      { flex: 1, gap: 2 },
  menuLabel:     { fontSize: 14, fontWeight: '500' },
  menuSublabel:  { fontSize: 11 },
  menuValue:     { fontSize: 12 },
  menuChevron:   { fontSize: 20, lineHeight: 22 },
  version:       { textAlign: 'center', fontSize: 10, marginTop: 8 },
});
