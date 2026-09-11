import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { getPrediction } from '../api/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  UploadCloud, 
  FileText, 
  ChevronRight, 
  Sparkles,
  Award,
  Zap,
  Sliders,
  RefreshCw,
  Printer,
  Compass,
  Briefcase,
  Target,
  Code2,
  Database,
  Cpu,
  Terminal,
  Layers,
  ArrowUpRight,
  User,
  Mail
} from 'lucide-react';

const PRESETS = [
  {
    name: '🌟 Star Performer (CSE)',
    tag: 'Tier 1 Potential',
    data: {
      branch: 'CSE',
      target_track: 'Full-Stack',
      cgpa: 8.8,
      tenth_percent: 92,
      twelfth_percent: 88,
      backlogs: 0,
      python: 1,
      sql: 1,
      react: 1,
      devops: 1,
      internships: 2,
      projects: 3,
      comm_score: 9,
      certifications: 2,
      open_source_commits: 45,
      aptitude_score: 85,
      extracurriculars: 3,
      portfolio_link: 'github.com/starperformer'
    }
  },
  {
    name: '⚡ Borderline Candidate (ECE)',
    tag: 'Near-Ready',
    data: {
      branch: 'ECE',
      target_track: 'Cloud/DevOps',
      cgpa: 7.1,
      tenth_percent: 78,
      twelfth_percent: 72,
      backlogs: 1,
      python: 1,
      sql: 0,
      react: 0,
      devops: 0,
      internships: 0,
      projects: 1,
      comm_score: 6,
      certifications: 1,
      open_source_commits: 12,
      aptitude_score: 65,
      extracurriculars: 1,
      user_name: '',
      user_email: ''
    }
  },
  {
    name: '🛠️ Core Needs Training (MECH)',
    tag: 'High Deficit',
    data: {
      branch: 'MECH',
      target_track: 'Data Analyst',
      cgpa: 5.9,
      tenth_percent: 65,
      twelfth_percent: 58,
      backlogs: 2,
      python: 0,
      sql: 0,
      react: 0,
      devops: 0,
      internships: 0,
      projects: 0,
      comm_score: 4,
      certifications: 0,
      open_source_commits: 0,
      aptitude_score: 40,
      extracurriculars: 0,
      user_name: '',
      user_email: ''
    }
  }
];

export default function StudentView() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('manual'); // manual | csv
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    const element = document.getElementById('pdf-report-content');
    const opt = {
      margin: 5,
      filename: `AI_Placement_Report_${formData.user_name || 'Candidate'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#090d16' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      setIsGeneratingPdf(false);
    });
  };
  
  // What-If Simulator state
  const [simProjects, setSimProjects] = useState(0);
  const [simInternships, setSimInternships] = useState(0);
  const [simClearBacklogs, setSimClearBacklogs] = useState(false);
  const [simLearnSql, setSimLearnSql] = useState(false);
  const [simLearnReact, setSimLearnReact] = useState(false);
  const [simulatedScore, setSimulatedScore] = useState(null);

  const [formData, setFormData] = useState({
    branch: 'CSE',
    target_track: 'Full-Stack',
    cgpa: 7.5,
    tenth_percent: 85,
    twelfth_percent: 82,
    backlogs: 0,
    python: 1,
    sql: 0,
    react: 0,
    devops: 0,
    internships: 0,
    projects: 1,
    comm_score: 7,
    certifications: 1,
    open_source_commits: 0,
    aptitude_score: 40,
    extracurriculars: 0,
    user_name: '',
    user_email: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSliderChange = (name, val) => {
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const applyPreset = async (preset) => {
    setFormData(preset.data);
    await runPredictionWithData(preset.data);
  };

  const runPredictionWithData = async (dataToSubmit) => {
    setLoading(true);
    try {
      const data = await getPrediction({
        ...dataToSubmit,
        cgpa: parseFloat(dataToSubmit.cgpa),
        tenth_percent: parseFloat(dataToSubmit.tenth_percent),
        twelfth_percent: parseFloat(dataToSubmit.twelfth_percent),
        backlogs: parseInt(dataToSubmit.backlogs),
        internships: parseInt(dataToSubmit.internships),
        projects: parseInt(dataToSubmit.projects),
        comm_score: parseInt(dataToSubmit.comm_score),
        python: parseInt(dataToSubmit.python),
        sql: parseInt(dataToSubmit.sql),
        react: parseInt(dataToSubmit.react),
        devops: parseInt(dataToSubmit.devops),
        certifications: parseInt(dataToSubmit.certifications),
        open_source_commits: parseInt(dataToSubmit.open_source_commits),
        aptitude_score: parseInt(dataToSubmit.aptitude_score),
        extracurriculars: parseInt(dataToSubmit.extracurriculars)
      });
      setResult(data);
      // Reset what-if simulator baseline
      if (data) {
        setSimProjects(0);
        setSimInternships(0);
        setSimClearBacklogs(false);
        setSimLearnSql(false);
        setSimLearnReact(false);
        setSimulatedScore(data.readiness_score);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runPredictionWithData(formData);
  };

  // Initial load: trigger Star Performer preset automatically so user sees rich graphics right away!
  useEffect(() => {
    runPredictionWithData(formData);
  }, []);

  // Update What-If simulation score dynamically
  useEffect(() => {
    if (!result) return;
    let boost = 0;
    boost += simProjects * 4;
    boost += simInternships * 6;
    if (simClearBacklogs && formData.backlogs > 0) {
      boost += formData.backlogs * 9;
    }
    if (simLearnSql && formData.sql === 0) boost += 7;
    if (simLearnReact && formData.react === 0) boost += 7;

    const newScore = Math.min(98, Math.max(10, result.readiness_score + boost));
    setSimulatedScore(newScore);
  }, [simProjects, simInternships, simClearBacklogs, simLearnSql, simLearnReact, result]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setLoading(true);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const firstRow = lines[1].split(',').map(v => v.trim());
          
          let parsedData = { ...formData };
          
          headers.forEach((header, i) => {
            if (header === 'branch') parsedData.branch = firstRow[i] || 'CSE';
            else if (header === 'target_track') parsedData.target_track = firstRow[i] || 'Full-Stack';
            else if (['cgpa'].includes(header)) parsedData[header] = parseFloat(firstRow[i]) || 0;
            else if (Object.keys(parsedData).includes(header)) parsedData[header] = parseInt(firstRow[i], 10) || 0;
          });
          
          setFormData(parsedData);
          await runPredictionWithData(parsedData);
        } else {
          setLoading(false);
          alert('Invalid CSV format. Need headers and at least one row of data.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Circular gauge color
  const getGaugeColor = (score) => {
    if (score >= 70) return '#10b981'; // Emerald
    if (score >= 45) return '#f59e0b'; // Amber
    return '#ef4444'; // Rose / Red
  };

  // Radar chart data comparing Student vs Industry Benchmark
  const radarData = [
    { subject: 'Academics', student: Math.min(100, Math.round(formData.cgpa * 10)), benchmark: 75 },
    { subject: 'Tech & Certs', student: Math.min(100, (formData.python * 20 + formData.sql * 20 + formData.react * 20 + formData.devops * 20 + formData.certifications * 10)), benchmark: 75 },
    { subject: 'Practical Exp', student: Math.min(100, (formData.projects * 20) + (formData.internships * 20) + Math.min(20, formData.open_source_commits)), benchmark: 60 },
    { subject: 'Aptitude', student: formData.aptitude_score, benchmark: 75 },
    { subject: 'Communication', student: formData.comm_score * 10, benchmark: 70 },
    { subject: 'Extracurriculars', student: Math.min(100, formData.extracurriculars * 20), benchmark: 40 },
  ];

  return (
    <div className="space-y-6">
      
      {/* PRESET QUICK-LOAD BAR */}
      <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-700/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick Profile Demos:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 hover:border-cyan-500/50 transition-all flex items-center gap-2 group hover:scale-[1.02]"
            >
              <span>{preset.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                preset.tag.includes('Tier 1') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                preset.tag.includes('Near') ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {preset.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PROFILE INPUT ENGINE (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-bl-[120px] pointer-events-none"></div>

            {/* Input Header & Mode Switcher */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-white">Student Profile Engine</h2>
                  <p className="text-xs text-slate-400">Configure parameters for ML inference</p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'manual' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Manual Form
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('csv')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'csv' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Batch CSV
                </button>
              </div>
            </div>

            {activeTab === 'manual' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Branch & Target Track */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Engineering Branch
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full p-2.5 glass-input rounded-xl text-sm font-medium text-slate-100"
                    >
                      <option value="CSE">CSE (Computer Science)</option>
                      <option value="ISE">ISE (Info Science)</option>
                      <option value="ECE">ECE (Electronics)</option>
                      <option value="MECH">MECH (Mechanical)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Target Career Track
                    </label>
                    <select
                      name="target_track"
                      value={formData.target_track}
                      onChange={handleChange}
                      className="w-full p-2.5 glass-input rounded-xl text-sm font-medium text-slate-100"
                    >
                      <option value="Full-Stack">Full-Stack Developer</option>
                      <option value="Cloud/DevOps">Cloud / DevOps Engineer</option>
                      <option value="Data Analyst">Data Analyst / AI</option>
                      <option value="QA">QA / SDET Engineer</option>
                    </select>
                  </div>
                </div>

                {/* CGPA Slider */}
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-cyan-400" /> Cumulative CGPA
                    </label>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {formData.cgpa} / 10.0
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4.0"
                    max="10.0"
                    step="0.1"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={(e) => handleSliderChange('cgpa', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                    <span>4.0 (Min)</span>
                    <span>7.5 (Benchmark)</span>
                    <span>10.0 (Perfect)</span>
                  </div>
                </div>

                {/* 10th & 12th Percentages Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        10th Grade (%)
                      </label>
                      <span className="text-xs font-bold text-slate-400">
                        {formData.tenth_percent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      name="tenth_percent"
                      value={formData.tenth_percent}
                      onChange={(e) => handleSliderChange('tenth_percent', parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        12th Grade (%)
                      </label>
                      <span className="text-xs font-bold text-slate-400">
                        {formData.twelfth_percent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      name="twelfth_percent"
                      value={formData.twelfth_percent}
                      onChange={(e) => handleSliderChange('twelfth_percent', parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                {/* Academic Standing & Practical Experience Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Backlogs */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Active Backlogs</label>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('backlogs', Math.max(0, formData.backlogs - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >-</button>
                      <span className={`text-base font-black ${formData.backlogs > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formData.backlogs}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('backlogs', formData.backlogs + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Project Complexity</label>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('projects', Math.max(0, formData.projects - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >-</button>
                      <span className="text-base font-black text-cyan-400">
                        {formData.projects}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('projects', formData.projects + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>

                  {/* Internships */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Internships</label>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('internships', Math.max(0, formData.internships - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >-</button>
                      <span className="text-base font-black text-purple-400">
                        {formData.internships}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('internships', formData.internships + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Additional Dimensions Grid (Missing ones) */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Certifications */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Certifications</label>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('certifications', Math.max(0, formData.certifications - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >-</button>
                      <span className="text-base font-black text-emerald-400">
                        {formData.certifications}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('certifications', Math.min(5, formData.certifications + 1))}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>

                  {/* Open Source Commits */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">OS Commits</label>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('open_source_commits', Math.max(0, formData.open_source_commits - 5))}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >-</button>
                      <span className="text-base font-black text-amber-400">
                        {formData.open_source_commits}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('open_source_commits', formData.open_source_commits + 5)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>

                  {/* Extracurriculars */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hackathons / Societies</label>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('extracurriculars', Math.max(0, formData.extracurriculars - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >-</button>
                      <span className="text-base font-black text-pink-400">
                        {formData.extracurriculars}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleSliderChange('extracurriculars', Math.min(10, formData.extracurriculars + 1))}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Name & Email Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-400" /> Student Name
                    </label>
                    <input
                      type="text"
                      name="user_name"
                      placeholder="Jane Doe"
                      value={formData.user_name}
                      onChange={handleChange}
                      className="w-full p-2.5 glass-input rounded-xl text-sm font-medium text-slate-100"
                    />
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-400" /> Email Address
                    </label>
                    <input
                      type="email"
                      name="user_email"
                      placeholder="jane@college.edu"
                      value={formData.user_email}
                      onChange={handleChange}
                      className="w-full p-2.5 glass-input rounded-xl text-sm font-medium text-slate-100"
                    />
                  </div>
                </div>

                {/* Aptitude & Problem Solving Score Slider */}
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Quant, Logical & Coding Assessment (0-100)
                    </label>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {formData.aptitude_score} / 100
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    name="aptitude_score"
                    value={formData.aptitude_score}
                    onChange={(e) => handleSliderChange('aptitude_score', parseInt(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                </div>

                {/* Communication Rating Slider */}
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Verbal, Interview & Presentation Score
                    </label>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {formData.comm_score} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    name="comm_score"
                    value={formData.comm_score}
                    onChange={(e) => handleSliderChange('comm_score', parseInt(e.target.value))}
                    className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                </div>

                {/* Technical Competency Matrix */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-cyan-400" /> Core Tech Stack Validated
                    </label>
                    <span className="text-[10px] text-slate-400">Select verified skills</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { key: 'python', label: 'Python / DSA', icon: Terminal },
                      { key: 'sql', label: 'SQL & Relational DB', icon: Database },
                      { key: 'react', label: 'React / Frontend', icon: Code2 },
                      { key: 'devops', label: 'Cloud / DevOps / Docker', icon: Cpu }
                    ].map(skill => {
                      const Icon = skill.icon;
                      const active = Boolean(formData[skill.key]);
                      return (
                        <label
                          key={skill.key}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                            active
                              ? 'border-cyan-500/80 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white'
                              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border text-xs transition-colors ${
                            active ? 'bg-cyan-500 border-cyan-400 text-black font-black' : 'border-slate-600 bg-slate-800'
                          }`}>
                            {active ? '✓' : ''}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            name={skill.key}
                            checked={active}
                            onChange={handleChange}
                          />
                          <Icon className={`w-4 h-4 ${active ? 'text-cyan-300' : 'text-slate-500'}`} />
                          <span className="text-xs font-semibold">{skill.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold font-display text-white text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Computing SHAP Attributions...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Explainable Prediction</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* CSV Upload Dropzone */
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 transition-all cursor-pointer flex flex-col items-center group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mb-1">Upload Batch Students CSV</h4>
                  <p className="text-xs text-slate-400 max-w-xs mb-3">
                    Drag and drop file here, or click to browse. Supports branch, track, and skill columns.
                  </p>
                  <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700">
                    Select .csv File
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                </div>

                {fileName && (
                  <div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {fileName}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}

                <div className="text-left w-full p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Format Guide:</p>
                  <p>Columns: <code className="text-cyan-300">branch, target_track, cgpa, backlogs, python, sql, react, devops, comm_score</code></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: GRAPHICS & PREDICTION DASHBOARD (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center text-center min-h-[550px] border-2 border-dashed border-slate-800">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="w-24 h-24 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-center relative z-10">
                  <Cpu className="w-12 h-12 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-200">Awaiting Profile Parameters</h3>
              <p className="text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
                Choose a candidate preset above or fill out the student parameters on the left to compute real-time placement probability, SHAP drivers, and competency spider radar.
              </p>
            </div>
          ) : (
            <div id="pdf-report-content" className="space-y-6 animate-slide-up-fade p-2 rounded-xl">
              
              {/* TOP KPI ROW: HERO GAUGE + BADGES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* 3D CIRCULAR SCORE GAUGE */}
                <div className="glass-card p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="9"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                        stroke={getGaugeColor(result.readiness_score)}
                        strokeWidth="9"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.readiness_score / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 6px ${getGaugeColor(result.readiness_score)})` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-white font-display">
                        {result.readiness_score}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Placement Odds
                    </span>
                    <h4 className="text-base font-bold text-white font-display mt-0.5">
                      {result.readiness_score >= 70 ? 'Tier 1 Prime' : result.readiness_score >= 45 ? 'Tier 2 Eligible' : 'High Vulnerability'}
                    </h4>
                    <span className="text-[11px] text-cyan-300 font-semibold mt-1 block">
                      Est: {result.salary_bracket}
                    </span>
                  </div>
                </div>

                {/* READINESS BADGE CARD */}
                <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Model Classification
                  </span>
                  <div className="flex items-center gap-3 my-1">
                    <div className={`p-2.5 rounded-xl border ${
                      result.status === 'Ready' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : result.status === 'Near-Ready' 
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {result.status === 'Ready' && <CheckCircle2 className="w-5 h-5" />}
                      {result.status === 'Near-Ready' && <TrendingUp className="w-5 h-5" />}
                      {result.status === 'Needs Training' && <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className={`text-lg font-black font-display ${
                        result.status === 'Ready' ? 'text-emerald-400 text-glow-emerald' :
                        result.status === 'Near-Ready' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {result.status}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">Confidence: {result.track_confidence ? result.track_confidence[formData.target_track] : result.readiness_score}%</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">Based on multi-year cohort calibration</span>
                </div>

                {/* CRITICAL DEFICITS CHIP */}
                <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Identified Bottlenecks
                  </span>
                  <div className="my-1">
                    {result.missing_skills.length === 0 ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Full Track Alignment
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {result.missing_skills.map((skill, i) => (
                          <span 
                            key={i} 
                            className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm"
                          >
                            Missing: {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {result.missing_skills.length} target area{result.missing_skills.length === 1 ? '' : 's'} require remediation
                  </span>
                </div>

              </div>

              {/* ALIGNMENT ACROSS TRACKS */}
              {result.track_confidence && (
                <div className="glass-card p-5 rounded-2xl flex flex-col mt-5 mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      Track Alignment Confidence
                    </h3>
                  </div>
                  <div className="h-48 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={Object.entries(result.track_confidence).map(([k, v]) => ({ name: k, value: v }))} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(11, 16, 28, 0.95)',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                          {Object.entries(result.track_confidence).map(([k, v], index) => (
                            <Cell key={`cell-${index}`} fill={k === formData.target_track ? '#06b6d4' : '#64748b'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* GRAPHICAL CHARTS: SPIDER RADAR & SHAP IMPACT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. COMPETENCY SPIDER RADAR CHART */}
                <div className="glass-card p-5 rounded-2xl flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      Competency Radar Benchmark
                    </h3>
                    <span className="text-[10px] text-cyan-400 font-semibold">vs Industry Standard</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Multi-dimensional comparison across core engineering evaluation pillars.
                  </p>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={78} data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 100]} 
                          tick={{ fill: '#64748b', fontSize: 8 }} 
                          stroke="rgba(255,255,255,0.05)" 
                        />
                        <Radar 
                          name="Student" 
                          dataKey="student" 
                          stroke="#06b6d4" 
                          fill="#06b6d4" 
                          fillOpacity={0.4} 
                        />
                        <Radar 
                          name="Benchmark" 
                          dataKey="benchmark" 
                          stroke="#818cf8" 
                          fill="#818cf8" 
                          fillOpacity={0.15} 
                          strokeDasharray="3 3"
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(11, 16, 28, 0.95)', 
                            borderColor: 'rgba(255,255,255,0.1)', 
                            borderRadius: '10px', 
                            fontSize: '12px' 
                          }} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. SHAP EXPLAINABILITY ATTRIBUTIONS */}
                <div className="glass-card p-5 rounded-2xl flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      SHAP Explainable Feature Drivers
                    </h3>
                    <span className="text-[10px] text-purple-400 font-semibold">Attribution %</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Direct mathematical impact of student traits on the placement probability score.
                  </p>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        layout="vertical" 
                        data={result.shap_impacts} 
                        margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          type="number" 
                          stroke="#64748b" 
                          tick={{ fill: '#94a3b8', fontSize: 10 }} 
                        />
                        <YAxis 
                          dataKey="feature" 
                          type="category" 
                          width={75} 
                          stroke="#64748b" 
                          tick={{ fill: '#94a3b8', fontSize: 11, textTransform: 'capitalize' }} 
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(11, 16, 28, 0.95)', 
                            borderColor: 'rgba(255,255,255,0.1)', 
                            borderRadius: '10px', 
                            fontSize: '12px' 
                          }}
                          formatter={(value, name, props) => {
                            const featureName = props.payload.feature;
                            const isPositive = value >= 0;
                            const sign = isPositive ? '+' : '';
                            return [`${sign}${value}% due to ${featureName.replace('_', ' ')}`, 'SHAP Attribution'];
                          }}
                        />
                        <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                          {result.shap_impacts.map((entry, index) => (
                            <Cell 
                              key={`shap-cell-${index}`} 
                              fill={entry.impact >= 0 ? '#10b981' : '#f43f5e'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* REAL-TIME "WHAT-IF" SIMULATOR SANDBOX */}
              <div className="glass-card p-5 rounded-2xl border border-cyan-500/30 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-display text-white">
                        Career Trajectory "What-If" Simulator
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Simulate the impact of acquiring skills or completing projects in real time.
                      </p>
                    </div>
                  </div>

                  {/* Simulated Score Gauge Result */}
                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700">
                    <span className="text-xs text-slate-400 font-medium">Projected Odds:</span>
                    <span className="text-base font-black text-cyan-400 font-display">
                      {simulatedScore}%
                    </span>
                    {simulatedScore > result.readiness_score && (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center">
                        +{simulatedScore - result.readiness_score}% Jump! ✨
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulation Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  {/* Additional Projects Slider */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-semibold">+ Projects Built</span>
                      <span className="font-bold text-cyan-400">+{simProjects}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      value={simProjects}
                      onChange={(e) => setSimProjects(parseInt(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />
                  </div>

                  {/* Additional Internship Slider */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-semibold">+ Internships Done</span>
                      <span className="font-bold text-purple-400">+{simInternships}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      value={simInternships}
                      onChange={(e) => setSimInternships(parseInt(e.target.value))}
                      className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />
                  </div>

                  {/* Clear Backlogs Simulation */}
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                    simClearBacklogs 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={simClearBacklogs}
                      onChange={(e) => setSimClearBacklogs(e.target.checked)}
                      className="accent-emerald-500"
                    />
                    <span className="font-semibold">Clear All Backlogs</span>
                  </label>

                  {/* Acquire Missing Track Skills */}
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                    simLearnSql 
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={simLearnSql}
                      onChange={(e) => setSimLearnSql(e.target.checked)}
                      className="accent-cyan-400"
                    />
                    <span className="font-semibold">Master SQL & Cloud</span>
                  </label>
                </div>
              </div>

              {/* PERSONALIZED REMEDIATION ROADMAP */}
              <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Personalized AI Action Roadmap
                  </h3>
                  <button 
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2 transition-colors border border-slate-700 disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating PDF...</>
                    ) : (
                      <><Printer className="w-3.5 h-3.5" /> Download PDF Report</>
                    )}
                  </button>
                </div>

                <div className="space-y-3 relative pl-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-transparent">
                  {result.roadmap.map((step, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[27px] top-1.5 w-6 h-6 rounded-full bg-[#0b1120] border-2 border-cyan-400 flex items-center justify-center text-[10px] font-bold text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)] group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                          {step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
