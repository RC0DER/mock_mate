import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CareerPrep from '../components/CareerPrep';
import LearnGrow from '../components/LearnGrow';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import OnboardingModal from '../components/OnboardingModal';
import { useLocation } from 'react-router-dom';

const Home = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('full'); // 'full' or 'review-only'
  
  const handleOnboarding = (type = 'full') => {
    if (type === 'Resume Review') {
      setModalMode('review-only');
    } else {
      setModalMode('full');
    }
    setIsModalOpen(true);
  };

  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px' }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col pt-1">
      <Navbar activeSection={activeSection} onGetStarted={() => handleOnboarding('full')} />
      <main>
        <Hero onGetStarted={() => handleOnboarding('full')} />
        <CareerPrep onAction={(type) => handleOnboarding(type)} />
        <LearnGrow onAction={() => handleOnboarding('full')} />
        <Blog />
        <Contact />
      </main>
      <Footer />
      <OnboardingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode={modalMode}
      />
    </div>
  );
};

export default Home;
