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
  const [mode, setMode] = useState('voice'); // 'voice' or 'text'
  
  const totalQuestions = 8;
  const qIndex = interviewState.currentQuestionIndex;

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
          lastAnswer
        );
        
        setCurrentQ(qResponse.question);
        setIsAiThinking(false);
        
        // Speak the question
        speak(qResponse.question);
        
      } catch (e) {
        console.error(e);
        setCurrentQ("Could you tell me more about your recent project experience?");
        setIsAiThinking(false);
        speak("Could you tell me more about your recent project experience?");
      }
    };
    
    fetchQuestion();
    
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [qIndex]); // Re-run when question index advances

  const handleSubmitAnswer = async () => {
    stopListening();
    stopSpeaking();
    
    const finalAnswer = mode === 'voice' ? transcript : typedAnswer;
    if (!finalAnswer.trim()) return;

    setIsAiThinking(true);
    
    // Save locally to context immediately
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
        // Next question
        updateInterviewState({
          questions: updatedQuestions,
          answers: updatedAnswers,
          evaluations: updatedEvals,
          currentQuestionIndex: qIndex + 1
        });
        resetTranscript();
        setTypedAnswer('');
      } else {
        // End interview & transition to report
        updateInterviewState({
          questions: updatedQuestions,
          answers: updatedAnswers,
          evaluations: updatedEvals,
          status: 'report'
        });
        
        // Let report page generate the final report via API
        navigate('/report');
      }
      
    } catch (e) {
      console.error(e);
      setIsAiThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-lightGray flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100" alt="AI Interviewer" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
            <div className="w-10 h-10 rounded-full bg-green-accent text-white flex items-center justify-center font-bold border-2 border-white">{candidateInfo.name?.charAt(0) || 'U'}</div>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Mock Interview</h1>
            <p className="text-xs text-gray-500">{candidateInfo.role}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            REC
          </div>
        </div>
      </div>
      
      {/* Progress */}
      <div className="w-full bg-gray-200 h-1">
        <div className="bg-green-accent h-1 transition-all" style={{ width: `${((qIndex) / totalQuestions) * 100}%` }}></div>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center p-6 lg:p-12 w-full max-w-4xl mx-auto">
        <div className="text-center mb-8 flex flex-col items-center">
          <span className="bg-white text-green-accent shadow-sm px-4 py-1.5 rounded-full text-sm font-bold border border-gray-100 mb-6 inline-block">
            Question {qIndex + 1} / {totalQuestions}
          </span>
          
          {isAiThinking ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-2xl min-h-[200px] flex flex-col items-center justify-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-green-accent rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-green-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-green-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="font-medium text-gray-500 animate-pulse text-lg">AI is thinking...</p>
            </div>
          ) : (
            <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-gray-100 w-full">
              <h2 className={`font-bold text-gray-900 leading-tight transition-all duration-300 ${currentQ.length > 100 ? 'text-2xl lg:text-3xl' : 'text-3xl lg:text-4xl'}`}>
                "{currentQ}"
              </h2>
            </div>
          )}
        </div>

        {/* Answer Controls */}
        <div className="w-full bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col gap-6 transition-all duration-300">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h3 className="font-bold text-gray-700">Your Answer</h3>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setMode('voice')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'voice' ? 'bg-white shadow-sm text-green-accent' : 'text-gray-500'}`}>Voice</button>
              <button onClick={() => setMode('text')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'text' ? 'bg-white shadow-sm text-green-accent' : 'text-gray-500'}`}>Type</button>
            </div>
          </div>

          {mode === 'voice' ? (
            <div className="flex flex-col items-center py-6">
              <div className="min-h-[100px] w-full mb-6 relative">
                {transcript ? (
                  <p className="text-lg text-gray-700 p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[100px] whitespace-pre-wrap">{transcript}</p>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400">
                    {isListening ? "Listening... Speak now." : "Click microphone to start recording your answer"}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={isListening ? stopListening : startListening}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-green-accent text-white'}`}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {isListening ? (
                      <rect x="6" y="6" width="12" height="12"></rect>
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
                  <button onClick={handleSubmitAnswer} className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-black shadow-lg">
                    Submit Answer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <textarea 
                className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-accent focus:outline-none resize-none text-lg text-gray-700" 
                placeholder="Type your answer here..."
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
              ></textarea>
              <div className="flex justify-end">
                <button 
                  onClick={handleSubmitAnswer} 
                  disabled={!typedAnswer.trim() || isAiThinking}
                  className="bg-green-accent text-white px-8 py-3 rounded-full font-bold shadow-lg disabled:opacity-50"
                >
                  Submit Answer
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
