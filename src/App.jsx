import React, { useState, useEffect } from 'react';
import questionsData from './data/questions.json';
import { 
  Terminal, Shield, CheckCircle, AlertCircle, 
  RefreshCcw, ChevronRight, Cpu, Activity, 
  Database, Wifi, Lock, Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [remainingPool, setRemainingPool] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, answering, revealed, complete
  const [score, setScore] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);

  useEffect(() => {
    // Regex to remove [cite: ...] markers
    const citeRegex = /\s*\[cite:[^\]]*\]/g;
    const cleanText = (text) => text ? text.replace(citeRegex, '').trim() : '';

    // Flatten logic with text cleaning
    const flattened = questionsData.flatMap(a => 
      a.questions.map(q => ({
        ...q,
        question: cleanText(q.question),
        options: q.options.map(opt => cleanText(opt)),
        explanation: cleanText(q.explanation),
        correct_answer: cleanText(q.correct_answer),
        assignmentId: a.assignment,
        poolId: `${a.assignment}-${q.question_number}`
      }))
    );
    setAllQuestions(flattened);
    initTest(flattened);
  }, []);

  const initTest = (pool) => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setRemainingPool(shuffled);
    setScore(0);
    setTotalAttempted(0);
    loadNextQuestion(shuffled);
  };

  const loadNextQuestion = (pool) => {
    if (pool.length === 0) {
      setStatus('complete');
      return;
    }
    setCurrentQuestion(pool[0]);
    setSelectedIdx(null);
    setStatus('answering');
  };

  const normalize = (str) => {
    if (!str) return '';
    // Strip [cite:...] markers
    const withoutCite = str.split(' [cite:')[0].trim().toLowerCase();
    // Strip leading prefixes like 'a.', 'b)', '(c)'
    return withoutCite.replace(/^(\(?[a-z0-9][\.\)]\s*)/i, '').trim();
  };

  const handleOptionSelect = (option, idx) => {
    if (status !== 'answering') return;
    
    setSelectedIdx(idx);
    const isCorrect = normalize(option) === normalize(currentQuestion.correct_answer);
    if (isCorrect) setScore(prev => prev + 1);
    
    setTotalAttempted(prev => prev + 1);
    setStatus('revealed');
  };

  const handleNext = () => {
    const newPool = remainingPool.slice(1);
    setRemainingPool(newPool);
    loadNextQuestion(newPool);
  };

  const handleRestart = () => {
    initTest(allQuestions);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-mono overflow-hidden">
        <div className="relative p-10 border border-terminal-green/30 bg-terminal-green/5 space-y-4">
          <div className="flex items-center gap-4 text-terminal-green">
            <Cpu className="animate-spin duration-[3000ms]" />
            <h1 className="text-xl tracking-[0.3em] uppercase animate-pulse">Initializing Neural Interface</h1>
          </div>
          <div className="w-64 h-1 bg-gray-900 overflow-hidden">
            <div className="w-1/2 h-full bg-terminal-green animate-[loading_2s_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'complete') {
    const percentage = totalAttempted > 0 ? (score / totalAttempted) * 100 : 0;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505]">
        <div className="max-w-2xl w-full cyber-box p-10 space-y-10 bg-black/60">
          <div className="flex items-center justify-between border-b border-gray-800 pb-6">
            <div className="flex items-center gap-4">
              <Shield className="text-terminal-blue" size={40} />
              <h1 className="text-4xl font-black uppercase tracking-tighter italic">Session Terminated</h1>
            </div>
            <Activity className="text-terminal-green animate-pulse" />
          </div>
          
          <div className="grid grid-cols-2 gap-8 py-10">
            <div className="border-l-2 border-terminal-blue pl-6">
              <p className="text-gray-500 uppercase text-xs mb-2 tracking-widest leading-none">Security Clearance</p>
              <p className={cn(
                "text-5xl font-black tracking-tighter italic",
                percentage >= 80 ? "text-terminal-green" : percentage >= 50 ? "text-terminal-amber" : "text-terminal-red"
              )}>
                {percentage.toFixed(1)}%
              </p>
            </div>
            <div className="border-l-2 border-gray-800 pl-6">
              <p className="text-gray-500 uppercase text-xs mb-2 tracking-widest leading-none">Successful Probes</p>
              <p className="text-5xl font-black tracking-tighter text-white italic">{score} / {totalAttempted}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-white/5 border border-gray-800 text-xs text-gray-400 font-mono">
              <p>{">"} ARCHIVING RESULTS...</p>
              <p>{">"} CLEARING CACHE...</p>
              <p>{">"} SYSTEM STANDBY.</p>
            </div>
            <button onClick={handleRestart} className="cyber-button w-full text-xl py-6">
              <RefreshCcw size={24} />
              Re-establish Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCorrectOption = (opt) => normalize(opt) === normalize(currentQuestion.correct_answer);

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-x-hidden p-4 md:p-12 font-mono flex flex-col">
      <div className="scanline" />
      
      {/* Top Header */}
      <nav className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-gray-800 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-terminal-blue bg-terminal-blue/10">
            <Terminal className="text-terminal-blue" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
              IoT Security Core
              <span className="text-[10px] bg-terminal-red px-2 py-0.5 animate-pulse">Live diagnostic</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Node: {remainingPool.length} of {allQuestions.length} remaining</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white/5 border border-gray-800 flex items-center gap-3">
            <Zap size={14} className="text-terminal-amber" />
            <span className="text-xs uppercase font-bold text-gray-400">Score: {score}</span>
          </div>
          <div className="px-4 py-2 bg-white/5 border border-gray-800 flex items-center gap-3">
            <Lock size={14} className="text-terminal-green" />
            <span className="text-xs uppercase font-bold text-gray-400">Status: Secure</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {currentQuestion && (
        <div className="flex-1 max-w-5xl w-full mx-auto space-y-10 relative">
          {/* Question Display */}
          <div className="cyber-box p-8 md:p-12 bg-black/80">
            <div className="flex items-center gap-4 text-terminal-blue mb-6">
              <Database size={16} />
              <span className="text-xs uppercase font-bold tracking-[0.2em]">Assignment {currentQuestion.assignmentId} // Packet#{currentQuestion.question_number}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-white mb-4 italic">
              {currentQuestion.question}
            </h2>
            <div className="flex gap-2">
              <div className="h-1 w-20 bg-terminal-blue" />
              <div className="h-1 w-4 bg-terminal-blue/30" />
              <div className="h-1 w-2 bg-terminal-blue/10" />
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrectAtReveal = status === 'revealed' && isCorrectOption(option);
              const isErrorAtReveal = status === 'revealed' && isSelected && !isCorrectOption(option);
              const isRevealMode = status === 'revealed';

              return (
                <button
                  key={idx}
                  disabled={isRevealMode}
                  onClick={() => handleOptionSelect(option, idx)}
                  className={cn(
                    "option-card text-sm font-bold uppercase tracking-tight group",
                    isRevealMode && isCorrectAtReveal && "border-terminal-green text-terminal-green bg-terminal-green/10 shadow-[0_0_15px_rgba(0,255,65,0.2)]",
                    isRevealMode && isErrorAtReveal && "border-terminal-red text-terminal-red bg-terminal-red/10 shadow-[0_0_15px_rgba(255,0,60,0.2)]",
                    !isRevealMode && "hover:border-terminal-blue"
                  )}
                >
                  <span className="flex-1">{option}</span>
                  {isRevealMode && isCorrectAtReveal && <CheckCircle size={18} />}
                  {isRevealMode && isErrorAtReveal && <AlertCircle size={18} />}
                </button>
              );
            })}
          </div>

          {/* Explanation Area */}
          {status === 'revealed' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="cyber-box p-8 bg-black/90 border-terminal-green/30">
                <div className="flex items-center gap-2 mb-4 text-terminal-green">
                  <Activity size={14} />
                  <span className="text-xs uppercase font-black">Data Analysis Report</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-terminal-green/50 pl-6 py-2 italic font-medium">
                  {currentQuestion.explanation}
                </p>
              </div>

              <button 
                onClick={handleNext}
                className="cyber-button py-8 w-full md:w-auto md:px-20 text-2xl group italic"
              >
                Accept and Next Node
                <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-20 pt-8 border-t border-gray-900 grid grid-cols-2 md:grid-cols-4 gap-4 text-[9px] uppercase font-black text-gray-600 tracking-widest">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-terminal-green rounded-full animate-ping" />
          SYSTEM_UPTIME: {Math.floor(Date.now() / 1000000)}
        </div>
        <div>OPERATOR: ANONYMOUS</div>
        <div className="hidden md:block">LOC: 28.6139° N, 77.2090° E</div>
        <div className="text-right">V.CORE.4.2.0</div>
      </footer>
    </div>
  );
}
