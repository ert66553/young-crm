import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：添加認證token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器：處理認證錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // 註冊
  register: async (userData: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    gender?: string;
    birthday?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // LINE登入
  lineLogin: async (lineData: {
    lineUserId: string;
    displayName: string;
    pictureUrl?: string;
    email?: string;
  }) => {
    const response = await api.post('/auth/line-login', lineData);
    return response.data;
  },

  // 取得使用者資料
  getMe: async (token: string) => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.user;
  },

  // 更新使用者資料
  updateProfile: async (profileData: {
    name?: string;
    phone?: string;
    email?: string;
    gender?: string;
    birthday?: string;
    address?: string;
  }) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  }
};

export const bookingService = {
  // 取得可預約時段
  getAvailableSlots: async (serviceId: string, date: string) => {
    const response = await api.get(`/bookings/available-slots/${serviceId}?date=${date}`);
    return response.data;
  },

  // 建立預約
  createBooking: async (bookingData: {
    serviceId: string;
    date: string;
    startTime: string;
    staffId?: string;
    notes?: string;
  }) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // 取得我的預約
  getMyBookings: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    
    const response = await api.get(`/bookings/my-bookings?${params}`);
    return response.data;
  },

  // 取得預約詳情
  getBooking: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // 取消預約
  cancelBooking: async (id: string) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  }
};

export const serviceService = {
  // 取得所有服務
  getServices: async (category?: string) => {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`/services${params}`);
    return response.data;
  },

  // 取得服務詳情
  getService: async (id: string) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  // 取得服務分類
  getCategories: async () => {
    const response = await api.get('/services/categories/list');
    return response.data;
  }
};

export const userService = {
  // 取得積分記錄
  getPointsHistory: async (page = 1, limit = 10, type?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (type) params.append('type', type);
    
    const response = await api.get(`/users/points-history?${params}`);
    return response.data;
  },

  // 取得消費記錄
  getPaymentHistory: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await api.get(`/users/payment-history?${params}`);
    return response.data;
  },

  // 取得會員統計
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};

export const adminService = {
  // 取得儀表板統計
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // 取得會員列表
  getUsers: async (page = 1, limit = 10, search?: string, memberLevel?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    if (memberLevel) params.append('memberLevel', memberLevel);
    
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  // 取得預約列表
  getBookings: async (page = 1, limit = 10, status?: string, date?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    if (date) params.append('date', date);
    
    const response = await api.get(`/admin/bookings?${params}`);
    return response.data;
  },

  // 更新預約狀態
  updateBookingStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/bookings/${id}/status`, { status });
    return response.data;
  },

  // 取得營收報表
  getRevenue: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/admin/revenue?${params}`);
    return response.data;
  }
};

export default api;
