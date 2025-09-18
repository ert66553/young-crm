// 使用者相關類型
export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthday?: string;
  address?: string;
  memberLevel: 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP';
  points: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
}

// 服務相關類型
export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 預約相關類型
export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  staffId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  staff?: Staff;
  user?: User;
}

// 員工相關類型
export interface Staff {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  specialties: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 付款相關類型
export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'LINE_PAY' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  booking?: Booking;
  user?: User;
}

// 積分記錄類型
export interface PointsHistory {
  id: string;
  userId: string;
  points: number;
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED';
  description?: string;
  bookingId?: string;
  createdAt: string;
  user?: User;
}

// 通知類型
export interface Notification {
  id: string;
  userId?: string;
  title: string;
  content: string;
  type: 'BOOKING_CONFIRMATION' | 'BOOKING_REMINDER' | 'BOOKING_CANCELLATION' | 'POINTS_EARNED' | 'PROMOTION' | 'SYSTEM';
  isRead: boolean;
  sentAt?: string;
  createdAt: string;
}

// API 回應類型
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

// 分頁類型
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// 分頁回應類型
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// 表單類型
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  email?: string;
  gender?: string;
  birthday?: string;
}

export interface ProfileForm {
  name?: string;
  phone?: string;
  email?: string;
  gender?: string;
  birthday?: string;
  address?: string;
}

export interface BookingForm {
  serviceId: string;
  date: string;
  startTime: string;
  staffId?: string;
  notes?: string;
}

// 統計類型
export interface UserStats {
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  currentPoints: number;
  memberSince: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  pendingBookings: number;
  recentBookings: Booking[];
}

// 時間段類型
export interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

// 會員等級類型
export type MemberLevel = 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP';

// 預約狀態類型
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

// 付款方式類型
export type PaymentMethod = 'CASH' | 'CARD' | 'LINE_PAY' | 'TRANSFER';

// 付款狀態類型
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// 積分類型
export type PointsType = 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED';

// 通知類型
export type NotificationType = 'BOOKING_CONFIRMATION' | 'BOOKING_REMINDER' | 'BOOKING_CANCELLATION' | 'POINTS_EARNED' | 'PROMOTION' | 'SYSTEM';
