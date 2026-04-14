import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';

const LearnGrow = ({ onAction }) => {
  const [ref, isVisible] = useInView();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { title: 'Communication Skills', content: { title: 'Mastering Communication', desc: "Effective communication is the cornerstone of a successful interview. It's not just about what you say, but how you say it.", tips: ['The STAR Method: Frame your answers focusing on Situation, Task, Action, and Result.', 'Active Listening: Show engagement by nodding and waiting before responding.', 'Clarity & Conciseness: Avoid rambling. Answer the core of the question promptly.'] } },
    { title: 'Technical Interview Prep', content: { title: 'Cracking Technical Interviews', desc: 'Demonstrate your problem-solving abilities and deep technical knowledge with confidence.', tips: ['Think Out Loud: Interviewers want to understand your thought process.', 'Clarify Assumptions: Always ask clarifying questions before jumping into code.', 'Review Fundamentals: Brush up on data structures and algorithms well in advance.'] } },
    { title: 'Body Language & Confidence', content: { title: 'Projecting Confidence', desc: 'Non-verbal cues can leave a stronger impression than your words. Ensure your body language matches your expertise.', tips: ['Eye Contact: Maintain steady, natural eye contact with your interviewers.', 'Posture: Sit up straight, avoiding crossed arms to appear open and receptive.', 'Calm Hands: Keep your hands relaxed, using them naturally for emphasis.'] } },
    { title: 'Salary Negotiation', content: { title: 'Negotiating Your Salary', desc: "Don't leave money on the table. Learn how to advocate for your worth professionally and firmly.", tips: ['Do Your Research: Know the market rate for your role and location.', 'Let Them Go First: Try to wait for an initial offer before revealing your expectations.', 'Consider the Entire Offer: Factor in bonuses, benefits, PTO, and equity.'] } }
  ];

  return (
    <section id="learn-grow" className="py-20 min-h-screen bg-lightGray dark:bg-gray-900 transition-colors duration-200 flex items-center">
      <div 
        ref={ref}
        className={`max-w-6xl mx-auto px-6 w-full fade-up ${isVisible ? 'visible' : ''}`}
      >
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white">Learn & Grow</h2>
        <p className="text-lg text-center text-gray-500 dark:text-gray-400 mt-3 mb-12">Resources to sharpen your skills every day</p>
        
        <div className="flex flex-col lg:flex-row gap-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[400px]">
          {/* Left panel - Tabs */}
          <div className="lg:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col gap-2">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`text-left p-4 rounded-xl transition-all font-medium ${
                  activeTab === idx 
                    ? 'bg-white dark:bg-gray-700 text-green-accent shadow-sm border-l-4 border-green-accent' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white border-l-4 border-transparent'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
          
          {/* Right panel - Content */}
          <div className="lg:w-2/3 p-8 lg:p-12">
            <div className="transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tabs[activeTab].content.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">{tabs[activeTab].content.desc}</p>
              
              <ul className="space-y-4">
                {tabs[activeTab].content.tips.map((tip, idx) => {
                  const [strong, rest] = tip.split(': ');
                  return (
                    <li key={idx} className="flex gap-4 items-start">
                      <div className="mt-1 w-6 h-6 rounded-full bg-lightGreen dark:bg-green-accent/20 text-green-accent flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300"><strong>{strong}:</strong> {rest}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearnGrow;
