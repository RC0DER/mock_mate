import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { generateQuestion, evaluateAnswer } from '../api/interviewApi';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const Interview = () => {
  const navigate = useNavigate();
  const { candidateInfo, interviewState, updateInterviewState, setReportData } = useInterview();
  const { isListening, transcript, setTranscript, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { speak, isSpeaking, stopSpeaking } = useSpeechSynthesis();
  
  const [currentQ, setCurrentQ] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(true);
  const [mode, setMode] = useState('voice'); 
  
  const qIndex = interviewState.currentQuestionIndex;

  // Expert Structure: 
  // Phase 1: Intro (2q), Phase 2: Tech (8q), Phase 3: HR (6q)
  const getRoundInfo = (index) => {
    if (index >= 0 && index <= 1) return { round: 1, name: 'Introduction', totalInRound: 2 };
    if (index >= 2 && index <= 9) return { round: 2, name: 'Technical Interview', totalInRound: 8 };
    if (index >= 10 && index <= 15) return { round: 3, name: 'HR Interview', totalInRound: 6 };
    return { round: 3, name: 'Final Wrap-up', totalInRound: 1 };
  };

  const { round, name: roundName } = getRoundInfo(qIndex);
  const totalQuestions = 16;

  useEffect(() => {
    if (!candidateInfo.name) {
      navigate('/');
      return;
    }
    
    const fetchQuestion = async () => {
      setIsAiThinking(true);
      try {
        const lastAnswer = interviewState.answers.length > 0 
          ? interviewState.answers[interviewState.answers.length - 1] 
          : null;
        
        const qResponse = await generateQuestion(
          candidateInfo.role,
          candidateInfo.experience,
          candidateInfo.resumeAnalysis,
          interviewState.questions,
          lastAnswer,
          round
        );
        
        setCurrentQ(qResponse.question);
        setIsAiThinking(false);
        speak(qResponse.question);
        
      } catch (e) {
        console.error(e);
        const fallback = qIndex === 0 
          ? "Before we dive in — please give me a brief introduction about yourself. Who are you, where are you from, and what brought you to this field?"
          : qIndex === 1
          ? "Great! Now, tell me about the project you are most proud of — walk me through what you built, the problem it solved, your specific role, and the outcome."
          : "Could you tell me more about your technical expertise and how you solve complex problems?";
        
        setCurrentQ(fallback);
        setIsAiThinking(false);
        speak(fallback);
      }
    };
    
    fetchQuestion();
    
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [qIndex]);

  const handleSubmitAnswer = async () => {
    stopListening();
    stopSpeaking();
    
    const finalAnswer = mode === 'voice' ? transcript : typedAnswer;
    if (!finalAnswer.trim()) return;

    setIsAiThinking(true);
    
    const updatedQuestions = [...interviewState.questions, currentQ];
    const updatedAnswers = [...interviewState.answers, finalAnswer];
    
    try {
      const evaluation = await evaluateAnswer(
        candidateInfo.role,
        currentQ,
        finalAnswer,
        candidateInfo.experience
      );
      
      const updatedEvals = [...interviewState.evaluations, { question: currentQ, answer: finalAnswer, ...evaluation }];
      
      if (qIndex + 1 < totalQuestions) {
        updateInterviewState({
          questions: updatedQuestions,
          answers: updatedAnswers,
          evaluations: updatedEvals,
          currentQuestionIndex: qIndex + 1
        });
        resetTranscript();
        setTypedAnswer('');
      } else {
        updateInterviewState({
          questions: updatedQuestions,
          answers: updatedAnswers,
          evaluations: updatedEvals,
          status: 'report'
        });
        navigate('/report');
      }
      
    } catch (e) {
      console.error(e);
      setIsAiThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-lightGray dark:bg-gray-900 flex flex-col transition-colors duration-200">
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100" alt="AI Interviewer" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            <div className="w-10 h-10 rounded-full bg-green-accent text-white flex items-center justify-center font-bold border-2 border-white">{candidateInfo.name?.charAt(0) || 'U'}</div>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">{roundName}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Round {round} of 3 • {candidateInfo.role}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            LIVE SESSION
          </div>
        </div>
      </div>
      
      {/* Progress */}
      <div className="w-full bg-gray-200 h-1.5">
        <div className="bg-green-accent h-1.5 transition-all duration-700" style={{ width: `${((qIndex + 1) / totalQuestions) * 100}%` }}></div>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center p-6 lg:p-12 w-full max-w-4xl mx-auto">
        <div className="text-center mb-10 flex flex-col items-center w-full">
          <div className="flex items-center gap-3 mb-8">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${round === 1 ? 'bg-blue-100 text-blue-600' : round === 2 ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
               Round {round}
            </span>
            <span className="bg-white text-gray-500 shadow-sm px-4 py-1.5 rounded-full text-sm font-bold border border-gray-100">
               Question {qIndex + 1} / {totalQuestions}
            </span>
          </div>
          
          {isAiThinking ? (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl min-h-[250px] flex flex-col items-center justify-center gap-6">
              <div className="flex gap-3">
                <div className="w-4 h-4 bg-green-accent rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-green-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-4 h-4 bg-green-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="font-bold text-gray-400 dark:text-gray-300 text-xl tracking-tight">AI Interviewer is preparing {roundName} questions...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-10 lg:p-16 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-700 w-full relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-green-accent"></div>
               <h2 className="font-black text-gray-900 dark:text-white leading-tight text-3xl lg:text-5xl text-left">
                "{currentQ}"
              </h2>
            </div>
          )}
        </div>

        {/* Answer Controls */}
        <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-[32px] shadow-xl border border-white/50 dark:border-gray-700/50 p-8 flex flex-col gap-6 transition-all duration-500">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-6">
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg">Your Response</h3>
            <div className="flex gap-2 bg-gray-100/50 dark:bg-gray-700/50 p-1.5 rounded-2xl">
              <button onClick={() => setMode('voice')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'voice' ? 'bg-white shadow-md text-green-accent' : 'text-gray-400 hover:text-gray-600'}`}>VOICE</button>
              <button onClick={() => setMode('text')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'text' ? 'bg-white shadow-md text-green-accent' : 'text-gray-400 hover:text-gray-600'}`}>TEXT</button>
            </div>
          </div>

          {mode === 'voice' ? (
            <div className="flex flex-col items-center py-4">
              <div className="min-h-[120px] w-full mb-8 relative">
                {transcript ? (
                  <p className="text-xl text-gray-800 dark:text-white p-6 bg-gray-50/50 dark:bg-gray-700/50 rounded-3xl border border-gray-100 dark:border-gray-600 min-h-[120px] leading-relaxed shadow-inner">{transcript}</p>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-3xl bg-gray-50/30 dark:bg-gray-700/30 text-gray-400 dark:text-gray-300 font-medium italic">
                    {isListening ? "Listening... I'm all ears!" : "Tap the microphone and start speaking clearly."}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-8">
                <button 
                  onClick={isListening ? stopListening : startListening}
                  className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${isListening ? 'bg-red-500 text-white ring-8 ring-red-100' : 'bg-green-accent text-white ring-8 ring-green-50'}`}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {isListening ? (
                      <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                    ) : (
                      <>
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="22"></line>
                      </>
                    )}
                  </svg>
                </button>
                {(transcript.length > 0) && !isAiThinking && (
                  <button onClick={handleSubmitAnswer} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-full font-black text-lg hover:bg-black dark:hover:bg-gray-100 shadow-2xl transform transition-transform active:scale-95 flex items-center gap-3">
                    SUBMIT ANSWER
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <textarea 
                className="w-full h-48 p-6 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-3xl focus:ring-4 focus:ring-green-accent/20 focus:bg-white dark:focus:bg-gray-800 focus:outline-none resize-none text-xl text-gray-800 dark:text-white leading-relaxed transition-all shadow-inner" 
                placeholder="Type your insights here..."
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
              ></textarea>
              <div className="flex justify-end">
                <button 
                  onClick={handleSubmitAnswer} 
                  disabled={!typedAnswer.trim() || isAiThinking}
                  className="bg-green-accent text-white px-12 py-4 rounded-2xl font-black text-lg shadow-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-3"
                >
                  SUBMIT ANSWER
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Interview;
