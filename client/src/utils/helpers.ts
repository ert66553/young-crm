import { MemberLevel, BookingStatus } from '../types';

// 格式化日期
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 格式化日期時間
export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化時間
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

// 格式化金額
export const formatCurrency = (amount: number): string => {
  return `NT$ ${amount.toLocaleString()}`;
};

// 取得會員等級文字
export const getMemberLevelText = (level: MemberLevel): string => {
  const texts: Record<MemberLevel, string> = {
    BASIC: '一般會員',
    SILVER: '銀級會員',
    GOLD: '金級會員',
    PLATINUM: '白金會員',
    VIP: 'VIP會員'
  };
  return texts[level] || '一般會員';
};

// 取得會員等級顏色
export const getMemberLevelColor = (level: MemberLevel): string => {
  const colors: Record<MemberLevel, string> = {
    BASIC: 'bg-gray-100 text-gray-800',
    SILVER: 'bg-gray-200 text-gray-800',
    GOLD: 'bg-yellow-100 text-yellow-800',
    PLATINUM: 'bg-blue-100 text-blue-800',
    VIP: 'bg-purple-100 text-purple-800'
  };
  return colors[level] || colors.BASIC;
};

// 取得預約狀態文字
export const getBookingStatusText = (status: BookingStatus): string => {
  const texts: Record<BookingStatus, string> = {
    PENDING: '待確認',
    CONFIRMED: '已確認',
    IN_PROGRESS: '進行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    NO_SHOW: '未到場'
  };
  return texts[status] || status;
};

// 取得預約狀態顏色
export const getBookingStatusColor = (status: BookingStatus): string => {
  const colors: Record<BookingStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// 計算會員等級
export const calculateMemberLevel = (totalSpent: number): MemberLevel => {
  if (totalSpent >= 50000) return 'VIP';
  if (totalSpent >= 30000) return 'PLATINUM';
  if (totalSpent >= 20000) return 'GOLD';
  if (totalSpent >= 10000) return 'SILVER';
  return 'BASIC';
};

// 計算積分
export const calculatePoints = (amount: number): number => {
  return Math.floor(amount / 100);
};

// 計算會員折扣
export const calculateMemberDiscount = (level: MemberLevel): number => {
  const discounts: Record<MemberLevel, number> = {
    BASIC: 1,
    SILVER: 0.98,
    GOLD: 0.95,
    PLATINUM: 0.92,
    VIP: 0.9
  };
  return discounts[level] || 1;
};

// 驗證手機號碼
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^09\d{8}$/;
  return phoneRegex.test(phone);
};

// 驗證電子郵件
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 生成隨機字串
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 防抖函數
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 節流函數
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 深拷貝
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// 檢查是否為空值
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// 截斷文字
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// 取得檔案副檔名
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// 格式化檔案大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 檢查是否為圖片檔案
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// 取得相對時間
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) return '剛剛';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分鐘前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小時前`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} 天前`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} 個月前`;
  return `${Math.floor(diffInSeconds / 31536000)} 年前`;
};
