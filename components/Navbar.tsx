import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage, Language } from './LanguageContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    // Removed Affirmations/Soul Compass link as it is now the Home hero experience
    { name: t('nav.gita'), path: '/gita' },
    { name: t('nav.geet'), path: '/bhajans' },
    { name: t('nav.pilgrimage'), path: '/pilgrimage' },
    { name: t('nav.temples'), path: '/temples' },
    { name: t('nav.news'), path: '/news' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5 7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/></svg>
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-gray-800">Hare Krishna Connect</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="relative ml-2">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-gray-50 text-gray-700 border-none rounded-full text-sm py-2 pl-4 pr-8 focus:ring-2 focus:ring-orange-200 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="es">Español</option>
                  <option value="ru">Русский</option>
                  <option value="bn">বাংলা</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Button */}
          <div className="-mr-2 flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-white p-2 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full z-50">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium ${
                   isActive(link.path)
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
             <div className="px-4 pt-4 border-t border-gray-100">
                <label className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 block">Language</label>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="w-full bg-gray-50 text-gray-700 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="es">Español</option>
                  <option value="ru">Русский</option>
                  <option value="bn">বাংলা</option>
                </select>
             </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;