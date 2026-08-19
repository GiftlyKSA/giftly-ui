import { OrderStatus, OrderSummary } from '../api/types';

export const orderTitle = (order: Pick<OrderSummary, 'description' | 'delivery_city'>): string =>
  order.description?.trim() || `Gift delivery to ${order.delivery_city}`;

export const formatOrderDate = (date: string, locale: string): string => {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

export const statusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    NEW: 'Finding a courier',
    ASSIGNED: 'Courier assigned',
    WAITING_PAYMENT: 'Waiting for payment',
    IN_PROGRESS: 'In progress',
    DELIVERED: 'Delivered',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    DISPUTED: 'Dispute open',
    REFUNDED: 'Refunded',
  };
  return labels[status];
};

export const isOrderActive = (status: OrderStatus): boolean =>
  ['NEW', 'ASSIGNED', 'WAITING_PAYMENT', 'IN_PROGRESS', 'DELIVERED', 'DISPUTED'].includes(status);

export const isOrderComplete = (status: OrderStatus): boolean =>
  ['COMPLETED', 'DELIVERED', 'REFUNDED'].includes(status);

export const isOrderCancelled = (status: OrderStatus): boolean => status === 'CANCELLED';

export const canCancelOrder = (status: OrderStatus): boolean =>
  ['NEW', 'ASSIGNED', 'WAITING_PAYMENT'].includes(status);
