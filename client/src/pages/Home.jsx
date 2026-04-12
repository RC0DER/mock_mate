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
      <Navbar activeSection={activeSection} onGetStarted={() => setIsModalOpen(true)} />
      <main>
        <Hero onGetStarted={() => setIsModalOpen(true)} />
        <CareerPrep onAction={() => setIsModalOpen(true)} />
        <LearnGrow onAction={() => setIsModalOpen(true)} />
        <Blog />
        <Contact />
      </main>
      <Footer />
      <OnboardingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Home;
