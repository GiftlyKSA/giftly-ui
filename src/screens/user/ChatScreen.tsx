import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  I18nManager,
} from 'react-native';
import { Colors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';

I18nManager.forceRTL(true);

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

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
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

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBack,
  agentName = 'أحمد محمد',
  orderId = 'ORD-593821',
}) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const flatRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, Shadow.header]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>→</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{agentName}</Text>
          <Text style={styles.headerSub}>{orderId} · متصل الآن</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>خ</Text>
        </View>
      </View>

      {/* Order reference banner */}
      <View style={styles.orderBanner}>
        <Text style={styles.orderBannerText}>🎁 طلب: {orderId}</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatRef.current?.scrollToEnd()}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="اكتب رسالتك..."
            placeholderTextColor={Colors.gray500}
            textAlign="right"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Text style={styles.sendIcon}>⬆️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gray100 },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.base,
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.sm },
  backIcon: { fontSize: 20, color: Colors.primary },
  headerCenter: { flex: 1, alignItems: 'flex-end' },
  headerName: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: Colors.black,
  },
  headerSub: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.xs,
    color: Colors.success,
    marginTop: 2,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  orderBanner: {
    backgroundColor: Colors.primaryLighter,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xs,
    alignItems: 'flex-end',
  },
  orderBannerText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  messagesList: { padding: Spacing.base, gap: Spacing.sm },
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  bubbleWrapUser: { flexDirection: 'row-reverse' },
  bubbleWrapAgent: { flexDirection: 'row' },
  agentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentAvatarText: {
    fontFamily: Fonts.tajawal.bold,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    ...Shadow.card,
  },
  bubbleText: {
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.black,
    textAlign: 'right',
  },
  bubbleTextUser: { color: Colors.white },
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
    color: Colors.gray500,
  },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.7)' },
  inputBar: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.tajawal.regular,
    fontSize: FontSize.base,
    color: Colors.black,
    backgroundColor: Colors.gray100,
    borderRadius: Radius.xxl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    textAlign: 'right',
    maxHeight: 100,
  },
  attachBtn: { padding: Spacing.sm },
  attachIcon: { fontSize: 20 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.gray300 },
  sendIcon: { fontSize: 16 },
});
