export type UserRole = 'CUSTOMER' | 'COURIER';
export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'BANNED';

export type OrderStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'WAITING_PAYMENT'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    request_id?: string;
  };
}

export interface Page<T> {
  items: T[];
  next_cursor: string | null;
}

export interface SendOtpResponse {
  expires_in: number;
  dev_otp: string | null;
}

export interface VerifyOtpResponse {
  is_new_user: boolean;
  role: UserRole | null;
  access_token: string | null;
  refresh_token: string | null;
  registration_token: string | null;
}

export interface SessionResponse {
  access_token: string;
  refresh_token: string;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  full_name: string | null;
  email: string | null;
  rating: string;
  rating_count: number;
}

export interface Wallet {
  balance: string;
  held_balance: string;
  available: string;
  currency: string;
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  delivery_city: string;
  delivery_date: string;
  description: string | null;
  created_at: string;
}

export interface OrderDetail extends OrderSummary {
  customer_id: string;
  courier_id: string | null;
  latitude: number | null;
  longitude: number | null;
  total_amount: string;
  assigned_at: string | null;
}

export interface CreateOrderRequest {
  description: string | null;
  delivery_city: string;
  latitude: number;
  longitude: number;
  delivery_date: string;
  request_media_keys?: string[];
}

export interface Invoice {
  id: string;
  order_id: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  currency: string;
  total_amount: string;
}

export interface ConversationSummary {
  conversation_id: string;
  order_id: string;
  other_user_id: string;
  last_message_preview: string | null;
  unread_count: number;
  last_message_timestamp: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 'TEXT';
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface RegistrationForm {
  role: UserRole;
  full_name: string | null;
  email: string | null;
  dob: string | null;
  city?: string | null;
  national_id?: string | null;
  passport_id?: string | null;
}
