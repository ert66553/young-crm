import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService, userService } from '../services/authService';
import { toast } from 'react-hot-toast';
import { User, Phone, Mail, Calendar, MapPin, Award, Star, Edit3 } from 'lucide-react';

interface UserStats {
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  currentPoints: number;
  memberSince: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    gender: '',
    birthday: '',
    address: ''
  });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone || '',
        email: user.email || '',
        gender: '',
        birthday: '',
        address: ''
      });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await userService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('取得會員統計錯誤:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.updateProfile(formData);
      if (response.success) {
        updateUser(response.data.user);
        setIsEditing(false);
        toast.success('資料更新成功！');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '更新失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const getMemberLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      BASIC: 'bg-gray-100 text-gray-800',
      SILVER: 'bg-gray-200 text-gray-800',
      GOLD: 'bg-yellow-100 text-yellow-800',
      PLATINUM: 'bg-blue-100 text-blue-800',
      VIP: 'bg-purple-100 text-purple-800'
    };
    return colors[level] || colors.BASIC;
  };

  const getMemberLevelText = (level: string) => {
    const texts: { [key: string]: string } = {
      BASIC: '一般會員',
      SILVER: '銀級會員',
      GOLD: '金級會員',
      PLATINUM: '白金會員',
      VIP: 'VIP會員'
    };
    return texts[level] || '一般會員';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h1>
          <p className="text-gray-600">您需要登入才能查看個人資料</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">個人資料</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          {isEditing ? '取消編輯' : '編輯資料'}
        </button>
      </div>

      {/* 會員資訊卡片 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMemberLevelColor(user.memberLevel)}`}>
                {getMemberLevelText(user.memberLevel)}
              </span>
              <span className="text-blue-100">積分：{user.points}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{user.points}</div>
            <div className="text-blue-100">可用積分</div>
          </div>
        </div>
      </div>

      {/* 統計資訊 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalBookings}</div>
            <div className="text-gray-600">總預約次數</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.completedBookings}</div>
            <div className="text-gray-600">已完成預約</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">NT$ {stats.totalSpent.toLocaleString()}</div>
            <div className="text-gray-600">總消費金額</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.currentPoints}</div>
            <div className="text-gray-600">目前積分</div>
          </div>
        </div>
      )}

      {/* 個人資料表單 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">基本資料</h3>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名 *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  手機號碼 *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性別
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">請選擇</option>
                  <option value="MALE">男</option>
                  <option value="FEMALE">女</option>
                  <option value="OTHER">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生日
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地址
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="請輸入地址"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? '更新中...' : '更新資料'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">姓名</div>
                  <div className="font-medium">{user.name}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">手機號碼</div>
                  <div className="font-medium">{user.phone || '未設定'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">電子郵件</div>
                  <div className="font-medium">{user.email || '未設定'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">會員等級</div>
                  <div className="font-medium">{getMemberLevelText(user.memberLevel)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 積分說明 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">積分使用說明</h3>
        <div className="text-yellow-700 space-y-1">
          <p>• 每消費 NT$ 100 可獲得 1 積分</p>
          <p>• 100 積分可兌換 NT$ 10 折扣</p>
          <p>• 500 積分可兌換 NT$ 50 折扣</p>
          <p>• 1000 積分可兌換 NT$ 100 折扣</p>
          <p>• 積分有效期限為 1 年</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
