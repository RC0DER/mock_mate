import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { generateReport } from '../api/interviewApi';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Report = () => {
  const navigate = useNavigate();
  const { candidateInfo, interviewState, reportData, setReportData } = useInterview();
  const [generating, setGenerating] = useState(!reportData);

  useEffect(() => {
    if (!candidateInfo.name || interviewState.evaluations.length === 0) {
      navigate('/');
      return;
    }

    if (!reportData) {
      const fetchReport = async () => {
        try {
          const report = await generateReport(
            candidateInfo.name,
            candidateInfo.role,
            interviewState.evaluations
          );
          setReportData(report);
          setGenerating(false);
          
          if (report.overallScore > 7) {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#1D9E75', '#ffffff', '#FFD700']
            });
          }
        } catch (e) {
          console.error(e);
          setGenerating(false);
        }
      };
      
      fetchReport();
    }
  }, []);

  const downloadPDF = () => {
    const input = document.getElementById('report-content');
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = 295; // A4 standard is approx 297, we use 295 for tiny margins
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`MockMate_Report_${candidateInfo.name}.pdf`);
    });
  };

  if (generating) {
    return (
      <div className="min-h-screen bg-lightGray flex flex-col items-center justify-center">
        <div className="flex gap-2 items-center justify-center mb-6">
          <div className="w-4 h-4 bg-green-accent rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-green-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 bg-green-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Comprehensive Report</h2>
        <p className="text-gray-500">Our AI panel is evaluating {interviewState.evaluations.length} responses...</p>
      </div>
    );
  }

  if (!reportData) return <div className="text-center p-20">Failed to generate report.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-dark text-white py-12 px-6 shadow-md mb-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Detailed Interview Report</h1>
            <p className="text-gray-400">Candidate: <span className="text-white font-medium">{candidateInfo.name}</span></p>
            <p className="text-gray-400">Target Role: <span className="text-white font-medium">{candidateInfo.role}</span></p>
            <p className="text-gray-400">Hiring Decision: <span className={`font-bold ${reportData.overallScore >= 7 ? 'text-green-accent' : 'text-orange-400'}`}>{reportData.hiringDecision}</span></p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/')} className="px-6 py-2 rounded-full border border-gray-600 hover:bg-gray-800 transition-colors">Go Home</button>
            <button onClick={downloadPDF} className="px-6 py-2 rounded-full bg-green-accent text-white font-bold hover:bg-opacity-90 shadow-md">Download PDF</button>
          </div>
        </div>
      </div>

      <div id="report-content" className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Scores */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center">
            <h3 className="font-bold text-gray-700 mb-6">Overall Score</h3>
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center bg-gray-50 border-[10px] border-emerald-100 mb-2">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" strokeWidth="10" stroke="#1D9E75" strokeDasharray="440" strokeDashoffset={440 - (440 * (reportData.overallScore / 10))} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
              </svg>
              <div className="text-center">
                <span className="text-4xl font-extrabold text-gray-900">{reportData.overallScore}</span>
                <span className="text-gray-400">/10</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mt-4 leading-snug">
              {reportData.justification}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-700">Technical Round</h3>
              <span className="font-black text-gray-900">{reportData.technicalScore}/10</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Conceptual', value: reportData.technicalBreakdown?.conceptual || 0 },
                { label: 'Applied Logic', value: reportData.technicalBreakdown?.applied || 0 },
                { label: 'System Design', value: reportData.technicalBreakdown?.system || 0 },
                { label: 'Communication', value: reportData.technicalBreakdown?.communication || 0 }
              ].map(param => (
                <div key={param.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600">{param.label}</span>
                    <span className="font-bold text-gray-900">{param.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 rounded-full h-1.5 transition-all" style={{ width: `${(param.value / 10) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-700">HR / Behavioral</h3>
              <span className="font-black text-gray-900">{reportData.hrScore}/10</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Clarity (STAR)', value: reportData.hrBreakdown?.clarity || 0 },
                { label: 'Self-Awareness', value: reportData.hrBreakdown?.selfAwareness || 0 },
                { label: 'Collaboration', value: reportData.hrBreakdown?.collaboration || 0 },
                { label: 'Leadership', value: reportData.hrBreakdown?.leadership || 0 }
              ].map(param => (
                <div key={param.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600">{param.label}</span>
                    <span className="font-bold text-gray-900">{param.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-purple-500 rounded-full h-1.5 transition-all" style={{ width: `${(param.value / 10) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="font-bold text-gray-900 text-xl mb-4">Overall Impression</h3>
            <p className="text-gray-700 leading-relaxed">{reportData.overallImpression}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
              <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Top Strengths
              </div>
              <ul className="space-y-4">
                {reportData.strengths?.map((s, i) => (
                  <li key={i} className="text-sm">
                    <p className="font-bold text-emerald-900">{s.name}</p>
                    <p className="text-emerald-700 mt-1">{s.evidence}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
              <div className="flex items-center gap-2 mb-4 text-orange-700 font-bold">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                Areas to Improve
              </div>
              <ul className="space-y-4">
                 {reportData.weaknesses?.map((w, i) => (
                  <li key={i} className="text-sm">
                    <p className="font-bold text-orange-900">{w.name}</p>
                    <p className="text-orange-700 mt-1">{w.whyItMatters}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
            <h3 className="font-bold text-blue-800 text-lg mb-4">Action Plan</h3>
            <ul className="space-y-3">
              {reportData.weaknesses?.map((w, i) => (
                <li key={i} className="flex gap-3 text-blue-900 text-sm items-start">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">{i+1}</div>
                  <div>
                     <span className="font-bold">Based on "{w.name}": </span>
                     {w.nextStep}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="font-bold text-xl mb-2">Question-by-Question Analysis</h3>
            <p className="text-gray-500 mb-6">Detailed evaluator feedback identifying specific gaps and suggested models.</p>
            <div className="space-y-6">
              {(reportData.qaHighlights || []).map((item, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all hover:shadow-md">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">
                      <span className="text-gray-400 mr-2">Q{idx+1}.</span> 
                      {item.question}
                    </h4>
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-gray-800 text-sm font-bold whitespace-nowrap">
                      Score: {item.score}/10
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r-2xl">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Candidate Response</p>
                      <p className="text-gray-700 italic">"{item.userAnswer || item.answer}"</p>
                    </div>

                    <div className="flex gap-4 items-start pt-2">
                       <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-400">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </div>
                      <div>
                        <p className="font-bold text-orange-900 text-sm mb-1">Evaluator Comment & Gap</p>
                        <p className="text-sm text-gray-700 leading-relaxed mb-2">{item.evaluatorComment}</p>
                        <p className="text-sm text-gray-500 italic">Gap: {item.gapAnalysis}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 border-l-4 border-green-accent p-4 rounded-r-2xl mt-4">
                      <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-2">⭐ Suggested Blueprint Answer</p>
                      <p className="text-green-900 font-medium leading-relaxed">{item.suggestedAnswer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Report;
