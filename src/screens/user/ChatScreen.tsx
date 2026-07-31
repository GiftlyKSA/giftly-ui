import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, getWebSocketUrl } from '../../api/client';
import { listConversations, listMessages, markConversationRead, sendMessage } from '../../api/giftly';
import { ChatMessage, Page } from '../../api/types';
import { useAuth } from '../../auth/AuthProvider';
import { ThemeColors, Spacing, Radius, Shadow, Fonts, FontSize } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useTopInset } from '../../hooks/useTopInset';

interface ChatScreenProps {
  onBack: () => void;
  conversationId?: string;
  orderId?: string;
}

const isMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ChatMessage>;
  return typeof candidate.id === 'string'
    && typeof candidate.conversation_id === 'string'
    && typeof candidate.sender_id === 'string'
    && typeof candidate.content === 'string'
    && typeof candidate.created_at === 'string';
};

const displayTime = (timestamp: string, locale: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', { hour: '2-digit', minute: '2-digit' }).format(date);
};

export const ChatScreen: React.FC<ChatScreenProps> = ({ onBack, conversationId, orderId }) => {
  const { C } = useTheme();
  const { t, lang } = useLanguage();
  const { accessToken, profile } = useAuth();
  const isRTL = lang === 'ar';
  const styles = useMemo(() => createStyles(C, isRTL), [C, isRTL]);
  const topPadding = useTopInset();
  const queryClient = useQueryClient();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(conversationId);
  const [input, setInput] = useState('');
  const [composerError, setComposerError] = useState('');
  const mounted = useRef(true);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: ({ signal }) => listConversations({ limit: 50 }, signal),
  });

  useEffect(() => {
    if (conversationId) {
      setSelectedConversationId(conversationId);
      return;
    }
    if (!orderId || selectedConversationId || !conversationsQuery.data) return;
    const related = conversationsQuery.data.items.find(conversation => conversation.order_id === orderId);
    if (related) setSelectedConversationId(related.conversation_id);
  }, [conversationId, conversationsQuery.data, orderId, selectedConversationId]);

  const messagesQuery = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: ({ signal }) => listMessages(selectedConversationId!, { limit: 50 }, signal),
    enabled: Boolean(selectedConversationId),
  });

  useEffect(() => {
    if (!selectedConversationId || !messagesQuery.data) return;
    void markConversationRead(selectedConversationId).then(() => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }).catch(() => {
      // Read receipts are best-effort and should never block the thread.
    });
  }, [messagesQuery.data, queryClient, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId || !accessToken) return;
    let disposed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempts = 0;

    const connect = () => {
      if (disposed) return;
      socket = new WebSocket(getWebSocketUrl(`/api/ws/conversations/${encodeURIComponent(selectedConversationId)}?token=${encodeURIComponent(accessToken)}`));
      socket.onopen = () => {
        reconnectAttempts = 0;
      };
      socket.onmessage = event => {
        if (disposed || typeof event.data !== 'string') return;
        try {
          const incoming = JSON.parse(event.data) as unknown;
          if (!isMessage(incoming)) return;
          queryClient.setQueryData<Page<ChatMessage>>(['messages', selectedConversationId], current => {
            if (!current || current.items.some(message => message.id === incoming.id)) return current;
            return { ...current, items: [incoming, ...current.items] };
          });
          void queryClient.invalidateQueries({ queryKey: ['conversations'] });
        } catch {
          // Ignore malformed network frames. The REST message history remains authoritative.
        }
      };
      socket.onclose = event => {
        if (disposed || event.code === 4403) return;
        if (event.code === 4401) {
          // A REST refetch can refresh the rotating token. The effect reconnects when it changes.
          void queryClient.refetchQueries({ queryKey: ['messages', selectedConversationId] });
          return;
        }
        reconnectAttempts += 1;
        const delay = Math.min(1_000 * 2 ** reconnectAttempts, 30_000);
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();
    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [accessToken, queryClient, selectedConversationId]);

  const sendMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => sendMessage(id, text),
    onMutate: async ({ id, text }) => {
      const temporaryId = `pending-${Date.now()}`;
      const key = ['messages', id] as const;
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Page<ChatMessage>>(key);
      const optimistic: ChatMessage = {
        id: temporaryId,
        conversation_id: id,
        sender_id: profile?.id || 'me',
        message_type: 'TEXT',
        content: text,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Page<ChatMessage>>(key, current => ({
        items: [optimistic, ...(current?.items ?? [])],
        next_cursor: current?.next_cursor ?? null,
      }));
      return { key, previous, temporaryId };
    },
    onSuccess: (message, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData<Page<ChatMessage>>(context.key, current => {
        if (!current) return { items: [message], next_cursor: null };
        const withoutTemporary = current.items.filter(item => item.id !== context.temporaryId && item.id !== message.id);
        return { ...current, items: [message, ...withoutTemporary] };
      });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
      if (mounted.current) setComposerError(getErrorMessage(error));
    },
  });

  const send = () => {
    const text = input.trim();
    if (!text || !selectedConversationId || sendMutation.isPending) return;
    setComposerError('');
    setInput('');
    sendMutation.mutate({ id: selectedConversationId, text });
  };

  const messages = messagesQuery.data ? [...messagesQuery.data.items].reverse() : [];
  const selectedConversation = conversationsQuery.data?.items.find(item => item.conversation_id === selectedConversationId);

  if (!selectedConversationId) {
    return (
      <View style={styles.root}>
        <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backIcon}>{t.back_arrow}</Text></TouchableOpacity>
          <Text style={styles.headerName}>Messages</Text>
          <View style={styles.headerAvatar}><Text style={styles.headerAvatarText}>G</Text></View>
        </View>
        {conversationsQuery.isLoading ? <View style={styles.center}><ActivityIndicator color={C.primary} /></View> : null}
        {conversationsQuery.isError ? <View style={styles.center}><Text style={styles.error}>{getErrorMessage(conversationsQuery.error)}</Text><TouchableOpacity onPress={() => void conversationsQuery.refetch()}><Text style={styles.retry}>Retry</Text></TouchableOpacity></View> : null}
        {conversationsQuery.data ? (
          <FlatList
            data={conversationsQuery.data.items}
            keyExtractor={item => item.conversation_id}
            contentContainerStyle={styles.inboxList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.conversationCard} onPress={() => setSelectedConversationId(item.conversation_id)}>
                <View style={styles.conversationAvatar}><Text style={styles.headerAvatarText}>G</Text></View>
                <View style={styles.conversationContent}>
                  <Text style={styles.conversationTitle}>Order {item.order_id}</Text>
                  <Text style={styles.conversationPreview} numberOfLines={1}>{item.last_message_preview || 'No messages yet'}</Text>
                </View>
                {item.unread_count > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{item.unread_count}</Text></View> : null}
              </TouchableOpacity>
            )}
            ListEmptyComponent={<View style={styles.center}><Text style={styles.empty}>No conversations yet.</Text></View>}
          />
        ) : null}
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, Shadow.header, { paddingTop: topPadding + Spacing.sm }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backIcon}>{t.back_arrow}</Text></TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerName}>Order conversation</Text>
            <Text style={styles.headerSub}>{selectedConversation?.order_id || orderId || ''}</Text>
          </View>
          <View style={styles.headerAvatar}><Text style={styles.headerAvatarText}>G</Text></View>
        </View>
        <View style={styles.orderBanner}><Text style={styles.orderBannerText}>Messages are private to this order’s participants.</Text></View>
        {messagesQuery.isLoading ? <View style={styles.center}><ActivityIndicator color={C.primary} /></View> : null}
        {messagesQuery.isError ? <View style={styles.center}><Text style={styles.error}>{getErrorMessage(messagesQuery.error)}</Text><TouchableOpacity onPress={() => void messagesQuery.refetch()}><Text style={styles.retry}>Retry</Text></TouchableOpacity></View> : null}
        {messagesQuery.data ? (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <MessageBubble message={item} isMine={item.sender_id === profile?.id} C={C} styles={styles} locale={lang} />}
            contentContainerStyle={styles.messagesList}
            style={styles.messagesFlex}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        ) : null}
        {composerError ? <Text style={styles.composerError}>{composerError}</Text> : null}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t.chat_ph}
            placeholderTextColor={C.gray500}
            textAlign={isRTL ? 'right' : 'left'}
            multiline
            maxLength={4000}
            editable={!sendMutation.isPending}
          />
          <TouchableOpacity style={[styles.sendBtn, (!input.trim() || sendMutation.isPending) && styles.sendBtnDisabled]} onPress={send} disabled={!input.trim() || sendMutation.isPending}>
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const MessageBubble: React.FC<{ message: ChatMessage; isMine: boolean; C: ThemeColors; styles: ReturnType<typeof createStyles>; locale: string }> = ({ message, isMine, styles, locale }) => (
  <View style={[styles.bubbleWrap, isMine ? styles.bubbleWrapMine : styles.bubbleWrapOther]}>
    <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
      <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{message.content}</Text>
      <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>{displayTime(message.created_at, locale)}</Text>
    </View>
  </View>
);

const createStyles = (C: ThemeColors, isRTL: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.gray100 },
  header: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', backgroundColor: C.white, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.base, gap: Spacing.sm },
  backBtn: { padding: Spacing.sm }, backIcon: { fontSize: 20, color: C.primary }, headerCenter: { flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }, headerName: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.md, color: C.black }, headerSub: { fontFamily: Fonts.inter.regular, fontSize: FontSize.xs, color: C.textSecondary, marginTop: 2 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }, headerAvatarText: { fontFamily: Fonts.inter.bold, fontSize: FontSize.md, color: C.primary },
  orderBanner: { backgroundColor: C.primaryLighter, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xs }, orderBannerText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.primary, textAlign: isRTL ? 'right' : 'left' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.sm }, error: { fontFamily: Fonts.tajawal.regular, color: C.error, textAlign: 'center' }, retry: { fontFamily: Fonts.tajawal.bold, color: C.primary }, empty: { fontFamily: Fonts.tajawal.regular, color: C.textSecondary },
  inboxList: { padding: Spacing.base, flexGrow: 1 }, conversationCard: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.sm, gap: Spacing.sm, ...Shadow.card }, conversationAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.primaryLighter, alignItems: 'center', justifyContent: 'center' }, conversationContent: { flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }, conversationTitle: { fontFamily: Fonts.tajawal.bold, fontSize: FontSize.sm, color: C.black }, conversationPreview: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.sm, color: C.textSecondary, marginTop: 2 }, badge: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }, badgeText: { fontFamily: Fonts.inter.bold, fontSize: 11, color: '#FFFFFF' },
  messagesFlex: { flex: 1 }, messagesList: { padding: Spacing.base, gap: Spacing.sm, flexGrow: 1 }, bubbleWrap: { marginBottom: Spacing.sm }, bubbleWrapMine: { alignItems: isRTL ? 'flex-start' : 'flex-end' }, bubbleWrapOther: { alignItems: isRTL ? 'flex-end' : 'flex-start' }, bubble: { maxWidth: '80%', borderRadius: Radius.lg, padding: Spacing.md }, bubbleMine: { backgroundColor: C.primary }, bubbleOther: { backgroundColor: C.white, ...Shadow.card }, bubbleText: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.black, textAlign: isRTL ? 'right' : 'left' }, bubbleTextMine: { color: '#FFFFFF' }, bubbleTime: { fontFamily: Fonts.inter.regular, fontSize: 10, color: C.gray500, marginTop: 4, textAlign: 'right' }, bubbleTimeMine: { color: 'rgba(255,255,255,0.72)' },
  composerError: { fontFamily: Fonts.tajawal.regular, fontSize: FontSize.xs, color: C.error, backgroundColor: C.white, paddingHorizontal: Spacing.base, paddingTop: Spacing.xs, textAlign: isRTL ? 'right' : 'left' }, inputBar: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'flex-end', backgroundColor: C.white, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: C.gray200 }, input: { flex: 1, fontFamily: Fonts.tajawal.regular, fontSize: FontSize.base, color: C.black, backgroundColor: C.gray100, borderRadius: Radius.xxl, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, maxHeight: 100, textAlign: isRTL ? 'right' : 'left' }, sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }, sendBtnDisabled: { backgroundColor: C.gray300 }, sendIcon: { fontSize: 18, color: '#FFFFFF' },
});
