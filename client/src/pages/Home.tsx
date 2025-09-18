import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Star, 
  Users, 
  Award,
  ArrowRight,
  Clock,
  Shield
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: '線上預約',
      description: '24小時線上預約系統，隨時隨地預約您想要的服務時段'
    },
    {
      icon: Star,
      title: '專業服務',
      description: '專業按摩師提供高品質的運動按摩服務'
    },
    {
      icon: Users,
      title: '會員制度',
      description: '完善的會員等級制度，享受更多優惠和專屬服務'
    },
    {
      icon: Award,
      title: '積分回饋',
      description: '消費累積積分，可兌換折扣或免費服務'
    }
  ];

  const services = [
    {
      name: '深層組織按摩',
      price: 1200,
      duration: 60,
      description: '針對深層肌肉組織進行按摩，有效緩解肌肉緊張'
    },
    {
      name: '運動後恢復按摩',
      price: 1000,
      duration: 45,
      description: '專為運動後設計的恢復按摩，加速肌肉修復'
    },
    {
      name: '全身放鬆按摩',
      price: 1500,
      duration: 90,
      description: '全身性的放鬆按摩，讓您完全放鬆身心'
    }
  ];

  return (
    <div className="space-y-12">
      {/* 英雄區塊 */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              揚翼運動按摩
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              專業的運動按摩服務，讓您重獲活力
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    to="/bookings"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    我的預約
                  </Link>
                  <Link
                    to="/services"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    預約服務
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    立即註冊
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    會員登入
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 功能特色 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">為什麼選擇我們</h2>
            <p className="text-lg text-gray-600">我們提供最專業的運動按摩服務</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 熱門服務 */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">熱門服務</h2>
            <p className="text-lg text-gray-600">選擇適合您的按摩服務</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration} 分鐘
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      NT$ {service.price}
                    </div>
                  </div>
                  {user ? (
                    <Link
                      to={`/booking/${index + 1}`}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      立即預約
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      登入後預約
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 會員等級 */}
      {user && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">會員等級</h2>
              <p className="text-lg text-gray-600">您的當前等級：{user.memberLevel}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                  <p className="text-gray-600">會員等級：{user.memberLevel}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{user.points}</div>
                  <div className="text-sm text-gray-500">積分</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">總預約次數</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">NT$ 0</div>
                  <div className="text-sm text-gray-500">總消費金額</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">本月預約</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA 區塊 */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">準備開始您的按摩之旅嗎？</h2>
          <p className="text-xl mb-8 text-blue-100">
            立即預約，享受專業的運動按摩服務
          </p>
          <Link
            to={user ? "/services" : "/register"}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            {user ? "立即預約" : "立即註冊"}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
