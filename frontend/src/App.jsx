import React, { useState, useEffect } from 'react';
import StudentView from './components/StudentView';
import TpoDashboard from './components/TpoDashboard';
import { checkBackendHealth } from './api/client';
import { 
  GraduationCap, 
  BarChart3, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Layers,
  HelpCircle,
  X
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('student');
  const [backendOnline, setBackendOnline] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function verify() {
      const online = await checkBackendHealth();
      if (mounted) setBackendOnline(online);
    }
    verify();
    const interval = setInterval(verify, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 relative overflow-hidden font-sans bg-grid-pattern">
      {/* Dynamic Animated Ambient Glow Lights */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none animate-float-1"></div>
      <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none animate-float-2"></div>
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Top Laser Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500 via-purple-500 to-transparent opacity-80"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap gap-4 items-center justify-between">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group cursor-pointer">
              <div className="w-full h-full bg-[#0b101d] rounded-[10px] flex items-center justify-center">
                <Cpu className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#090d16] animate-pulse"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Campus Guardian <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> v2.5 SHAP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Institutional Placement Prediction & Career Engineering Engine
              </p>
            </div>
          </div>

          {/* Right Toolbar: Tabs + Live Status */}
          <div className="flex items-center gap-3">
            {/* Live Model Connection Status */}
            <div 
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                backendOnline 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              }`}
              title={backendOnline ? "Connected to FastAPI Backend Server" : "Operating in High-Fidelity Standalone Simulation Mode"}
            >
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`}></span>
              <span>{backendOnline ? 'FastAPI Model Live' : 'AI Simulation Active'}</span>
            </div>

            {/* Help / Guide Trigger */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700"
              title="About AI Placement Model & SHAP"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Main Portal View Switcher */}
            <nav className="flex items-center bg-[#0d1322] p-1 rounded-xl border border-slate-700/60 shadow-inner">
              <button
                onClick={() => setActiveTab('student')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'student'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Portal</span>
              </button>

              <button
                onClick={() => setActiveTab('tpo')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'tpo'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>TPO Dashboard</span>
              </button>
            </nav>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="animate-slide-up-fade">
          {activeTab === 'student' ? <StudentView /> : <TpoDashboard />}
        </div>
      </main>

      {/* Footer info banner */}
      <footer className="border-t border-slate-800/80 mt-12 py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 JNNCE AI Research Lab — Placement & Career Analytics Division.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Random Forest Classifier</span>
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-purple-400" /> SHAP TreeExplainer</span>
            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-cyan-400" /> Multi-Track Alignment</span>
          </div>
        </div>
      </footer>

      {/* Info / Explanation Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-slide-up-fade">
          <div className="glass-card max-w-xl w-full p-6 sm:p-8 rounded-2xl border border-slate-700 relative shadow-2xl">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-white">How Campus Guardian AI Works</h3>
                <p className="text-xs text-slate-400">Explainable AI Framework for Student Employability</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed mt-4">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <h4 className="font-semibold text-cyan-400 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> 1. Machine Learning Predictive Core
                </h4>
                <p className="text-xs text-slate-400">
                  Trained on multi-year historical campus placement data utilizing an ensemble Random Forest model, factoring in CGPA, active backlogs, internships, verified projects, and technical skills.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <h4 className="font-semibold text-purple-400 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span> 2. SHAP (SHapley Additive exPlanations)
                </h4>
                <p className="text-xs text-slate-400">
                  Breaks down the "black box" by computing exact positive and negative mathematical feature attributions. Shows you exactly why your score is what it is.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <h4 className="font-semibold text-emerald-400 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 3. Actionable Career Engineering
                </h4>
                <p className="text-xs text-slate-400">
                  Pinpoints specific skill deficits and generates a phased roadmap to turn borderline candidates into Tier-1 product company recruits.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all"
            >
              Got It, Continue Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
