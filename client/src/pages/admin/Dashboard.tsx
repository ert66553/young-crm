import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/authService';
import { Users, Calendar, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  pendingBookings: number;
  recentBookings: Array<{
    id: string;
    user: { name: string; phone: string };
    service: { name: string };
    date: string;
    startTime: string;
    status: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getDashboard();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('取得儀表板資料錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'text-yellow-600',
      CONFIRMED: 'text-blue-600',
      IN_PROGRESS: 'text-purple-600',
      COMPLETED: 'text-green-600',
      CANCELLED: 'text-red-600',
      NO_SHOW: 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      PENDING: '待確認',
      CONFIRMED: '已確認',
      IN_PROGRESS: '進行中',
      COMPLETED: '已完成',
      CANCELLED: '已取消',
      NO_SHOW: '未到場'
    };
    return texts[status] || status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">管理儀表板</h1>
        <p className="text-gray-600">揚翼運動按摩管理後台</p>
      </div>

      {/* 統計卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總會員數</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總預約數</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總營收</p>
                <p className="text-2xl font-semibold text-gray-900">NT$ {stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日預約</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayBookings}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 待處理預約 */}
      {stats && stats.pendingBookings > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-yellow-800">
              有 {stats.pendingBookings} 個預約等待確認
            </h3>
          </div>
          <p className="text-yellow-700 mt-1">請前往預約管理頁面處理</p>
        </div>
      )}

      {/* 最近預約 */}
      {stats && stats.recentBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">最近預約</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentBookings.map((booking) => (
              <div key={booking.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">{booking.user.name}</h4>
                      <span className={`text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{booking.service.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.date).toLocaleDateString('zh-TW')} {booking.startTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{booking.user.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">會員管理</h3>
              <p className="text-sm text-gray-600">查看和管理會員資料</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">預約管理</h3>
              <p className="text-sm text-gray-600">處理預約和時段安排</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">服務管理</h3>
              <p className="text-sm text-gray-600">管理服務項目和價格</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
