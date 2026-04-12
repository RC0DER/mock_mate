import React from 'react';

const Navbar = ({ activeSection, onGetStarted }) => {
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
    <header className="fixed w-full top-0 bg-white/90 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-2 cursor-pointer font-extrabold text-2xl text-dark tracking-tight"
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
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={onGetStarted} 
          className="hidden md:block bg-green-accent text-white px-6 py-2.5 rounded-full font-bold hover:bg-opacity-90 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          Get Started
        </button>

        {/* Mobile menu button */}
        <button className="lg:hidden text-gray-900" aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12H21M3 6H21M3 18H21" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
