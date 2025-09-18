import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/authService';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Booking {
  id: string;
  service: {
    name: string;
    price: number;
  };
  staff?: {
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, selectedStatus]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await bookingService.getMyBookings(currentPage, 10, selectedStatus || undefined);
      if (response.success) {
        setBookings(response.data.bookings);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('取得預約列表錯誤:', error);
      toast.error('取得預約列表失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('確定要取消這個預約嗎？')) {
      return;
    }

    try {
      const response = await bookingService.cancelBooking(bookingId);
      if (response.success) {
        toast.success('預約已取消');
        fetchBookings();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '取消預約失敗');
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
        return <AlertCircle className="h-4 w-4" />;
      case 'CONFIRMED':
      case 'IN_PROGRESS':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
      case 'NO_SHOW':
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const canCancel = (status: string, date: string, startTime: string) => {
    if (status !== 'PENDING' && status !== 'CONFIRMED') {
      return false;
    }

    const now = new Date();
    const bookingDateTime = new Date(date);
    const [hours, minutes] = startTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilBooking >= 2;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h1>
          <p className="text-gray-600">您需要登入才能查看預約記錄</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">我的預約</h1>
        <Link
          to="/services"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          預約新服務
        </Link>
      </div>

      {/* 狀態篩選 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStatus === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getStatusText(status)}
            </button>
          ))}
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
          <p className="text-gray-500 mb-6">您還沒有任何預約記錄</p>
          <Link
            to="/services"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            立即預約
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{booking.service.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1">{getStatusText(booking.status)}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(booking.date).toLocaleDateString('zh-TW')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {booking.startTime} - {booking.endTime}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {booking.staff?.name || '未指定'}
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">備註：</span>
                        {booking.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 text-sm text-gray-500">
                    預約時間：{new Date(booking.createdAt).toLocaleString('zh-TW')}
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      NT$ {booking.service.price.toLocaleString()}
                    </div>
                  </div>
                  
                  {canCancel(booking.status, booking.date, booking.startTime) && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      取消預約
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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

export default Bookings;
