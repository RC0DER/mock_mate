import React from 'react';
import { useInView } from '../hooks/useInView';

const Hero = ({ onGetStarted }) => {
  const [ref, isVisible] = useInView();

  return (
    <section id="home" className="min-h-screen relative overflow-hidden flex items-center pt-28 pb-20">
      {/* CSS Bokeh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-lightGreen dark:from-dark dark:to-gray-900 transition-colors duration-200 -z-10"></div>
      <div className="absolute top-20 -left-20 w-96 h-96 bg-green-accent/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-green-accent/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-100/30 rounded-full blur-[150px] -z-10"></div>

      <div 
        ref={ref}
        className={`max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center gap-16 fade-up ${isVisible ? 'visible' : ''}`}
      >
        {/* Left Content */}
        <div className="lg:w-1/2 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-green-accent/10 text-green-accent px-4 py-2 rounded-full font-semibold text-sm mb-6 border border-green-accent/20">
            <span className="w-2 h-2 rounded-full bg-green-accent animate-pulse"></span>
            AI-Powered Interview Simulator
          </div>
          
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            Master your interview. <br />
            <span className="text-green-accent">Land your dream job.</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Practice with an expert AI interviewer tailored to your experience and target role. Get instant feedback and improve faster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button 
              onClick={onGetStarted}
              className="bg-green-accent text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 hover:shadow-xl hover:shadow-green-accent/30 transition-all hover:-translate-y-1 relative overflow-hidden group"
            >
              <span className="relative z-10">Start Mock Interview</span>
              <div className="absolute inset-0 h-full w-0 bg-emerald-600 transition-all duration-300 ease-out group-hover:w-full z-0"></div>
            </button>
            <button 
              onClick={() => document.getElementById('career-preparation').scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline rounded-full px-8 py-4 text-lg"
            >
              Learn More
            </button>
          </div>
        </div>
        
        {/* Right Content - Mock Video Call UI */}
        <div className="lg:w-1/2 w-full max-w-lg relative z-10 perspective-1000">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-[32px] shadow-2xl border border-white/50 dark:border-gray-700 relative overflow-hidden group hover:rotate-0 transition-transform duration-500 transform lg:rotate-y-[-5deg] lg:rotate-x-[5deg]">
            <div className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              REC 12:45
            </div>
            <div className="bg-gray-100 rounded-[22px] overflow-hidden aspect-[4/5] relative">
              {/* Fallback image representing woman with headphones */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10 w-full h-full"></div>
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800&h=1000" 
                alt="AI Interviewer" 
                className="w-full h-full object-cover object-center"
              />
              
              {/* Bottom Video Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-full shadow-lg">
                <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-accent shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-1.7 0-3 1.2-3 2.8v7.4c0 1.6 1.3 2.8 3 2.8s3-1.2 3-2.8V4.8C15 3.2 13.7 2 12 2zm6 10.2v-1h-2v1c0 2.2-1.8 4-4 4s-4-1.8-4-4v-1H6v1c0 2.9 2.2 5.4 5 5.9V22h2v-3.9c2.8-.5 5-3 5-5.9z"/></svg>
                </button>
                <button className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Floating detail cards */}
          <div className="absolute top-1/4 -left-12 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100 dark:border-gray-700 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="w-8 h-8 rounded-full bg-green-accent/10 dark:bg-green-accent/20 text-green-accent flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Feedback</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Instant AI Scoring</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
