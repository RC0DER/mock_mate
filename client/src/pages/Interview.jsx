import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { generateQuestion, evaluateAnswer } from '../api/interviewApi';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as blazeface from '@tensorflow-models/blazeface';
import * as poseDetection from '@tensorflow-models/pose-detection/dist/pose-detection.js';

const Interview = () => {
  const navigate = useNavigate();
  const { candidateInfo, interviewState, updateInterviewState } = useInterview();
  const { isListening, transcript, setTranscript, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { speak, stopSpeaking, isSpeaking } = useSpeechSynthesis();
  
  const [currentQ, setCurrentQ] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(true);
  const [mode, setMode] = useState('voice'); 
  
  // Video Call & Tracking specific State
  const videoRef = useRef(null);
  const aiVideoRef = useRef(null);
  const [warning, setWarning] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const faceModelRef = useRef(null);
  const poseModelRef = useRef(null);
  
  const qIndex = interviewState.currentQuestionIndex;

  const getRoundInfo = (index) => {
    if (index >= 0 && index <= 1) return { round: 1, name: 'Introduction', totalInRound: 2 };
    if (index >= 2 && index <= 9) return { round: 2, name: 'Technical Interview', totalInRound: 8 };
    if (index >= 10 && index <= 15) return { round: 3, name: 'HR Interview', totalInRound: 6 };
    return { round: 3, name: 'Final Wrap-up', totalInRound: 1 };
  };

  const { round, name: roundName } = getRoundInfo(qIndex);
  const totalQuestions = 16;

  // Setup Webcam and TensorFlow
  useEffect(() => {
    if (!candidateInfo.name) return; // Prevent camera prompt if redirecting to home

    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setWarning("⚠️ Please enable your webcam.");
      }
    };
    
    const loadModels = async () => {
      try {
        await tf.ready();
        faceModelRef.current = await blazeface.load();
        poseModelRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
        setModelsLoaded(true);
      } catch (err) {
        console.error("TFJS Load Error:", err);
      }
    };

    startCam();
    loadModels();

    return () => {
      if (videoRef.current?.srcObject) {
         videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Tracking Loop
  useEffect(() => {
    if (!modelsLoaded || !videoRef.current) return;
    
    let interval = setInterval(async () => {
      if (videoRef.current.readyState === 4) {
        try {
          const faces = await faceModelRef.current.estimateFaces(videoRef.current, false);
          
          if (faces.length > 1) {
            setWarning("Multiple people detected in frame!");
          } else if (faces.length === 0) {
            setWarning("No candidate detected! Please return to camera.");
          } else {
            const poses = await poseModelRef.current.estimatePoses(videoRef.current);
            if (poses && poses.length > 0 && poses[0].keypoints) {
              const wrists = poses[0].keypoints.filter(k => k.name === 'left_wrist' || k.name === 'right_wrist');
              const nose = poses[0].keypoints.find(k => k.name === 'nose');
              
              let handsHigh = false;
              if (nose) {
                 handsHigh = wrists.some(w => w.score > 0.6 && w.y < nose.y - 40);
              }
              
              if (handsHigh) {
                 setWarning("Keep your hands relaxed and visible.");
              } else {
                 setWarning("");
              }
            } else {
               setWarning("");
            }
          }
        } catch(e) {
          console.error("Tracking Error", e);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [modelsLoaded]);


  // AI Video-Speech Sync
  useEffect(() => {
    const aiVideo = aiVideoRef.current;
    if (!aiVideo) return;

    if (isSpeaking) {
      // Ensure video is playing if AI is speaking
      const playPromise = aiVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Auto-play prevented or video failed to play", e);
        });
      }
    } else {
      // Only pause if we're not about to start speaking again (minor delay)
      const timeout = setTimeout(() => {
        if (!isSpeaking) {
          aiVideo.pause();
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isSpeaking]);


  // Interview Logic
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
    <div className="relative w-full h-screen bg-[#0a0a0b] overflow-hidden flex flex-col font-sans text-white">
      
      {/* Dynamic Warning Banner */}
      {warning && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 backdrop-blur text-white font-bold px-6 py-3 rounded-full shadow-2xl border border-red-400 flex items-center gap-3 animate-pulse">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          {warning}
        </div>
      )}

      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 bg-radial-gradient from-gray-900 to-black opacity-40"></div>

      {/* Main Video Call Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        
        {/* Interviewer Video Stage */}
        <div className={`relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-2 transition-all duration-500 ${isSpeaking ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'border-white/10'}`}>
           <video 
              ref={aiVideoRef}
              src="/ai_interviewer.mp4" 
              playsInline
              muted
              className="w-full h-full object-contain" 
           />
           
           {/* HD / Status Overlay */}
           <div className="absolute top-6 left-6 flex items-center gap-3">
              <div className="bg-blue-600 px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase">HD 1080P</div>
              <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                 <span className="text-[10px] font-bold tracking-widest uppercase">Live Session</span>
              </div>
           </div>

           {/* Round Detail Overlay (Top Center) */}
           <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-2xl hidden md:flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{roundName}</span>
              <span className="text-xs font-bold text-white/60 italic">Question {qIndex + 1} / {totalQuestions}</span>
           </div>

           {/* AI Speaking Indicator removed as requested */}

           {/* Subtitle Overlay (Bottom Center) */}
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-6">
              {!isAiThinking && (
                 <div className="bg-black/80 backdrop-blur-md px-8 py-5 rounded-2xl border border-white/10 shadow-2xl text-center">
                    <p className="text-white text-lg md:text-xl font-medium leading-relaxed italic">
                       "{currentQ}"
                    </p>
                 </div>
              )}
           </div>
        </div>
      </main>

      {/* Top Right Candidate Webcam Feed */}
      <div className={`absolute top-8 right-8 w-40 h-28 md:w-56 md:h-40 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-4 z-40 transition-all duration-300 ${warning ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]'}`}>
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover transform scale-x-[-1]" 
          autoPlay 
          playsInline 
          muted 
        />
        
        {/* Dynamic Camera Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2">
           <div className="flex justify-between w-full">
              <div className={`w-3 h-3 border-t-2 border-l-2 transition-colors ${warning ? 'border-red-500' : 'border-green-500'}`}></div>
              <div className={`w-3 h-3 border-t-2 border-r-2 transition-colors ${warning ? 'border-red-500' : 'border-green-500'}`}></div>
           </div>
           
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className={`w-[80%] h-[80%] border transition-colors ${warning ? 'border-red-500' : 'border-green-500'} grid grid-cols-2 grid-rows-2`}>
                 <div className={`border-b border-r transition-colors ${warning ? 'border-red-500' : 'border-green-500'}`}></div>
                 <div className={`border-b transition-colors ${warning ? 'border-red-500' : 'border-green-500'}`}></div>
                 <div className={`border-r transition-colors ${warning ? 'border-red-500' : 'border-green-500'}`}></div>
                 <div></div>
              </div>
           </div>

           <div className="flex justify-between w-full">
              <div className={`w-3 h-3 border-b-2 border-l-2 transition-colors ${warning ? 'border-red-500' : 'border-green-500'}`}></div>
              <div className={`w-3 h-3 border-b-2 border-r-2 transition-colors ${warning ? 'border-red-500' : 'border-green-500'}`}></div>
           </div>
        </div>

        <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-[4px] text-[8px] text-white font-black tracking-tighter backdrop-blur-md transition-colors ${warning ? 'bg-red-600' : 'bg-green-600'}`}>
          {warning ? 'FAULT' : 'NORMAL'}
        </div>
      </div>

      {/* Bottom Control Dock */}
      <div className="relative z-30 p-6 flex justify-center bg-gradient-to-t from-black to-transparent">
         <div className="w-full max-w-4xl bg-[#1c1c1e] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            
            <div className="flex justify-between items-center px-4">
               <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                  <button onClick={() => setMode('voice')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${mode === 'voice' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>VOICE</button>
                  <button onClick={() => setMode('text')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${mode === 'text' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>TEXT</button>
               </div>
               
               <div className="flex items-center gap-4">
                  <button 
                    onClick={() => !isAiThinking && speak(currentQ)} 
                    disabled={isAiThinking} 
                    className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
                    title="Repeat Question"
                  >
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                  </button>
               </div>
            </div>

            {mode === 'voice' ? (
               <div className="flex items-center gap-4">
                  <div className="flex-grow bg-black/40 rounded-2xl h-16 flex items-center px-6 border border-white/5 overflow-hidden">
                     {transcript ? (
                        <p className="text-gray-300 italic font-medium truncate">"{transcript}"</p>
                     ) : (
                        <div className="flex items-center gap-3">
                           {isListening && <div className="flex gap-1"><div className="w-1 h-3 bg-blue-500 animate-pulse"></div><div className="w-1 h-2 bg-blue-500 animate-pulse delay-75"></div><div className="w-1 h-3 bg-blue-500 animate-pulse delay-150"></div></div>}
                           <span className="text-gray-500 text-sm font-bold tracking-widest uppercase">{isListening ? "Listening..." : "Tap Mic to speak"}</span>
                        </div>
                     )}
                  </div>

                  <button 
                     onClick={isListening ? stopListening : startListening} 
                     className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-white text-black hover:scale-105 active:scale-95'}`}
                  >
                     {isListening ? (
                        <>
                           <span className="absolute inset-0 rounded-full border-4 border-red-500/40 animate-ping"></span>
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>
                        </>
                     ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                     )}
                  </button>

                  <button 
                     onClick={handleSubmitAnswer} 
                     disabled={!transcript || isAiThinking}
                     className="px-8 h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black tracking-widest uppercase transition-all disabled:opacity-30 disabled:grayscale flex items-center gap-3"
                  >
                     {isAiThinking ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>Processing...</span>
                        </>
                     ) : (
                        <span>Send</span>
                     )}
                  </button>
               </div>
            ) : (
               <div className="flex gap-4">
                  <input 
                     type="text"
                     className="flex-grow bg-black/40 border border-white/5 rounded-2xl px-6 h-16 focus:outline-none focus:border-blue-500/50 text-white"
                     placeholder="Type your response..."
                     value={typedAnswer}
                     onChange={(e) => setTypedAnswer(e.target.value)}
                  />
                  <button 
                     onClick={handleSubmitAnswer} 
                     disabled={!typedAnswer.trim() || isAiThinking}
                     className="px-10 h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black tracking-widest uppercase transition-all disabled:opacity-30 flex items-center gap-3"
                  >
                     {isAiThinking ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>Processing...</span>
                        </>
                     ) : (
                        <span>Send</span>
                     )}
                  </button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Interview;
