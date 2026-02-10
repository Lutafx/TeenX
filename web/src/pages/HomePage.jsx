import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Shield, FileCheck, TrendingUp, Users, Award } from 'lucide-react';

function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Твоя первая работа начинается здесь
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Легальная работа для подростков 14-18 лет в Казахстане
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/vacancies" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Найти работу
              </Link>
              <Link to="/add-vacancy" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-xl">
                Разместить вакансию
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Почему TeenX Hub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Легально</h3>
              <p className="text-gray-600">
                Все вакансии проверяются администрацией. Работа только по Трудовому кодексу РК
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Помощь с документами</h3>
              <p className="text-gray-600">
                Готовые шаблоны договоров и согласий для разных возрастных групп
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-pink-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Реальные зарплаты</h3>
              <p className="text-gray-600">
                Прозрачные условия оплаты. От 50,000₸ до 400,000₸ в месяц
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Для подростков</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Award className="text-blue-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Получай опыт</h3>
                    <p className="text-gray-600">Начни строить карьеру уже сейчас</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Briefcase className="text-blue-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Зарабатывай</h3>
                    <p className="text-gray-600">Финансовая независимость с 14 лет</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="text-blue-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Будь защищён</h3>
                    <p className="text-gray-600">Знай свои права и обязанности</p>
                  </div>
                </div>
              </div>
              <Link to="/vacancies" className="btn-primary mt-8 inline-block">
                Смотреть вакансии
              </Link>
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-6">Для работодателей</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Users className="text-purple-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Найдите сотрудников</h3>
                    <p className="text-gray-600">Активные и мотивированные подростки</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileCheck className="text-purple-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Легальное оформление</h3>
                    <p className="text-gray-600">Помощь с документами и договорами</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="text-purple-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Быстрый отклик</h3>
                    <p className="text-gray-600">Уведомления в Telegram для кандидатов</p>
                  </div>
                </div>
              </div>
              <Link to="/add-vacancy" className="btn-primary mt-8 inline-block">
                Добавить вакансию
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Готов начать?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Присоединяйся к сотням подростков, которые уже нашли работу через TeenX Hub
          </p>
          <Link to="/vacancies" className="btn-primary text-xl px-12 py-4">
            Найти работу сейчас
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
