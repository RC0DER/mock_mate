import { createContext, useContext, useState, useEffect } from 'react';

const InterviewContext = createContext();

export const useInterview = () => useContext(InterviewContext);

export const InterviewProvider = ({ children }) => {
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    role: '',
    experience: '',
    resumeText: '',
    resumeAnalysis: null
  });
  
  const [interviewState, setInterviewState] = useState({
    currentQuestionIndex: 0,
    questions: [],
    answers: [],
    evaluations: [],
    status: 'idle', // idle, onboarding, interviewing, report
    isThinking: false
  });

  const [reportData, setReportData] = useState(null);

  // Load from localeStorage
  useEffect(() => {
    const saved = localStorage.getItem('mockmate_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.candidateInfo) setCandidateInfo(parsed.candidateInfo);
        if (parsed.interviewState) setInterviewState(parsed.interviewState);
        if (parsed.reportData) setReportData(parsed.reportData);
      } catch (e) {
        console.error("Failed to parse session", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('mockmate_session', JSON.stringify({
      candidateInfo,
      interviewState,
      reportData
    }));
  }, [candidateInfo, interviewState, reportData]);

  const updateCandidateInfo = (info) => {
    setCandidateInfo(prev => ({ ...prev, ...info }));
  };

  const updateInterviewState = (state) => {
    setInterviewState(prev => ({ ...prev, ...state }));
  };

  const resetSession = () => {
    setCandidateInfo({ name: '', role: '', experience: '', resumeText: '', resumeAnalysis: null });
    setInterviewState({ currentQuestionIndex: 0, questions: [], answers: [], evaluations: [], status: 'idle', isThinking: false });
    setReportData(null);
    localStorage.removeItem('mockmate_session');
  };

  return (
    <InterviewContext.Provider value={{ 
      candidateInfo, 
      interviewState, 
      reportData, 
      setReportData,
      updateCandidateInfo, 
      updateInterviewState,
      resetSession
    }}>
      {children}
    </InterviewContext.Provider>
  );
};
