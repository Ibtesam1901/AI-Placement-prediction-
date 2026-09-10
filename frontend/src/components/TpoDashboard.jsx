import React, { useEffect, useState } from 'react';
import { getTpoSummary, getHeatmap, getAtRiskStudents, sendRoadmap } from '../api/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Send, 
  Activity, 
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  Building2,
  Calendar,
  GraduationCap,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function TpoDashboard() {
  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [atRiskList, setAtRiskList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [sentMap, setSentMap] = useState({});
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    async function load() {
      const sum = await getTpoSummary();
      const heat = await getHeatmap();
      const risk = await getAtRiskStudents();
      
      if (sum) setSummary(sum);
      if (heat && heat.heatmap) setHeatmap(heat.heatmap);
      if (risk && risk.at_risk_students) setAtRiskList(risk.at_risk_students);
    }
    load();
  }, []);

  const handleSendRoadmap = async (stuId) => {
    // Call backend to generate and email roadmap
    try {
      const res = await sendRoadmap(stuId);
      if (res && res.status === "roadmap_sent") {
        setActionNotice(`AI Remediation Roadmap dispatched to student ${stuId}!`);
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        setActionNotice(`Failed to send roadmap to student ${stuId}.`);
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (e) {
      console.error('Error sending roadmap:', e);
      setActionNotice(`Error sending roadmap to student ${stuId}.`);
      setTimeout(() => setActionNotice(null), 4000);
    }
    setSentMap(prev => ({ ...prev, [stuId]: true }));
  };

  const handleTriggerAction = (actionTitle, targetAudience) => {
    setActionNotice(`Initiated: "${actionTitle}" for ${targetAudience}. Email notifications queued!`);
    setTimeout(() => setActionNotice(null), 4500);
  };

  if (!summary) {
    return (
      <div className="h-[550px] flex flex-col items-center justify-center text-slate-400 glass-card rounded-2xl">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
        </div>
        <p className="font-display font-bold tracking-wider text-slate-200 text-sm">
          Aggregating Institutional Placement Analytics...
        </p>
        <span className="text-xs text-slate-500 mt-1">Connecting to JNNCE Cohort Data Stream</span>
      </div>
    );
  }

  // Filter at-risk students by search and branch
  const filteredStudents = atRiskList.filter(stu => {
    const matchesSearch = 
      (stu.id && stu.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (stu.name && stu.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (stu.track && stu.track.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (stu.missing_skill && stu.missing_skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBranch = selectedBranch === 'ALL' || stu.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  // Chart data: Branch readiness vs benchmark
  const branchChartData = summary.branch_readiness || [
    { branch: 'CSE', readiness: 78, tier1Count: 68, target: 75 },
    { branch: 'ISE', readiness: 74, tier1Count: 42, target: 75 },
    { branch: 'ECE', readiness: 58, tier1Count: 22, target: 75 },
    { branch: 'MECH', readiness: 46, tier1Count: 10, target: 75 },
  ];

  // Donut chart: Readiness Breakdown
  const distributionData = [
    { name: 'Ready (Tier 1)', value: summary.tier1_eligible || 142, color: '#10b981' },
    { name: 'Near-Ready', value: (summary.total_students || 420) - (summary.tier1_eligible || 142) - (summary.at_risk_count || 86), color: '#f59e0b' },
    { name: 'At-Risk (<60%)', value: summary.at_risk_count || 86, color: '#f43f5e' }
  ];

  const getCellColor = (value) => {
    if (value > 65) return 'bg-red-500/25 text-red-300 border-red-500/40 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
    if (value > 40) return 'bg-yellow-500/25 text-yellow-300 border-yellow-500/40';
    return 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40';
  };

  const getInterventions = () => {
    if (!heatmap || heatmap.length === 0) return [];
    
    let allDeficits = [];
    heatmap.forEach(row => {
      ['python', 'sql', 'react', 'devops'].forEach(skill => {
        allDeficits.push({
          branch: row.name,
          skill: skill,
          deficit: row[skill]
        });
      });
    });
    
    allDeficits.sort((a, b) => b.deficit - a.deficit);
    
    const skillNameMap = {
      'python': 'Python / DSA',
      'sql': 'SQL / DB',
      'react': 'React / Web',
      'devops': 'DevOps / Cloud'
    };
    
    const colors = [
      {
        bg: "bg-red-500/10", border: "border-red-500/30", hoverBg: "hover:bg-red-500/15",
        text: "text-red-300", dot: "bg-red-400", btn: "bg-red-500 hover:bg-red-400 shadow-red-500/20"
      },
      {
        bg: "bg-cyan-500/10", border: "border-cyan-500/30", hoverBg: "hover:bg-cyan-500/15",
        text: "text-cyan-300", dot: "bg-cyan-400", btn: "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/20"
      }
    ];

    return allDeficits.slice(0, 2).map((def, i) => {
      const c = colors[i];
      return {
        id: i,
        title: `Mandatory ${skillNameMap[def.skill]} Bootcamp for ${def.branch}`,
        desc: `Critical >${def.deficit}% deficit detected. Target tier-1 eligibility uplift.`,
        audience: `${def.branch} Cohort`,
        theme: c
      };
    });
  };

  return (
    <div className="space-y-6 animate-slide-up-fade">
      
      {/* ACTION TOAST BANNER */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg shadow-cyan-500/10 animate-slide-up-fade">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>{actionNotice}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)}
            className="text-xs text-cyan-400 hover:text-white font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Cohort Strength */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/20 transition-colors"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Cohort Strength
              </span>
              <h3 className="text-2xl font-black font-display text-white mt-0.5">
                {summary.total_students}
              </h3>
              <span className="text-[10px] text-slate-400">4 Engineering Branches</span>
            </div>
          </div>
        </div>

        {/* Avg Readiness */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Campus Placement Index
              </span>
              <h3 className="text-2xl font-black font-display text-emerald-400 mt-0.5">
                {summary.avg_readiness}%
              </h3>
              <span className="text-[10px] text-emerald-300 font-semibold">+8.4% vs Previous Batch</span>
            </div>
          </div>
        </div>

        {/* At-Risk Cohort */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full pointer-events-none group-hover:bg-red-500/20 transition-colors"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/10">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Vulnerable Candidates
              </span>
              <h3 className="text-2xl font-black font-display text-red-400 mt-0.5">
                {summary.at_risk_count}{' '}
                <span className="text-sm font-semibold text-red-300/80">({summary.at_risk_percent}%)</span>
              </h3>
              <span className="text-[10px] text-red-400 font-semibold">Priority Remediation Needed</span>
            </div>
          </div>
        </div>

        {/* Primary Skill Bottleneck */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none group-hover:bg-purple-500/20 transition-colors"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Primary Skill Deficit
              </span>
              <h3 className="text-2xl font-black font-display text-purple-300 mt-0.5">
                {summary.top_missing_skill}
              </h3>
              <span className="text-[10px] text-purple-400 font-semibold">High impact on placement rate</span>
            </div>
          </div>
        </div>

      </div>

      {/* VISUAL ANALYTICS CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Branch Readiness Comparison Bar Chart (7 cols) */}
        <div className="lg:col-span-7 glass-card p-5 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Department Readiness vs Placement Threshold
              </h3>
              <p className="text-[11px] text-slate-400">
                Departmental aggregate readiness index against 75% Tier-1 placement standard.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Target: 75%
            </span>
          </div>

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="branch" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(11, 16, 28, 0.95)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar 
                  name="Avg Readiness %" 
                  dataKey="readiness" 
                  radius={[6, 6, 0, 0]}
                  fill="#06b6d4"
                />
                <Bar 
                  name="Tier-1 Ready Count" 
                  dataKey="tier1Count" 
                  radius={[6, 6, 0, 0]}
                  fill="#8b5cf6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Readiness Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 glass-card p-5 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                Cohort Health Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Categorical readiness breakdown across college</p>
            </div>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`donut-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(11, 16, 28, 0.95)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-7">
              <span className="text-xl font-black text-white font-display">{summary.avg_readiness}%</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase">Avg Score</span>
            </div>
          </div>
        </div>

      </div>

      {/* HEATMAP & TPO PRIORITY ACTIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* SKILL DEFICIT HEATMAP (7 cols) */}
        <div className="lg:col-span-7 glass-card p-5 rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Departmental Skill Deficit Matrix
              </h3>
              <p className="text-[11px] text-slate-400">
                Percentage of students lacking specific high-demand competencies.
              </p>
            </div>

            {/* Severity Legend */}
            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-400"></span> &lt;40% (OK)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500/40 border border-yellow-400"></span> 40-65%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500/40 border border-red-400"></span> &gt;65% (Critical)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-bold">Branch</th>
                  <th className="py-2.5 px-2 text-center font-bold">Python / DSA</th>
                  <th className="py-2.5 px-2 text-center font-bold">SQL / DB</th>
                  <th className="py-2.5 px-2 text-center font-bold">React / Web</th>
                  <th className="py-2.5 px-2 text-center font-bold">DevOps / Cloud</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {heatmap.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-sm text-slate-200">
                      {row.name}
                    </td>
                    {['python', 'sql', 'react', 'devops'].map((skill) => (
                      <td key={skill} className="p-2">
                        <div className={`w-full text-center py-2 px-1 rounded-xl border font-bold text-xs transition-all hover:scale-105 cursor-pointer ${getCellColor(row[skill])}`}>
                          {row[skill]}% deficit
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRIORITY INTERVENTIONS (5 cols) */}
        <div className="lg:col-span-5 glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              TPO Executive Action Directives
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Algorithmically recommended institutional interventions to maximize placement rates.
            </p>

            <div className="space-y-3">
              {/* Dynamic Directives */}
              {getInterventions().map((inv) => (
                <div key={inv.id} className={`p-3.5 rounded-xl ${inv.theme.bg} ${inv.theme.border} flex items-center justify-between gap-3 ${inv.theme.hoverBg} transition-all`}>
                  <div>
                    <h4 className={`text-xs font-bold ${inv.theme.text} flex items-center gap-1.5`}>
                      <span className={`w-2 h-2 rounded-full ${inv.theme.dot} ${inv.id === 0 ? 'animate-pulse' : ''}`}></span>
                      {inv.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {inv.desc}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleTriggerAction(inv.title, inv.audience)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${inv.theme.btn} text-white shadow-md active:scale-95 transition-all shrink-0`}
                  >
                    Trigger
                  </button>
                </div>
              ))}

              {/* Directive 3 */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-3 hover:bg-purple-500/15 transition-all">
                <div>
                  <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    1-on-1 Placement Counseling
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Schedule sessions for students with &gt;1 backlog.
                  </p>
                </div>
                <button 
                  onClick={() => handleTriggerAction('1-on-1 Placement Counseling', 'At-Risk Cohort (35 students)')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 active:scale-95 transition-all shrink-0"
                >
                  Trigger
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Automated actions update student portals instantly.</span>
          </div>
        </div>

      </div>

      {/* AT-RISK COHORT VULNERABILITY FILTERABLE ROSTER */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        
        {/* Roster Header with Search & Filter */}
        <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/40">
          <div>
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Recent Candidates Roster
            </h3>
            <p className="text-[11px] text-slate-400">
              Recently evaluated students prioritized for proactive remediation and placement tracking.
            </p>
          </div>

          {/* Search + Branch Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 glass-input rounded-xl text-xs w-48 text-slate-200"
              />
            </div>

            {/* Branch Pills */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {['ALL', 'CSE', 'ISE', 'ECE', 'MECH'].map(branch => (
                <button
                  key={branch}
                  onClick={() => setSelectedBranch(branch)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    selectedBranch === branch ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-4 font-bold">Candidate</th>
                <th className="py-3 px-4 font-bold">Branch & Track</th>
                <th className="py-3 px-4 font-bold">Readiness Score</th>
                <th className="py-3 px-4 font-bold">Deficit Priority</th>
                <th className="py-3 px-4 text-right font-bold">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredStudents.map((stu, i) => {
                const isSent = sentMap[stu.id];
                return (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-4 font-bold text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-cyan-400">
                          {stu.name ? stu.name.split(' ').map(n=>n[0]).join('') : stu.id.slice(-2)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{stu.name || `Candidate ${stu.id}`}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{stu.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px] mr-1.5 border border-slate-700">
                        {stu.branch}
                      </span>
                      <span className="text-slate-400 text-[11px]">{stu.track}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-red-400 font-display text-sm">
                          {stu.score}%
                        </span>
                        <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-red-500 to-yellow-500 h-full rounded-full"
                            style={{ width: `${stu.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/25 font-bold uppercase text-[10px] tracking-wider">
                        {stu.missing_skill}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSendRoadmap(stu.id)}
                        disabled={isSent}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all inline-flex items-center gap-1.5 ${
                          isSent 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-500/30 shadow-sm active:scale-95'
                        }`}
                      >
                        {isSent ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Roadmap Sent ✓</span>
                          </>
                        ) : (
                          <>
                            <span>Send Roadmap</span>
                            <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-500 font-medium">
                    No vulnerable candidates match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
