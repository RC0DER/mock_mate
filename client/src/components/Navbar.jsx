import React from 'react';
import useDarkMode from '../hooks/useDarkMode';

const Navbar = ({ activeSection, onGetStarted }) => {
  const [colorTheme, setTheme] = useDarkMode();
  
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'career-preparation', label: 'Career Prep' },
    { id: 'learn-grow', label: 'Learn & Grow' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact-us', label: 'Contact Us' }
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed w-full top-0 bg-white/90 dark:bg-dark/90 backdrop-blur-md shadow-sm z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-2 cursor-pointer font-extrabold text-2xl text-dark dark:text-white tracking-tight"
        >
          Mock<span className="text-green-accent flex items-center gap-1">Mate <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`font-semibold transition-all ${
                activeSection === link.id
                  ? 'text-green-accent'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={onGetStarted} 
            className="bg-green-accent text-white px-6 py-2.5 rounded-full font-bold hover:bg-opacity-90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Get Started
          </button>

          <button
            onClick={() => setTheme(colorTheme)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {colorTheme === 'light' ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu button */}
        <button className="lg:hidden text-gray-900 dark:text-gray-100" aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12H21M3 6H21M3 18H21" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
