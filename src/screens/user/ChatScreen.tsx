import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTopInset } from '../../hooks/useTopInset';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  time: string;
  status?: 'sent' | 'read';
}

interface ChatScreenProps {
  onBack: () => void;
  agentName?: string;
  orderId?: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: 'السلام عليكم، أنا خبير الهدايا المعين لطلبك', sender: 'agent', time: '10:00' },
  { id: '2', text: 'وعليكم السلام! متى سيكون الطلب جاهز؟', sender: 'user', time: '10:02', status: 'read' },
  { id: '3', text: 'سيكون جاهزاً خلال ساعتين إن شاء الله 🎁', sender: 'agent', time: '10:05' },
  { id: '4', text: 'ممتاز، شكراً جزيلاً', sender: 'user', time: '10:06', status: 'read' },
  { id: '5', text: 'بكل سرور! هل هناك أي تعليمات خاصة للهدية؟', sender: 'agent', time: '10:07' },
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBack, agentName = 'أحمد محمد', orderId = 'ORD-593821',
}) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);
  const topPadding = useTopInset();

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const flatRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString(isRTL ? 'ar' : 'en', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>{t.back_arrow}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{agentName}</Text>
          <Text style={styles.headerSub}>{orderId} · {t.chat_online}</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>خ</Text>
        </View>
      </View>

      <View style={styles.orderBanner}>
        <Text style={styles.orderBannerText}>🎁 طلب: {orderId}</Text>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => <MessageBubble message={item} C={C} styles={styles} />}
        contentContainerStyle={styles.messagesList}
        style={styles.messagesFlex}
        onContentSizeChange={() => flatRef.current?.scrollToEnd()}
      />

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="attach-outline" size={22} color={C.gray600} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t.chat_ph}
          placeholderTextColor={C.gray500}
          textAlign={isRTL ? 'right' : 'left'}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={16} color="#FFFFFF" style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const MessageBubble: React.FC<{ message: Message; C: ThemeColors; styles: ReturnType<typeof createStyles> }> = ({ message, styles }) => {
  const isUser = message.sender === 'user';
  return (
    <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapAgent]}>
      {!isUser && (
        <View style={styles.agentAvatar}>
          <Text style={styles.agentAvatarText}>خ</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAgent]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{message.text}</Text>
        <View style={styles.bubbleMeta}>
          {isUser && message.status === 'read' && (
            <Text style={styles.readTick}>✓✓</Text>
          )}
          <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>{message.time}</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.gray100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.sm },
  backIcon: { fontSize: 20, color: C.primary },
  headerCenter: { flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' },
  headerName: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: C.black,
  },
  headerSub: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: C.success,
    marginTop: 2,
  },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: C.primary,
  },
  orderBanner: {
    backgroundColor: C.primaryLighter,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xs,
    alignItems: isRTL ? 'flex-end' : 'flex-start',
  },
  orderBannerText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: C.primary,
  },
  messagesFlex: { flex: 1 },
  messagesList: { padding: Spacing.base, gap: Spacing.sm },
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  bubbleWrapUser: { flexDirection: 'row' },
  bubbleWrapAgent: { flexDirection: 'row-reverse' },
  agentAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  agentAvatarText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: C.primary,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  bubbleUser: {
    backgroundColor: C.primary,
    borderBottomRightRadius: isRTL ? 4 : Radius.lg,
    borderBottomLeftRadius: isRTL ? Radius.lg : 4,
  },
  bubbleAgent: {
    backgroundColor: C.white,
    borderBottomLeftRadius: isRTL ? 4 : Radius.lg,
    borderBottomRightRadius: isRTL ? Radius.lg : 4,
    ...Shadow.card,
  },
  bubbleText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.black,
    textAlign: isRTL ? 'right' : 'left',
  },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  readTick: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  bubbleTime: {
    fontFamily: Fonts.inter.regular,
    fontSize: 10,
    color: C.gray500,
  },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.7)' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: C.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: C.black,
    backgroundColor: C.gray100,
    borderRadius: Radius.xxl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    textAlign: isRTL ? 'right' : 'left',
    maxHeight: 100,
  },
  attachBtn: { padding: Spacing.sm },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: C.gray300 },
  sendIcon: { marginLeft: 2 },
});
