import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeInDown, FadeInUp,
  useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { H_PAD, NAV_SAFE_PAD, Spacing } from '@/constants/theme';
import { useGlass } from '@/hooks/use-glass';

type Message = { id: string; role: 'user' | 'assistant'; text: string; ts: string };

const SUGGESTIONS = [
  '¿Cómo mejorar mi flujo de caja?',
  '¿Cuánto gasté este mes?',
  'Analiza mis ingresos',
  '¿Cuándo conviene invertir?',
];

const INITIAL_MSGS: Message[] = [{
  id: '0', role: 'assistant', ts: 'Ahora',
  text: 'Hola 👋 Soy tu asistente financiero. Puedo ayudarte a entender tus finanzas, analizar tus movimientos y darte recomendaciones personalizadas.\n\n¿En qué te puedo ayudar hoy?',
}];

function formatTs() {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

const REPLIES: Record<string, string> = {
  '¿Cómo mejorar mi flujo de caja?': 'Para mejorar tu flujo de caja te recomiendo:\n\n1. Revisar gastos recurrentes y eliminar los innecesarios\n2. Anticipar cobros pendientes\n3. Crear un fondo de emergencia de 3 meses\n\n¿Quieres que analice tus movimientos actuales?',
  '¿Cuánto gasté este mes?': 'Este mes gastaste $4.200 distribuidos en:\n• Servicios: $340\n• Transferencias: $500\n• Otros: $3.360\n\nEstás 12% por debajo del mes anterior. ✅',
  'Analiza mis ingresos': 'Tus ingresos de mayo suman $12.400. El 76% proviene de transferencias recibidas y el 24% de cobros de facturas. Tu tendencia es positiva (+8% vs abril). 📈',
  '¿Cuándo conviene invertir?': 'Con tu balance actual de $8.170 y un flujo positivo, podrías considerar:\n\n• Plazos fijos en pesos para el corto plazo\n• FCI money market para liquidez inmediata\n\n¿Te gustaría que te explique cada opción?',
};

export default function AIChatScreen() {
  const G = useGlass();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MSGS);
  const [input,    setInput]    = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendScale = useSharedValue(1);
  const sendAnim  = useAnimatedStyle(() => ({ transform: [{ scale: sendScale.value }] }));

  function scrollToBottom() {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }

  function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || thinking) return;
    setInput('');
    setMessages((p) => [...p, { id: Date.now().toString(), role: 'user', text: msg, ts: formatTs() }]);
    setThinking(true);
    scrollToBottom();
    sendScale.value = withSpring(0.85, { duration: 80 }, () => { sendScale.value = withSpring(1, { duration: 200 }); });
    setTimeout(() => {
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', text: REPLIES[msg] ?? 'Entendido. Estoy procesando tu consulta con los datos de tu cuenta. 🤖', ts: formatTs() }]);
      setThinking(false);
      scrollToBottom();
    }, 1400);
  }

  return (
    <View style={[styles.root, { backgroundColor: G.bgFrom }]}>
      <LinearGradient colors={[G.bgFrom, G.bgMid, G.bgTo]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: G.cardBorder }]}>
          <View style={[styles.aiAvatar, { backgroundColor: G.accentSoft, borderColor: G.cardBorderActive }]}>
            <Text style={[styles.aiAvatarIcon, { color: G.accent }]}>◈</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: G.textPrimary }]}>Asistente IA</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: thinking ? '#facc15' : G.positive }]} />
              <Text style={[styles.statusTxt, { color: G.textSecondary }]}>{thinking ? 'Pensando…' : 'En línea'}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]} accessibilityLabel="Nueva conversación">
            <Text style={[styles.headerBtnTxt, { color: G.textSecondary }]}>✦ Nueva</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
          <ScrollView ref={scrollRef} style={styles.msgList} contentContainerStyle={styles.msgContent} showsVerticalScrollIndicator={false} onContentSizeChange={scrollToBottom}>

            {messages.map((msg) => (
              <Animated.View key={msg.id} entering={FadeInDown.duration(300).springify()}
                style={[styles.msgRow, msg.role === 'user' ? styles.msgRowUser : styles.msgRowAssistant]}>
                {msg.role === 'assistant' && (
                  <View style={[styles.msgAvatar, { backgroundColor: G.accentSoft, borderColor: G.cardBorderActive }]}>
                    <Text style={{ fontSize: 14, color: G.accent }}>◈</Text>
                  </View>
                )}
                <View style={[
                  styles.bubble,
                  msg.role === 'user'
                    ? { backgroundColor: G.accent }
                    : { backgroundColor: G.cardBg, borderWidth: 0.5, borderColor: G.cardBorder },
                ]}>
                  <Text style={[styles.bubbleText, { color: msg.role === 'user' ? G.accentContrast : G.textPrimary }]}>{msg.text}</Text>
                  <Text style={[styles.bubbleTs, { color: msg.role === 'user' ? 'rgba(255,255,255,0.45)' : G.textMuted }]}>{msg.ts}</Text>
                </View>
              </Animated.View>
            ))}

            {thinking && (
              <Animated.View entering={FadeIn.duration(200)} style={[styles.msgRow, styles.msgRowAssistant]}>
                <View style={[styles.msgAvatar, { backgroundColor: G.accentSoft, borderColor: G.cardBorderActive }]}>
                  <Text style={{ fontSize: 14, color: G.accent }}>◈</Text>
                </View>
                <View style={[styles.bubble, styles.typingBubble, { backgroundColor: G.cardBg, borderWidth: 0.5, borderColor: G.cardBorder }]}>
                  <Text style={[styles.typingDots, { color: G.textMuted }]}>● ● ●</Text>
                </View>
              </Animated.View>
            )}

            {messages.length === 1 && (
              <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.suggestions}>
                <Text style={[styles.suggestionsLabel, { color: G.textMuted }]}>Sugerencias</Text>
                <View style={styles.suggestionGrid}>
                  {SUGGESTIONS.map((s) => (
                    <TouchableOpacity key={s} onPress={() => handleSend(s)} style={[styles.suggestionChip, { backgroundColor: G.cardBg, borderColor: G.cardBorder }]} accessibilityLabel={s}>
                      <Text style={[styles.suggestionTxt, { color: G.textSecondary }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={[styles.inputBar, { marginBottom: NAV_SAFE_PAD - 16, borderTopColor: G.cardBorder, backgroundColor: G.bgFrom + 'e0' }]}>
            <TextInput
              style={[styles.textInput, { backgroundColor: G.inputBg, borderColor: G.inputBorder, color: G.textPrimary }]}
              value={input}
              onChangeText={setInput}
              placeholder="Consultá sobre tus finanzas…"
              placeholderTextColor={G.textMuted}
              multiline maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
            />
            <Animated.View style={sendAnim}>
              <TouchableOpacity onPress={() => handleSend()} disabled={!input.trim() || thinking}
                style={[styles.sendBtn, { opacity: !input.trim() || thinking ? 0.4 : 1 }]} accessibilityLabel="Enviar">
                <LinearGradient colors={[G.accent, G.centerBtnTo]} style={styles.sendBtnGrad}>
                  <Text style={[styles.sendBtnIcon, { color: G.accentContrast }]}>↑</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, safe: { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: H_PAD, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  aiAvatar:     { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  aiAvatarIcon: { fontSize: 18 },
  headerTitle:  { fontSize: 16, fontWeight: '700' },
  statusRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot:    { width: 6, height: 6, borderRadius: 3 },
  statusTxt:    { fontSize: 11 },
  headerBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 0.5 },
  headerBtnTxt: { fontSize: 12 },
  msgList:    { flex: 1 },
  msgContent: { paddingHorizontal: H_PAD, paddingTop: Spacing.two, gap: 12, paddingBottom: 8 },
  msgRow:          { flexDirection: 'row', gap: 8, maxWidth: '88%' },
  msgRowUser:      { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgRowAssistant: { alignSelf: 'flex-start' },
  msgAvatar:   { width: 28, height: 28, borderRadius: 10, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  bubble:      { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%', gap: 4 },
  bubbleText:  { fontSize: 14, lineHeight: 20 },
  bubbleTs:    { fontSize: 10, alignSelf: 'flex-end' },
  typingBubble:{ paddingVertical: 12, paddingHorizontal: 16 },
  typingDots:  { fontSize: 10, letterSpacing: 3 },
  suggestions:      { marginTop: Spacing.two, gap: 10 },
  suggestionsLabel: { fontSize: 11, letterSpacing: 0.5 },
  suggestionGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip:   { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 0.5 },
  suggestionTxt:    { fontSize: 12 },
  inputBar:    { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: H_PAD, paddingTop: 10, paddingBottom: 10, gap: 10, borderTopWidth: StyleSheet.hairlineWidth },
  textInput:   { flex: 1, minHeight: 40, maxHeight: 100, borderWidth: 0.5, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  sendBtn:     { flexShrink: 0 },
  sendBtnGrad: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendBtnIcon: { fontSize: 18, fontWeight: '700' },
});
