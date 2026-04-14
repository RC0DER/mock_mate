import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { uploadResume, analyzeResume } from '../api/interviewApi';

const OnboardingModal = ({ isOpen, onClose, mode = 'full' }) => {
  const navigate = useNavigate();
  const { updateCandidateInfo, updateInterviewState, setReportData } = useInterview();
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    qualification: '',
    experience: '',
    customRole: '',
    customQualification: ''
  });
  const [file, setFile] = useState(null);
  const [step, setStep] = useState('form'); 
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

  const isFormValid = formData.name && 
                     (formData.role === 'Other' ? formData.customRole : formData.role) && 
                     (formData.qualification === 'Other' ? formData.customQualification : formData.qualification) && 
                     formData.experience && 
                     file;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setStep('loading');
    setError(null);
    
    const finalRole = formData.role === 'Other' ? formData.customRole : formData.role;
    const finalQual = formData.qualification === 'Other' ? formData.customQualification : formData.qualification;

    try {
      const { resumeText } = await uploadResume(file);
      const analysis = await analyzeResume(resumeText, finalRole, formData.experience);
      
      setAnalysisResult({ resumeText, analysis });
      
      updateCandidateInfo({ 
        name: formData.name, 
        role: finalRole, 
        qualification: finalQual,
        experience: formData.experience,
        resumeText,
        resumeAnalysis: analysis
      });
      
      if (mode === 'review-only') {
        setStep('review');
      } else {
        proceedToInterview();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to process resume or connect to AI.');
      setStep('form');
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      name: '',
      role: '',
      qualification: '',
      experience: '',
      customRole: '',
      customQualification: ''
    });
    setFile(null);
    setAnalysisResult(null);
    setError(null);
    setReportData(null); // Clear old report
    updateInterviewState({ 
      currentQuestionIndex: 0, 
      questions: [], 
      answers: [], 
      evaluations: [], 
      status: 'idle', 
      isThinking: false 
    });
    onClose();
  };

  const proceedToInterview = () => {
    setReportData(null); // CRITICAL: Force new report to be fetched on completion
    updateInterviewState({ 
      currentQuestionIndex: 0, 
      questions: [], 
      answers: [], 
      evaluations: [], 
      status: 'interviewing', 
      isThinking: false 
    });
    setStep('form'); 
    onClose();
    navigate('/interview');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Header / Progress */}
        <div className="bg-green-accent/10 dark:bg-gray-800/40 px-8 py-6 border-b border-green-accent/20 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === 'review' ? 'ATS Feedback' : mode === 'review-only' ? 'Instant Resume Review' : 'Let\'s setup your interview'}
            </h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="flex items-center text-sm font-medium dark:text-gray-300">
            <span className={step === 'review' ? "text-gray-400" : "text-green-accent"}>Step 1 (Setup)</span>
            <span className="mx-2 text-gray-300">&rarr;</span>
            {mode === 'review-only' ? (
              <span className={step === 'review' ? "text-green-accent" : "text-gray-400"}>Step 2 (ATS Report)</span>
            ) : (
              <span className="text-gray-400">Step 2 (Interview)</span>
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
            <div className="bg-green-accent h-1.5 rounded-full transition-all duration-500" style={{ width: step === 'review' ? '100%' : '50%' }}></div>
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
            <p className="text-xl font-medium text-gray-800">
              {mode === 'review-only' ? 'Scoring your resume...' : 'Preparing your interview...'}
            </p>
            <p className="text-gray-500 mt-2 text-center max-w-sm">
              {mode === 'review-only' ? 'Comparing your skills against role benchmarks.' : 'Analyzing your background to generate relevant questions.'}
            </p>
          </div>
        ) : step === 'review' && analysisResult ? (
          <div className="p-8 pb-10 space-y-8">
            <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">ATS Score</h3>
                <p className="text-sm text-gray-500">How well you match the {formData.role === 'Other' ? formData.customRole : formData.role} role</p>
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
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800/50">
                <div className="flex items-center gap-2 mb-4 text-red-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <h3 className="font-bold">Missing Keywords</h3>
                </div>
                <ul className="space-y-2">
                  {(analysisResult.analysis.missingKeywords || []).length > 0 ? (
                    analysisResult.analysis.missingKeywords.map((kw, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-900 dark:text-red-200 bg-white dark:bg-red-900/30 px-3 py-2 rounded-lg border border-red-100 dark:border-red-800/50 shadow-sm">
                        <span className="text-red-400 mt-0.5">â€¢</span> {kw}
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-green-700 italic">Excellent! No missing keywords found.</p>
                  )}
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-center gap-2 mb-4 text-blue-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <h3 className="font-bold">Suggested Fixes</h3>
                </div>
                <ul className="space-y-2">
                  {(analysisResult.analysis.improvements || []).length > 0 ? (
                    analysisResult.analysis.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-200 bg-white dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm">
                        <span className="text-blue-400 mt-0.5">â†’</span> {imp}
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-blue-700 italic">Your resume formatting is professional.</p>
                  )}
                </ul>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
              <button 
                onClick={handleClose} 
                className="px-6 py-3 rounded-full font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => setStep('form')}
                className="px-8 py-3 rounded-full font-bold bg-white dark:bg-transparent text-green-accent border border-green-accent shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                New Upload
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 pb-10 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <input type="text" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-accent/50 bg-gray-50/50 dark:bg-gray-800 dark:text-white transition-all font-medium" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Qualification</label>
                <select className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-accent/50 bg-gray-50/50 dark:bg-gray-800 dark:text-white font-medium"
                  value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})}>
                  <option value="" disabled>Select Highest Qualification</option>
                  <option value="High School">High School / Senior Secondary</option>
                  <option value="B.Tech/B.E">B.Tech / B.E (Engineering)</option>
                  <option value="B.C.A">B.C.A (Computer Applications)</option>
                  <option value="B.Sc">B.Sc (Science)</option>
                  <option value="B.Com">B.Com (Commerce)</option>
                  <option value="B.A">B.A (Arts)</option>
                  <option value="M.Tech/M.E">M.Tech / M.E</option>
                  <option value="M.C.A">M.C.A</option>
                  <option value="M.B.A">M.B.A</option>
                  <option value="M.Sc">M.Sc</option>
                  <option value="Ph.D">Ph.D (Doctorate)</option>
                  <option value="Diploma">Diploma / Polytechnic</option>
                  <option value="Other">Other Degree...</option>
                </select>
                {formData.qualification === 'Other' && (
                  <div className="mt-2 animate-fade-in-down">
                    <input 
                      type="text" 
                      className="w-full border border-green-accent/30 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-accent/50 bg-white dark:bg-gray-800 dark:text-white shadow-sm font-medium" 
                      placeholder="Enter qualification name"
                      value={formData.customQualification}
                      onChange={(e) => setFormData({...formData, customQualification: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Target Job Role</label>
                <select className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-accent/50 bg-gray-50/50 dark:bg-gray-800 dark:text-white font-medium"
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="" disabled>Select role</option>
                  <optgroup label="Technology">
                    <option value="Software Engineer (SDE)">Software Engineer (SDE)</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="QA/Testing Engineer">QA/Testing Engineer</option>
                    <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                  </optgroup>
                  <optgroup label="Management & Business">
                    <option value="Product Manager">Product Manager</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Digital Marketing Manager">Digital Marketing Manager</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Business Analyst">Business Analyst</option>
                  </optgroup>
                  <option value="Other">Other Job Role...</option>
                </select>
                {formData.role === 'Other' && (
                  <div className="mt-2 animate-fade-in-down">
                    <input 
                      type="text" 
                      className="w-full border border-green-accent/30 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-accent/50 bg-white dark:bg-gray-800 dark:text-white shadow-sm font-medium" 
                      placeholder="Enter job role name"
                      value={formData.customRole}
                      onChange={(e) => setFormData({...formData, customRole: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Experience Level</label>
                <select className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-accent/50 bg-gray-50/50 dark:bg-gray-800 dark:text-white"
                  value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}>
                  <option value="" disabled>Select experience</option>
                  <option value="Fresher (0-1 yr)">Fresher (0-1 yr)</option>
                  <option value="Intern">Intern / Student</option>
                  <option value="Junior (1-3 yrs)">Junior (1-3 yrs)</option>
                  <option value="Mid-level (3-5 yrs)">Mid-level (3-5 yrs)</option>
                  <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
                  <option value="Lead/Architect (8+ yrs)">Lead/Architect (8+ yrs)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Upload Resume (PDF - Max 5MB)</label>
              <div 
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${file ? 'border-green-accent bg-green-accent/5' : 'border-gray-200 dark:border-gray-700 hover:border-green-accent/50 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
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
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-green-accent mb-2" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <p className="text-green-accent font-bold truncate max-w-[250px]">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Tap to swap files</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gray-300 mb-2" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <p className="text-gray-500 dark:text-gray-300 font-bold">Drop your resume here</p>
                    <p className="text-xs text-gray-400 mt-1">Ready for AI-Powered ATS analysis</p>
                  </div>
                )}
              </div>
              {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSubmit} 
                disabled={!isFormValid}
                className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-lg shadow-xl transition-all ${isFormValid ? 'bg-green-accent text-white hover:-translate-y-1 active:scale-95' : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
              >
                {mode === 'review-only' ? 'Analyze My Resume' : 'Start My Interview'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
