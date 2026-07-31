import { apiRequest } from './client';
import {
  ChatMessage,
  ConversationSummary,
  CreateOrderRequest,
  Invoice,
  OrderDetail,
  OrderStatus,
  OrderSummary,
  Page,
  UserProfile,
  Wallet,
} from './types';

const withQuery = (path: string, params: Record<string, string | number | undefined>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
};

export const getMe = (signal?: AbortSignal): Promise<UserProfile> =>
  apiRequest('/api/users/me', { signal });

export const updateMe = (
  body: { full_name?: string | null; email?: string | null; dob?: string | null },
): Promise<UserProfile> => apiRequest('/api/users/me', { method: 'PATCH', body });

export const getWallet = (signal?: AbortSignal): Promise<Wallet> =>
  apiRequest('/api/wallets/me', { signal });

export const listOrders = (
  options: { cursor?: string; limit?: number; status?: OrderStatus } = {},
  signal?: AbortSignal,
): Promise<Page<OrderSummary>> =>
  apiRequest(withQuery('/api/orders', options), { signal });

export const listAvailableOrders = (
  options: { cursor?: string; limit?: number } = {},
  signal?: AbortSignal,
): Promise<Page<OrderSummary>> =>
  apiRequest(withQuery('/api/orders/available', options), { signal });

export const createOrder = (body: CreateOrderRequest): Promise<OrderDetail> =>
  apiRequest('/api/orders', { method: 'POST', body });

export const getOrder = (orderId: string, signal?: AbortSignal): Promise<OrderDetail> =>
  apiRequest(`/api/orders/${encodeURIComponent(orderId)}`, { signal });

export const acceptOrder = (orderId: string): Promise<OrderDetail> =>
  apiRequest(`/api/orders/${encodeURIComponent(orderId)}/accept`, { method: 'POST' });

export const cancelOrder = (orderId: string, reason?: string): Promise<OrderDetail> =>
  apiRequest(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
    body: { reason: reason || null },
  });

export const approveOrder = (orderId: string): Promise<OrderDetail> =>
  apiRequest(`/api/orders/${encodeURIComponent(orderId)}/approve`, { method: 'POST' });

export const getOrderInvoice = (orderId: string, signal?: AbortSignal): Promise<Invoice> =>
  apiRequest(`/api/orders/${encodeURIComponent(orderId)}/invoice`, { signal });

export const listConversations = (
  options: { cursor?: string; limit?: number } = {},
  signal?: AbortSignal,
): Promise<Page<ConversationSummary>> =>
  apiRequest(withQuery('/api/conversations', options), { signal });

export const listMessages = (
  conversationId: string,
  options: { cursor?: string; limit?: number } = {},
  signal?: AbortSignal,
): Promise<Page<ChatMessage>> =>
  apiRequest(
    withQuery(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, options),
    { signal },
  );

export const sendMessage = (conversationId: string, text: string): Promise<ChatMessage> =>
  apiRequest(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    body: { text },
  });

export const markConversationRead = (conversationId: string): Promise<void> =>
  apiRequest(`/api/conversations/${encodeURIComponent(conversationId)}/read`, { method: 'POST' });
