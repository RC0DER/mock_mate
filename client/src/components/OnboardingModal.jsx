import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { uploadResume, analyzeResume } from '../api/interviewApi';

const OnboardingModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { updateCandidateInfo, updateInterviewState } = useInterview();
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    experience: ''
  });
  const [file, setFile] = useState(null);
  const [step, setStep] = useState('form'); // 'form', 'loading', 'review'
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        if (droppedFile.size <= 5 * 1024 * 1024) {
          setFile(droppedFile);
          setError(null);
        } else {
          setError('File is too large (Max 5MB)');
        }
      } else {
        setError('Only .pdf files are allowed');
      }
    }
  };

  const isFormValid = formData.name && formData.role && formData.experience && file;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setStep('loading');
    setError(null);
    try {
      const { resumeText } = await uploadResume(file);
      const analysis = await analyzeResume(resumeText, formData.role, formData.experience);
      
      setAnalysisResult({ resumeText, analysis });
      
      updateCandidateInfo({ 
        name: formData.name, 
        role: formData.role, 
        experience: formData.experience,
        resumeText,
        resumeAnalysis: analysis
      });
      
      setStep('review');
    } catch (err) {
      console.error(err);
      setError('Failed to process resume or connect to AI.');
      setStep('form');
    }
  };

  const proceedToInterview = () => {
    updateInterviewState({ status: 'interviewing' });
    onClose();
    navigate('/interview');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Header / Progress */}
        <div className="bg-green-accent/10 px-8 py-6 border-b border-green-accent/20 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 'review' ? 'Resume Review Results' : 'Let\'s setup your interview'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="flex items-center text-sm font-medium">
            <span className={step === 'review' ? "text-gray-400" : "text-green-accent"}>Step 1 (Setup)</span>
            <span className="mx-2 text-gray-300">→</span>
            <span className={step === 'review' ? "text-green-accent" : "text-gray-400"}>Step 1.5 (Review)</span>
            <span className="mx-2 text-gray-300">→</span>
            <span className="text-gray-400">Step 2 (Interview)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
            <div className="bg-green-accent h-1.5 rounded-full transition-all duration-500" style={{ width: step === 'review' ? '50%' : '33%' }}></div>
          </div>
        </div>

        {/* Form Body */}
        {step === 'loading' ? (
          <div className="p-16 flex flex-col items-center justify-center min-h-[400px]">
            <div className="flex gap-2 items-center justify-center mb-6">
              <div className="w-4 h-4 bg-green-accent rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-green-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-4 h-4 bg-green-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-xl font-medium text-gray-800">Analyzing your resume...</p>
            <p className="text-gray-500 mt-2 text-center max-w-sm">Our AI is extracting your key skills, generating an ATS score, and formulating questions tailored to your experience.</p>
          </div>
        ) : step === 'review' && analysisResult ? (
          <div className="p-8 pb-10 space-y-8">
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">ATS Match Score</h3>
                <p className="text-sm text-gray-500">Based on your {formData.role} profile</p>
              </div>
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                  <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={226.2} strokeDashoffset={226.2 - (226.2 * (analysisResult.analysis.atsScore || 0)) / 100} 
                    className={`${(analysisResult.analysis.atsScore || 0) > 75 ? 'text-green-accent' : (analysisResult.analysis.atsScore || 0) > 50 ? 'text-yellow-400' : 'text-red-500'} transition-all duration-1000 ease-out`} />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-gray-800">
                  {analysisResult.analysis.atsScore || 0}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <div className="flex items-center gap-2 mb-4 text-red-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <h3 className="font-bold">Missing Keywords</h3>
                </div>
                <ul className="space-y-2">
                  {(analysisResult.analysis.missingKeywords || []).length > 0 ? (
                    analysisResult.analysis.missingKeywords.map((kw, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-900 bg-white px-3 py-2 rounded-lg border border-red-100 shadow-sm">
                        <span className="text-red-400 mt-0.5">•</span> {kw}
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-green-700 italic">No major keywords missing! Great job.</p>
                  )}
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-4 text-blue-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <h3 className="font-bold">Suggested Improvements</h3>
                </div>
                <ul className="space-y-2">
                  {(analysisResult.analysis.improvements || []).length > 0 ? (
                    analysisResult.analysis.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-blue-900 bg-white px-3 py-2 rounded-lg border border-blue-100 shadow-sm">
                        <span className="text-blue-400 mt-0.5">→</span> {imp}
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-blue-700 italic">Your resume looks tightly written.</p>
                  )}
                </ul>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
              <button 
                onClick={proceedToInterview} 
                className="px-8 py-3 rounded-full font-bold bg-green-accent text-white shadow-lg hover:-translate-y-0.5 transition-all text-lg flex items-center gap-2"
              >
                Proceed to Interview
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 pb-10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-accent/50" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Job Role</label>
                <select className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-accent/50 bg-white"
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="" disabled>Select role</option>
                  <option value="Software Engineer (SDE)">Software Engineer (SDE)</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <select className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-accent/50 bg-white"
                  value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}>
                  <option value="" disabled>Select experience</option>
                  <option value="Fresher (0-1 yr)">Fresher (0-1 yr)</option>
                  <option value="Intern">Intern</option>
                  <option value="Junior (1-3 yrs)">Junior (1-3 yrs)</option>
                  <option value="Mid-level (3-5 yrs)">Mid-level (3-5 yrs)</option>
                  <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF only, Max 5MB)</label>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${file ? 'border-green-accent bg-green-accent/5' : 'border-gray-300 hover:border-gray-400'}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    setError(null);
                  }
                }} />
                {file ? (
                  <div className="flex flex-col items-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-green-accent mb-2" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <p className="text-green-accent font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Click or drag to replace</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-400 mb-2" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-1">PDF operations are processed securely</p>
                  </div>
                )}
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSubmit} 
                disabled={!isFormValid}
                className={`px-8 py-3 rounded-full font-bold transition-all ${isFormValid ? 'bg-green-accent text-white shadow-lg hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                Start Resume Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
