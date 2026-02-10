import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, FileText, HelpCircle, Menu, X } from 'lucide-react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TeenX Hub
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/vacancies"
              className={`flex items-center space-x-2 font-medium transition-colors ${
                isActive('/vacancies') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Briefcase size={20} />
              <span>Вакансии</span>
            </Link>
            <Link
              to="/documents"
              className={`flex items-center space-x-2 font-medium transition-colors ${
                isActive('/documents') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <FileText size={20} />
              <span>Документы</span>
            </Link>
            <a
              href="https://t.me/lutafx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <HelpCircle size={20} />
              <span>Поддержка</span>
            </a>
            <Link to="/add-vacancy" className="btn-primary">
              Добавить вакансию
            </Link>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              to="/vacancies"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <Briefcase size={20} />
              <span>Вакансии</span>
            </Link>
            <Link
              to="/documents"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <FileText size={20} />
              <span>Документы</span>
            </Link>
            <a
              href="https://t.me/lutafx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
            >
              <HelpCircle size={20} />
              <span>Поддержка</span>
            </a>
            <Link
              to="/add-vacancy"
              className="btn-primary block text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Добавить вакансию
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
