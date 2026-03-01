import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  History, 
  FileText, 
  LogIn, 
  UserPlus, 
  Zap, 
  TrendingUp, 
  Trophy, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
  Eye,
  ArrowRight,
  User,
  ShieldCheck,
  Activity,
  Settings2,
  PlayCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';

// Types
type View = 'dashboard' | 'history' | 'signin' | 'signup';

// Mock Data
const trendData = [
  { over: 0, india: 50, australia: 50 },
  { over: 5, india: 55, australia: 45 },
  { over: 10, india: 52, australia: 48 },
  { over: 15, india: 65, australia: 35 },
  { over: 20, india: 72, australia: 28 },
];

const historyData = [
  { id: 1, date: 'Nov 12, 2023', match: 'India vs Australia', event: 'ICC World Cup Final', type: 'ODI', winProb: 72, result: 'Australia Won', accuracy: 94 },
  { id: 2, date: 'Nov 10, 2023', match: 'South Africa vs England', event: 'T20 Series', type: 'T20', winProb: 58, result: 'England Won', accuracy: 88 },
  { id: 3, date: 'Nov 08, 2023', match: 'Pakistan vs New Zealand', event: 'Warmup Match', type: 'ODI', winProb: 45, result: 'Pakistan Won', accuracy: 12 },
  { id: 4, date: 'Nov 05, 2023', match: 'Sri Lanka vs Bangladesh', event: 'Asia Cup', type: 'T20', winProb: 82, result: 'Sri Lanka Won', accuracy: 99 },
  { id: 5, date: 'Oct 30, 2023', match: 'Netherlands vs Afghanistan', event: 'Qualifiers', type: 'ODI', winProb: 30, result: 'Afghanistan Won', accuracy: 82 },
];

// Components
const Header = ({ currentView, setView, userName }: { currentView: View, setView: (v: View) => void, userName: string }) => (
  <header className="border-b border-white/10 py-4 px-6 mb-8 bg-cricket-dark/50 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('dashboard')}>
        <div className="bg-cricket-green p-2.5 rounded-xl accent-glow">
          <Zap className="w-6 h-6 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">AI Cricket Predictor</h1>
          <p className="text-[10px] md:text-xs text-cricket-green font-medium uppercase tracking-widest">Predict match outcome using AI</p>
        </div>
      </div>
      
      <div className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-400">
        <button 
          onClick={() => setView('dashboard')}
          className={cn("hover:text-cricket-green transition-colors", currentView === 'dashboard' && "text-cricket-green")}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setView('history')}
          className={cn("hover:text-cricket-green transition-colors", currentView === 'history' && "text-cricket-green")}
        >
          Historical Data
        </button>

        <div className="flex gap-3 ml-4 items-center">
          <div className="flex items-center gap-2 mr-4 text-white">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cricket-green to-blue-500 flex items-center justify-center font-bold text-black border border-white/20">
               {userName.substring(0, 2).toUpperCase()}
             </div>
             <span className="text-sm font-medium">{userName}</span>
          </div>
          <button
            onClick={() => setView('signin')}
            className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300 px-4 py-2 rounded-lg transition-all border border-white/5 flex items-center gap-2"
          >
            <LogIn className="w-4 h-4 rotate-180" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Button - shows Logout since user is logged in */}
      <div className="md:hidden flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cricket-green to-blue-500 flex items-center justify-center font-bold text-black border border-white/20 text-xs">
           {userName.substring(0, 2).toUpperCase()}
        </div>
        <button onClick={() => setView('signin')} className="p-2 text-red-400 bg-white/5 rounded-lg border border-white/10">
          <LogIn className="w-5 h-5 rotate-180" />
        </button>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="border-t border-white/5 py-8 mt-12">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
      <p>© 2026 AI Cricket Predictor. All Rights Reserved.</p>
      <div className="flex gap-6">
        <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
        <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
        <a className="hover:text-white transition-colors" href="#">Data Sources</a>
      </div>
    </div>
  </footer>
);

const Dashboard = () => {
  const [formData, setFormData] = useState({
    team1: 'Mumbai Indians',
    team2: 'Chennai Super Kings',
    venue: 'Wankhede Stadium',
    tossWinner: 'Mumbai Indians',
    tossDecision: 'field'
  });

  const [prediction, setPrediction] = useState<{ predicted_winner: string; win_probability: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teams = [
    "Mumbai Indians",
    "Chennai Super Kings",
    "Royal Challengers Bangalore",
    "Kolkata Knight Riders",
    "Sunrisers Hyderabad",
    "Rajasthan Royals",
    "Delhi Capitals",
    "Punjab Kings",
    "Lucknow Super Giants",
    "Gujarat Titans"
  ];

  const venues = [
    "M Chinnaswamy Stadium",
    "Eden Gardens",
    "Wankhede Stadium",
    "Feroz Shah Kotla",
    "Rajiv Gandhi International Stadium, Uppal",
    "MA Chidambaram Stadium",
    "Sawai Mansingh Stadium",
    "Punjab Cricket Association IS Bindra Stadium, Mohali",
    "Dubai International Cricket Stadium",
    "Sharjah Cricket Stadium",
    "Narendra Modi Stadium"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team1: formData.team1,
          team2: formData.team2,
          venue: formData.venue,
          toss_winner: formData.tossWinner,
          toss_decision: formData.tossDecision
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Panel - Input Form */}
      <section className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 rounded-2xl shadow-2xl bg-cricket-dark/30 backdrop-blur border border-white/10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <Settings2 className="w-5 h-5 text-cricket-green" />
            Match Configuration
          </h2>

          <form className="space-y-5" onSubmit={handlePredict}>
            {/* Team Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">Team 1</label>
                <select
                  name="team1"
                  value={formData.team1}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-cricket-green outline-none p-3"
                >
                  {teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">Team 2</label>
                <select
                  name="team2"
                  value={formData.team2}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-cricket-green outline-none p-3"
                >
                   {teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            
            {/* Venue & Toss Decision */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase">Venue</label>
              <select
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-cricket-green outline-none p-3"
              >
                 {venues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">Toss Winner</label>
                <select
                  name="tossWinner"
                  value={formData.tossWinner}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-cricket-green outline-none p-3"
                >
                   {teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">Toss Decision</label>
                <select
                  name="tossDecision"
                  value={formData.tossDecision}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-cricket-green outline-none p-3"
                >
                  <option value="field">Field</option>
                  <option value="bat">Bat</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-cricket-green hover:bg-green-600 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-green-500/20 flex justify-center items-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Activity className="w-5 h-5 animate-spin"/>
                  Analyzing...
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Predict Match Winner
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Right Panel - Results */}
      <section className="lg:col-span-8">
        {prediction ? (
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Trophy className="w-48 h-48 text-yellow-500" />
               </div>

               <div className="relative z-10">
                 <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-4 border border-yellow-500/30">
                   AI Prediction
                 </span>

                 <h3 className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-1">Predicted Winner</h3>
                 <div className="text-4xl md:text-6xl font-black text-white mb-6">
                   {prediction.predicted_winner}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-xs uppercase mb-1">Win Probability</div>
                      <div className="text-3xl font-bold text-cricket-green">
                        {(prediction.win_probability * 100).toFixed(1)}%
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
                        <div
                          className="bg-cricket-green h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${prediction.win_probability * 100}%` }}
                        ></div>
                      </div>
                   </div>

                   <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-xs uppercase mb-1">Match Context</div>
                      <div className="flex flex-col gap-1 text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>Venue:</span>
                          <span className="font-medium text-white">{formData.venue.split(',')[0]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Toss Winner:</span>
                          <span className="font-medium text-white">{formData.tossWinner}</span>
                        </div>
                         <div className="flex justify-between">
                          <span>Decision:</span>
                          <span className="font-medium text-white capitalize">{formData.tossDecision}</span>
                        </div>
                      </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-12 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
            <LayoutDashboard className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium text-gray-400">Ready to Predict</h3>
            <p className="text-center max-w-sm mt-2 opacity-60">
              Select the teams, venue, and toss details on the left to generate an AI-powered match prediction.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

const HistoryView = () => {
  const [team1, setTeam1] = useState('Mumbai Indians');
  const [team2, setTeam2] = useState('Chennai Super Kings');
  const [history, setHistory] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [matchDetails, setMatchDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const teams = [
    "Mumbai Indians",
    "Chennai Super Kings",
    "Royal Challengers Bangalore",
    "Kolkata Knight Riders",
    "Sunrisers Hyderabad",
    "Rajasthan Royals",
    "Delhi Capitals",
    "Punjab Kings",
    "Lucknow Super Giants",
    "Gujarat Titans"
  ];

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/history?team1=${encodeURIComponent(team1)}&team2=${encodeURIComponent(team2)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClick = async (match: any) => {
    setSelectedMatch(match);
    setDetailLoading(true);
    setMatchDetails(null);
    try {
      const res = await fetch(`http://127.0.0.1:5000/match_details/${match.match_id}`);
      if (!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      setMatchDetails(data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, []);

  if (selectedMatch) {
    return (
      <div className="w-full">
        <button
          onClick={() => setSelectedMatch(null)}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to History
        </button>

        <div className="glass-card p-8 rounded-2xl mb-8 relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="text-center md:text-left">
               <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">{selectedMatch.date}</p>
               <h2 className="text-3xl font-black text-white">{selectedMatch.venue.split(',')[0]}</h2>
               <div className="mt-4 flex items-center gap-3 justify-center md:justify-start">
                 <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10">Result</span>
                 <span className="text-green-400 font-bold">{selectedMatch.winner === selectedMatch.toss_winner ? "Defended" : "Chased"} by {selectedMatch.winner}</span>
               </div>
             </div>

             {matchDetails && matchDetails.innings && (
               <div className="flex items-center gap-8 bg-black/30 p-4 rounded-xl border border-white/5">
                 {matchDetails.innings.map((inn: any, idx: number) => (
                   <div key={idx} className="text-center">
                     <p className="text-xs text-slate-500 uppercase font-bold mb-1">{inn.team}</p>
                     <p className="text-2xl font-bold text-white">{inn.total_runs}/{inn.wickets}</p>
                     <p className="text-xs text-slate-600">{inn.overs} ov</p>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

        {detailLoading ? (
          <div className="flex justify-center p-12"><Activity className="w-8 h-8 animate-spin text-cricket-green"/></div>
        ) : matchDetails && (
          <div className="space-y-8">
            {/* Run Rate Chart */}
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-cricket-green w-5 h-5"/>
                Run Rate Progression
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={matchDetails.chart_data}>
                    <defs>
                      <linearGradient id="colorTeam1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTeam2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="over"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}`}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(10, 15, 13, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    {matchDetails.innings.length > 0 && (
                      <Area
                        type="monotone"
                        dataKey={matchDetails.innings[0].team}
                        stroke="#22c55e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTeam1)"
                      />
                    )}
                    {matchDetails.innings.length > 1 && (
                      <Area
                        type="monotone"
                        dataKey={matchDetails.innings[1].team}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTeam2)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {matchDetails.innings.map((inn: any, idx: number) => (
              <div key={idx} className="glass-card rounded-xl overflow-hidden border border-white/10">
                <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cricket-green text-black flex items-center justify-center text-xs">{idx + 1}</span>
                    {inn.team} Innings
                  </h3>
                  <span className="text-sm font-bold text-slate-400">{inn.total_runs}/{inn.wickets} ({inn.overs})</span>
                </div>

                <div className="p-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Batting Scorecard</h4>
                  <div className="overflow-x-auto mb-8">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="text-xs text-slate-500 border-b border-white/5">
                        <tr>
                          <th className="pb-3 pl-2">Batter</th>
                          <th className="pb-3 text-right">R</th>
                          <th className="pb-3 text-right">B</th>
                          <th className="pb-3 text-right">4s</th>
                          <th className="pb-3 text-right pr-2">6s</th>
                          <th className="pb-3 text-right pr-2">SR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {inn.batting.slice(0, 11).map((bat: any, bIdx: number) => (
                          <tr key={bIdx} className="hover:bg-white/5">
                            <td className="py-3 pl-2 font-medium text-white">{bat.batter}</td>
                            <td className="py-3 text-right text-white font-bold">{bat.runs}</td>
                            <td className="py-3 text-right">{bat.balls}</td>
                            <td className="py-3 text-right text-slate-500">{bat.fours}</td>
                            <td className="py-3 text-right pr-2 text-slate-500">{bat.sixes}</td>
                            <td className="py-3 text-right pr-2 text-slate-500">{(bat.runs / bat.balls * 100).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Bowling</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="text-xs text-slate-500 border-b border-white/5">
                        <tr>
                          <th className="pb-3 pl-2">Bowler</th>
                          <th className="pb-3 text-right">O</th>
                          <th className="pb-3 text-right">R</th>
                          <th className="pb-3 text-right pr-2">W</th>
                          <th className="pb-3 text-right pr-2">Econ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {inn.bowling.map((bowl: any, bwIdx: number) => (
                          <tr key={bwIdx} className="hover:bg-white/5">
                            <td className="py-3 pl-2 font-medium text-white">{bowl.bowler}</td>
                            <td className="py-3 text-right">{bowl.overs}</td>
                            <td className="py-3 text-right">{bowl.runs}</td>
                            <td className="py-3 text-right pr-2 font-bold text-cricket-green">{bowl.wickets}</td>
                            <td className="py-3 text-right pr-2 text-slate-500">{(bowl.runs / bowl.overs).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-4xl font-black tracking-tight text-white">Historical Data</h1>
        <p className="text-slate-400 text-lg">Compare past matches between two teams to analyze trends.</p>
      </div>

      {/* Team Selection for History */}
      <div className="glass-card p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-end bg-white/5 border border-white/10">
        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Team 1</label>
          <select
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-cricket-green outline-none p-3"
          >
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Team 2</label>
          <select
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-cricket-green outline-none p-3"
          >
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="bg-cricket-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-500/20 h-[46px] flex items-center justify-center gap-2"
        >
          {loading ? <Activity className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4"/> Fetch History</>}
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-black/20">
            <thead className="bg-white/5 border-b border-white/10 text-xs text-gray-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Venue</th>
                <th className="px-6 py-4">Winner</th>
                <th className="px-6 py-4">Toss Winner</th>
                <th className="px-6 py-4">Decision</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {loading ? (
                 <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Activity className="w-8 h-8 animate-spin mx-auto mb-2 opacity-50"/>
                    Loading matches...
                  </td>
                </tr>
              ) : history.length > 0 ? (
                history.map((match, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleMatchClick(match)}>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{match.date}</td>
                    <td className="px-6 py-4 truncate max-w-[200px]" title={match.venue}>{match.venue}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${match.winner === team1 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                        {match.winner}
                      </span>
                    </td>
                    <td className="px-6 py-4">{match.toss_winner}</td>
                     <td className="px-6 py-4 capitalize">
                      <span className="inline-flex items-center gap-1">
                        {match.toss_decision === 'bat' ? '🏏' : '⚾'} {match.toss_decision}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ChevronRight className="w-4 h-4 mx-auto text-slate-500" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 flex flex-col items-center">
                    <History className="w-12 h-12 mb-3 opacity-20" />
                    No historical matches found between these teams in the dataset.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OldHistoryView = () => (
  <div className="w-full">
    <div className="flex flex-col gap-2 mb-8">
      <h1 className="text-4xl font-black tracking-tight text-white">Historical Data</h1>
      <p className="text-slate-400 text-lg">Detailed performance analytics of our AI models across past international fixtures.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="flex flex-col gap-3 rounded-2xl p-6 glass-card shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Overall Accuracy</p>
          <ShieldCheck className="text-cricket-green w-5 h-5" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-white text-3xl font-bold">89.2%</p>
          <p className="text-cricket-green text-sm font-bold flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> +1.4%
          </p>
        </div>
        <div className="w-full bg-white/5 h-1.5 rounded-full mt-2">
          <div className="bg-cricket-green h-full rounded-full accent-glow" style={{ width: '89.2%' }}></div>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl p-6 glass-card shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Matches Analyzed</p>
          <Activity className="text-slate-400 w-5 h-5" />
        </div>
        <p className="text-white text-3xl font-bold">2,482</p>
        <p className="text-slate-500 text-sm italic">Across all formats (T20, ODI, Test)</p>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl p-6 glass-card shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Winning Predictions</p>
          <Trophy className="text-slate-400 w-5 h-5" />
        </div>
        <p className="text-white text-3xl font-bold">2,214</p>
        <p className="text-slate-500 text-sm italic">Correct winner outcomes identified</p>
      </div>
    </div>

    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
      <div className="px-6 py-5 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-white text-xl font-bold">Match Prediction History</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              className="bg-black/40 border-white/10 text-slate-300 text-sm rounded-lg pl-10 pr-4 py-2 focus:ring-cricket-green focus:border-cricket-green outline-none w-64" 
              placeholder="Search matches..." 
              type="text"
            />
          </div>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5">
              <th className="px-6 py-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Match</th>
              <th className="px-6 py-4 text-gray-400 text-xs font-bold uppercase tracking-wider text-center">Type</th>
              <th className="px-6 py-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Predicted Win %</th>
              <th className="px-6 py-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Actual Result</th>
              <th className="px-6 py-4 text-gray-400 text-xs font-bold uppercase tracking-wider text-right">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {historyData.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-5 text-gray-400 text-sm">{item.date}</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-white font-semibold">{item.match}</span>
                    <span className="text-gray-500 text-xs">{item.event}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={cn(
                    "px-3 py-1 text-[10px] font-bold rounded-full border",
                    item.type === 'ODI' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  )}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="bg-cricket-green h-full" style={{ width: `${item.winProb}%` }}></div>
                    </div>
                    <span className="text-white text-sm font-bold min-w-[3ch]">{item.winProb}%</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-slate-300 text-sm flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", item.accuracy > 50 ? "bg-green-500" : "bg-red-500")}></div>
                    {item.result}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className={cn(
                    "inline-flex items-center justify-center text-xs font-bold px-2.5 py-1 rounded-lg",
                    item.accuracy > 80 ? "bg-green-500/20 text-green-400" : "bg-red-500/10 text-red-400"
                  )}>
                    {item.accuracy}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
        <p className="text-gray-500 text-sm">Showing 1-5 of 1,240 results</p>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-cricket-green text-white text-sm font-bold">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors text-sm font-bold">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors text-sm font-bold">3</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AuthLayout = ({ children, title, subtitle, footer }: { children: React.ReactNode, title: string, subtitle: string, footer: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col stadium-gradient relative overflow-hidden">
    <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
      <img 
        className="w-full h-full object-cover" 
        src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1920" 
        alt="Cricket Stadium"
        referrerPolicy="no-referrer"
      />
    </div>
    
    <header className="flex items-center justify-between px-6 py-4 lg:px-20 border-b border-white/10 relative z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-cricket-green rounded-lg flex items-center justify-center text-cricket-dark">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight text-white">Cricket Predictor AI</h2>
      </div>
    </header>

    <main className="flex-1 flex items-center justify-center p-6 relative z-10">
      <div className="glass-card w-full max-w-[440px] rounded-2xl p-8 lg:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">{title}</h1>
          <p className="text-slate-400 text-sm">{subtitle}</p>
        </div>
        {children}
        <div className="mt-10 text-center text-slate-400 text-sm">
          {footer}
        </div>
      </div>
    </main>

    <footer className="py-6 px-6 text-center text-slate-500 text-xs border-t border-white/5 relative z-10">
      <p>© 2024 Cricket Predictor AI. Trusted by 500k+ analysts worldwide.</p>
    </footer>
  </div>
);

const SignIn = ({ setView }: { setView: (v: View) => void }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setView('dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to view your personalized match insights"
      footer={
        <>
          Don't have an account?
          <button onClick={() => setView('signup')} className="text-cricket-green font-bold hover:underline ml-1">Sign Up Now</button>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green transition-all"
              placeholder="name@example.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-medium text-slate-200">Password</label>
            <a className="text-xs font-semibold text-cricket-green hover:underline" href="#">Forgot Password?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green transition-all"
              placeholder="••••••••"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors" type="button">
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 px-1">
          <input className="w-4 h-4 rounded border-white/20 bg-white/5 text-cricket-green focus:ring-cricket-green" id="remember" type="checkbox" />
          <label className="text-xs text-slate-300 cursor-pointer" htmlFor="remember">Stay signed in for 30 days</label>
        </div>
        <button
          className="w-full bg-cricket-green hover:bg-green-500 disabled:opacity-70 disabled:cursor-not-allowed text-cricket-dark font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <Activity className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

const SignUp = ({ setView }: { setView: (v: View) => void }) => {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Auto login or show success message. Supabase auto logs in if email confirm is off.
      // If email confirm is on, maybe show "Check email".
      setView('dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join the League"
      subtitle="Predict the game, win the glory"
      footer={
        <>
          Already have an account?
          <button onClick={() => setView('signin')} className="text-cricket-green font-bold hover:underline ml-1">Sign In</button>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cricket-green/60 w-5 h-5" />
            <input
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green outline-none transition-all"
              placeholder="John Doe"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cricket-green/60 w-5 h-5" />
            <input
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green outline-none transition-all"
              placeholder="name@example.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cricket-green/60 w-5 h-5" />
            <input
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green outline-none transition-all"
              placeholder="••••••••"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300 ml-1">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cricket-green/60 w-5 h-5" />
            <input
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green outline-none transition-all"
              placeholder="••••••••"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            className="w-full bg-cricket-green hover:bg-green-500 disabled:opacity-70 disabled:cursor-not-allowed text-cricket-dark font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-2"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default function App() {
  const [view, setView] = useState<View>('signin');
  const [loadingSession, setLoadingSession] = useState(true);
  const [userName, setUserName] = useState('John Doe');

  const fetchProfile = async (userId: string) => {
    try {
      // 1. Check profiles table first
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
        return;
      }

      // 2. Fallback to auth metadata if profile not found/empty
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  React.useEffect(() => {
    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setView('dashboard');
        fetchProfile(session.user.id);
      }
      setLoadingSession(false);
    });

    // Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setView('dashboard');
        fetchProfile(session.user.id);
      } else {
        setView('signin');
        setUserName('John Doe'); // Reset
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loadingSession) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  }

  // Intercept setView to handle logout if going to signin manually
  const handleSetView = async (v: View) => {
    if (v === 'signin') {
       const { error } = await supabase.auth.signOut();
       if (error) console.error('Sign out error', error);
    }
    setView(v);
  };

  return (
    <div className="min-h-screen flex flex-col stadium-gradient">
      <AnimatePresence mode="wait">
        {view === 'signin' && (
          <motion.div 
            key="signin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grow flex flex-col"
          >
            <SignIn setView={setView} />
          </motion.div>
        )}
        {view === 'signup' && (
          <motion.div 
            key="signup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grow flex flex-col"
          >
            <SignUp setView={setView} />
          </motion.div>
        )}
        {(view === 'dashboard' || view === 'history') && (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col grow"
          >
            <Header currentView={view} setView={handleSetView} userName={userName} />
            <main className="max-w-7xl mx-auto w-full px-6 pb-12 grow">
              <AnimatePresence mode="wait">
                {view === 'dashboard' ? (
                  <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Dashboard />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="history"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <HistoryView />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
            <Footer />
            
            {/* Bottom Stats Bar (Visible on Dashboard/History) */}
            <div className="bg-cricket-dark/80 backdrop-blur-md border-t border-white/5 py-4 px-6 lg:px-20">
              <div className="flex flex-wrap justify-center gap-8 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                  <span>2026 All Rights Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">|</span>
                  <span>Made by Harshith</span>
                </div>
                <div className="flex items-center gap-2 text-red-500">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span>LIVE</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
