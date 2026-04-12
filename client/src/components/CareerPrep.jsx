import React from 'react';
import { useInView } from '../hooks/useInView';

const CareerPrep = ({ onAction }) => {
  const [ref, isVisible] = useInView();

  const cards = [
    {
      title: 'Resume Review',
      description: 'Upload your resume and get AI-powered feedback instantly',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      buttonText: 'Try It Now'
    },
    {
      title: 'Interview Practice',
      description: 'Practice with role-specific questions tailored to your experience',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      buttonText: 'Start Practice'
    },
    {
      title: 'Skill Assessment',
      description: 'Identify gaps and get a personalized learning roadmap',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
      buttonText: 'Take Assessment'
    }
  ];

  return (
    <section id="career-preparation" className="py-20 min-h-screen bg-white flex items-center">
      <div 
        ref={ref}
        className={`max-w-6xl mx-auto px-6 w-full fade-up ${isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl font-bold text-center text-gray-900">Career Preparation</h2>
        <p className="text-lg text-center text-gray-500 mt-3 mb-12">Everything you need to land your dream job</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="w-16 h-16 bg-lightGreen text-green-accent rounded-2xl flex items-center justify-center mb-6">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
              <p className="text-gray-600 mb-8 flex-grow">{card.description}</p>
              <button onClick={onAction} className="btn-outline w-full mt-auto">{card.buttonText}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CareerPrep;
