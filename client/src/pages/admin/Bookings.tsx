import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/authService';
import { Search, Filter, Calendar, Clock, User, CheckCircle, X } from 'lucide-react';

interface Booking {
  id: string;
  user: { name: string; phone: string };
  service: { name: string; price: number };
  staff?: { name: string };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, selectedStatus, selectedDate]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getBookings(
        currentPage,
        10,
        selectedStatus || undefined,
        selectedDate || undefined
      );
      if (response.success) {
        setBookings(response.data.bookings);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('取得預約列表錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await adminService.updateBookingStatus(bookingId, newStatus);
      if (response.success) {
        fetchBookings();
      }
    } catch (error) {
      console.error('更新預約狀態錯誤:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'CONFIRMED':
      case 'IN_PROGRESS':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
      case 'NO_SHOW':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">預約管理</h1>
        <p className="text-gray-600">查看和管理所有預約記錄</p>
      </div>

      {/* 篩選器 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有狀態</option>
              <option value="PENDING">待確認</option>
              <option value="CONFIRMED">已確認</option>
              <option value="IN_PROGRESS">進行中</option>
              <option value="COMPLETED">已完成</option>
              <option value="CANCELLED">已取消</option>
              <option value="NO_SHOW">未到場</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => {
              setSelectedStatus('');
              setSelectedDate('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            清除篩選
          </button>
        </div>
      </div>

      {/* 預約列表 */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暫無預約記錄</h3>
          <p className="text-gray-500">目前沒有符合條件的預約記錄</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    預約資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客戶資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    服務時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    服務人員
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.service.name}</div>
                        <div className="text-sm text-gray-500">NT$ {booking.service.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">ID: {booking.id.slice(-8)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                        <div className="text-sm text-gray-500">{booking.user.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(booking.date).toLocaleDateString('zh-TW')}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.staff?.name || '未指定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{getStatusText(booking.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {booking.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                              className="text-green-600 hover:text-green-900"
                            >
                              確認
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                              className="text-red-600 hover:text-red-900"
                            >
                              取消
                            </button>
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'IN_PROGRESS')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              開始
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                              className="text-red-600 hover:text-red-900"
                            >
                              取消
                            </button>
                          </>
                        )}
                        {booking.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                            className="text-green-600 hover:text-green-900"
                          >
                            完成
                          </button>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'NO_SHOW')}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            未到場
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一頁
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm border rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
