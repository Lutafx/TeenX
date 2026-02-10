import React from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              TeenX Hub
            </h3>
            <p className="text-gray-400">
              Платформа для легальной работы подростков 14-18 лет в Казахстане
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <div className="space-y-3">
              <a
                href="https://t.me/lutafx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Send size={18} />
                <span>@lutafx</span>
              </a>
              <a
                href="mailto:querty482901@gmail.com"
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Mail size={18} />
                <span>querty482901@gmail.com</span>
              </a>
              <a
                href="https://wa.me/77760752463"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <MessageCircle size={18} />
                <span>+7 776 075 24 63</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Полезные ссылки</h4>
            <div className="space-y-3">
              <a href="/documents" className="block text-gray-400 hover:text-blue-400 transition-colors">
                Документы для оформления
              </a>
              <a href="/vacancies" className="block text-gray-400 hover:text-blue-400 transition-colors">
                Все вакансии
              </a>
              <a
                href="https://t.me/teenx_hub"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-blue-400 transition-colors"
              >
                Telegram канал
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 TeenX Hub. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
