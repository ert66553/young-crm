import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { serviceService } from '../services/authService';
import { Clock, Star, Filter } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

const Services: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await serviceService.getServices(selectedCategory || undefined);
      if (response.success) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error('取得服務列表錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await serviceService.getCategories();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('取得服務分類錯誤:', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

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
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">服務項目</h1>
        <p className="text-lg text-gray-600">選擇適合您的專業按摩服務</p>
      </div>

      {/* 會員資訊 */}
      {user && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">歡迎回來，{user.name}！</h2>
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
      )}

      {/* 分類篩選 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">服務分類：</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 服務列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {service.category}
                </span>
              </div>
              
              {service.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
              )}
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {service.duration} 分鐘
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  NT$ {service.price.toLocaleString()}
                </div>
              </div>

              {/* 會員優惠顯示 */}
              {user && user.memberLevel !== 'BASIC' && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center text-green-800 text-sm">
                    <Star className="h-4 w-4 mr-1" />
                    <span className="font-medium">
                      {user.memberLevel === 'VIP' ? 'VIP專屬' : '會員專屬'}優惠
                    </span>
                  </div>
                  <div className="text-green-700 text-sm mt-1">
                    {user.memberLevel === 'VIP' ? '9折優惠' : 
                     user.memberLevel === 'PLATINUM' ? '95折優惠' : 
                     user.memberLevel === 'GOLD' ? '98折優惠' : '無優惠'}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {user ? (
                  <Link
                    to={`/booking/${service.id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    立即預約
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      登入後預約
                    </Link>
                    <Link
                      to="/register"
                      className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
                    >
                      立即註冊
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空狀態 */}
      {services.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Clock className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暫無服務項目</h3>
          <p className="text-gray-500">目前沒有可用的服務項目，請稍後再試</p>
        </div>
      )}

      {/* 積分說明 */}
      {user && (
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
      )}
    </div>
  );
};

export default Services;
