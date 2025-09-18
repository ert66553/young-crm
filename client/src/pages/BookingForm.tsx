import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { serviceService, bookingService } from '../services/authService';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, ArrowLeft, CheckCircle } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

const BookingForm: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  useEffect(() => {
    if (selectedDate && serviceId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, serviceId]);

  const fetchService = async () => {
    try {
      setIsLoading(true);
      const response = await serviceService.getService(serviceId!);
      if (response.success) {
        setService(response.data.service);
      }
    } catch (error) {
      console.error('取得服務詳情錯誤:', error);
      toast.error('取得服務詳情失敗');
      navigate('/services');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await bookingService.getAvailableSlots(serviceId!, selectedDate);
      if (response.success) {
        setAvailableSlots(response.data.availableSlots);
      }
    } catch (error) {
      console.error('取得可預約時段錯誤:', error);
      toast.error('取得可預約時段失敗');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error('請選擇預約日期和時間');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await bookingService.createBooking({
        serviceId: serviceId!,
        date: selectedDate,
        startTime: selectedTime,
        notes: notes.trim() || undefined
      });

      if (response.success) {
        toast.success('預約成功！');
        navigate('/bookings');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '預約失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 最多可預約30天後
    return maxDate.toISOString().split('T')[0];
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h1>
          <p className="text-gray-600">您需要登入才能預約服務</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">服務不存在</h1>
          <p className="text-gray-600">找不到您要預約的服務</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">預約服務</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 服務資訊 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">服務資訊</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
              <p className="text-sm text-gray-500">{service.category}</p>
            </div>
            
            {service.description && (
              <p className="text-gray-600">{service.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                時長：{service.duration} 分鐘
              </div>
              <div className="text-lg font-semibold text-blue-600">
                NT$ {service.price.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 預約表單 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">預約資訊</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 選擇日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                預約日期 *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 選擇時間 */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  預約時間 *
                </label>
                {availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>該日期暫無可預約時段</p>
                    <p className="text-sm">請選擇其他日期</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedTime(slot.startTime)}
                        className={`p-3 text-sm border rounded-lg transition-colors ${
                          selectedTime === slot.startTime
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium">{slot.startTime}</div>
                        <div className="text-xs text-gray-500">
                          {slot.duration}分鐘
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 備註 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                備註
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="請輸入任何特殊需求或備註..."
              />
            </div>

            {/* 提交按鈕 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!selectedDate || !selectedTime || isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    預約中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    確認預約
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 預約須知 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">預約須知</h3>
        <div className="text-yellow-700 space-y-1 text-sm">
          <p>• 請提前至少2小時預約</p>
          <p>• 如需取消預約，請在預約時間前2小時內取消</p>
          <p>• 遲到超過15分鐘將視為取消預約</p>
          <p>• 預約成功後會收到確認通知</p>
          <p>• 如有任何問題，請聯繫客服</p>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
