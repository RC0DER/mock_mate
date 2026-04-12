import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1D9E75"/>
                <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              MockMate
            </div>
        <p className="text-gray-400 leading-relaxed max-w-sm">
          Your ultimate companion to land that dream job through guided AI practice and feedback.
        </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Product</h4>
            <ul className="space-y-4 text-gray-400">
              <li><button className="hover:text-white transition-colors">Resume Review</button></li>
              <li><button className="hover:text-white transition-colors">Mock Interviews</button></li>
              <li><button className="hover:text-white transition-colors">Skill Assessment</button></li>
              <li><button className="hover:text-white transition-colors">Pricing</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-4 text-gray-400">
              <li><button className="hover:text-white transition-colors">About Us</button></li>
              <li><button className="hover:text-white transition-colors">Careers</button></li>
              <li><button className="hover:text-white transition-colors">Success Stories</button></li>
              <li><button className="hover:text-white transition-colors">Contact</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Resources</h4>
            <ul className="space-y-4 text-gray-400">
              <li><button className="hover:text-white transition-colors">Blog</button></li>
              <li><button className="hover:text-white transition-colors">Interview Guides</button></li>
              <li><button className="hover:text-white transition-colors">Community Forum</button></li>
              <li><button className="hover:text-white transition-colors">Help Center</button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>&copy; 2025 MockMate. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
