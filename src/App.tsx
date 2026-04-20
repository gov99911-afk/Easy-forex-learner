/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { 
  BookOpen, 
  BrainCircuit, 
  Home, 
  LineChart, 
  MessageSquare, 
  Trophy, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Award,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useMemo, useRef } from "react";
import { 
  LineChart as RechartLine, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Badge, 
  INITIAL_LESSONS, 
  LEVELS, 
  Lesson, 
  Trade, 
  UserStats 
} from "./types";

// Initialize AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Mock Market Data Generation ---
const generateMockData = (basePrice: number, points: number = 30) => {
  const data = [];
  let currentPrice = basePrice;
  for (let i = 0; i < points; i++) {
    currentPrice = currentPrice + (Math.random() - 0.5) * 0.002;
    data.push({
      time: i,
      price: Number(currentPrice.toFixed(4)),
    });
  }
  return data;
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'trade' | 'tutor' | 'profile'>('home');
  
  // User Stats State
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('forex_quest_stats');
    return saved ? JSON.parse(saved) : {
      xp: 0,
      level: 0,
      balance: 10000,
      streak: 0,
      badges: [],
      completedLessons: [],
      tradeHistory: []
    };
  });

  // Market State
  const [marketPrice, setMarketPrice] = useState(1.1050);
  const [chartData, setChartData] = useState(() => generateMockData(1.1050));
  
  // Persistence
  useEffect(() => {
    localStorage.setItem('forex_quest_stats', JSON.stringify(stats));
  }, [stats]);

  // Market Simulator Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPrice(prev => {
        const next = prev + (Math.random() - 0.5) * 0.0004;
        const formatted = Number(next.toFixed(4));
        setChartData(current => {
          const newData = [...current.slice(1), { time: Date.now(), price: formatted }];
          return newData;
        });
        return formatted;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentLevelInfo = useMemo(() => {
    const level = LEVELS[stats.level] || LEVELS[LEVELS.length - 1];
    const nextLevel = LEVELS[stats.level + 1];
    return { ...level, nextLevel };
  }, [stats.level]);

  const addXp = (amount: number) => {
    setStats(prev => {
      const newXp = prev.xp + amount;
      let newLevel = prev.level;
      if (LEVELS[newLevel + 1] && newXp >= LEVELS[newLevel + 1].minXp) {
        newLevel++;
      }
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#141414] font-sans pb-20 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {activeTab === 'home' && <HomeView stats={stats} levelInfo={currentLevelInfo} setActiveTab={setActiveTab} />}
        {activeTab === 'learn' && <LearnView stats={stats} addXp={addXp} setStats={setStats} />}
        {activeTab === 'trade' && <TradeView stats={stats} setStats={setStats} marketPrice={marketPrice} chartData={chartData} />}
        {activeTab === 'tutor' && <TutorView />}
        {activeTab === 'profile' && <ProfileView stats={stats} levelInfo={currentLevelInfo} />}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

// --- Views ---

function HomeView({ stats, levelInfo, setActiveTab }: { stats: UserStats, levelInfo: any, setActiveTab: any }) {
  const xpProgress = useMemo(() => {
    if (!levelInfo.nextLevel) return 100;
    const currentMin = levelInfo.minXp;
    const nextMin = levelInfo.nextLevel.minXp;
    return Math.min(((stats.xp - currentMin) / (nextMin - currentMin)) * 100, 100);
  }, [stats.xp, levelInfo]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 max-w-2xl mx-auto space-y-8"
    >
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, Trader!</h1>
          <p className="text-muted-foreground">Ready for your daily mission?</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold">
          <Zap size={18} fill="currentColor" />
          {stats.streak}d
        </div>
      </header>

      {/* Level Card */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest opacity-50">Current Rank</span>
            <h2 className="text-2xl font-bold" style={{ color: levelInfo.color }}>{levelInfo.name}</h2>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold">{stats.xp} XP</span>
            <p className="text-xs opacity-50">/{levelInfo.nextLevel?.minXp || 'Max'}</p>
          </div>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 text-blue-700 hover:bg-blue-100 transition-colors cursor-default">
          <Coins size={32} />
          <span className="text-xs uppercase font-bold tracking-widest opacity-70">Balance</span>
          <span className="text-xl font-bold">${stats.balance.toLocaleString()}</span>
        </div>
        <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 text-purple-700 hover:bg-purple-100 transition-colors cursor-default">
          <Award size={32} />
          <span className="text-xs uppercase font-bold tracking-widest opacity-70">Badges</span>
          <span className="text-xl font-bold">{stats.badges.length}</span>
        </div>
      </div>

      {/* Daily Missions */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Daily Missions</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100">
            <div className={`p-2 rounded-full ${stats.completedLessons.length > 0 ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>
              <CheckCircle2 size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Complete 1 Lesson</p>
              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1">
                <div className={`h-full bg-green-500 rounded-full ${stats.completedLessons.length > 0 ? 'w-full' : 'w-0'}`} />
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600">+50 XP</span>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100">
            <div className={`p-2 rounded-full ${stats.tradeHistory.length > 0 ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>
              <CheckCircle2 size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Place 1 Practice Trade</p>
              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1">
                <div className={`h-full bg-green-500 rounded-full ${stats.tradeHistory.length > 0 ? 'w-full' : 'w-0'}`} />
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600">+100 XP</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Try Now</h3>
        <button 
          onClick={() => setActiveTab('learn')}
          className="w-full flex items-center justify-between p-4 bg-gray-900 text-white rounded-2xl group active:scale-95 transition-all"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-gray-800 rounded-xl">
              <BookOpen />
            </div>
            <div>
              <p className="font-bold">Next Lesson</p>
              <p className="text-xs opacity-70">Learn about Pip calculations</p>
            </div>
          </div>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => setActiveTab('trade')}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl group active:scale-95 transition-all"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <LineChart />
            </div>
            <div>
              <p className="font-bold font-sans">Trading Simulator</p>
              <p className="text-xs text-muted-foreground">Practice without real risk</p>
            </div>
          </div>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </section>
    </motion.div>
  );
}

function LearnView({ stats, addXp, setStats }: { stats: UserStats, addXp: any, setStats: any }) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<{ correct: boolean, index: number } | null>(null);

  const handleLessonComplete = () => {
    if (selectedLesson && !stats.completedLessons.includes(selectedLesson.id)) {
      addXp(selectedLesson.xpReward);
      setStats((prev: any) => ({
        ...prev,
        completedLessons: [...prev.completedLessons, selectedLesson.id]
      }));
    }
    setSelectedLesson(null);
    setQuizMode(false);
  };

  if (selectedLesson) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-6 max-w-2xl mx-auto pb-32"
      >
        <button onClick={() => setSelectedLesson(null)} className="mb-6 flex items-center gap-2 text-sm font-bold">
          <ArrowRight className="rotate-180" size={16} /> Back
        </button>

        {!quizMode ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest p-1 bg-blue-100 text-blue-700 rounded-md">
                {selectedLesson.category}
              </span>
              <h2 className="text-3xl font-bold">{selectedLesson.title}</h2>
            </div>
            
            <div className="prose prose-sm bg-white p-6 rounded-3xl border border-gray-100 leading-relaxed text-gray-700">
              {selectedLesson.content}
            </div>

            <button 
              onClick={() => setQuizMode(true)}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              Take Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Quick Quiz</h2>
            {selectedLesson.quiz.map((q, i) => (
              <div key={i} className="space-y-6">
                <p className="text-lg font-medium">{q.question}</p>
                <div className="space-y-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = quizFeedback?.index === optIdx;
                    const isCorrect = optIdx === q.correctAnswer;
                    
                    let bgColor = "bg-white border-gray-200";
                    if (quizFeedback) {
                      if (isCorrect) bgColor = "bg-green-100 border-green-500 text-green-700";
                      else if (isSelected) bgColor = "bg-red-100 border-red-500 text-red-700";
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={!!quizFeedback}
                        onClick={() => {
                          setQuizFeedback({ correct: optIdx === q.correctAnswer, index: optIdx });
                        }}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${bgColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{opt}</span>
                          {quizFeedback && isCorrect && <CheckCircle2 size={20} />}
                          {quizFeedback && isSelected && !isCorrect && <XCircle size={20} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {quizFeedback && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <p className={`font-bold ${quizFeedback.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {quizFeedback.correct ? "Correct! Well done!" : "Not quite!"}
                    </p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {q.explanation}
                    </p>
                    <button 
                      onClick={() => {
                        setQuizFeedback(null);
                        handleLessonComplete();
                      }}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold"
                    >
                      Complete Lesson
                    </button>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <h2 className="text-2xl font-bold px-2">Learning Path</h2>
      <div className="space-y-4">
        {INITIAL_LESSONS.map((lesson) => {
          const isCompleted = stats.completedLessons.includes(lesson.id);
          const isUnlocked = stats.level >= lesson.unlockedLevel;

          return (
            <button
              key={lesson.id}
              disabled={!isUnlocked}
              onClick={() => setSelectedLesson(lesson)}
              className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all text-left group
                ${isUnlocked ? 'bg-white border-gray-100' : 'bg-gray-50 border-transparent opacity-60'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${isCompleted ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  {isCompleted ? <CheckCircle2 /> : <BookOpen />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{lesson.title}</h3>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-tighter">+{lesson.xpReward} XP</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isUnlocked && <Zap size={14} className="text-gray-400" />}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function TradeView({ stats, setStats, marketPrice, chartData }: { stats: UserStats, setStats: any, marketPrice: number, chartData: any }) {
  const [activeTrade, setActiveTrade] = useState<{ amount: number, type: 'buy' | 'sell', entry: number } | null>(null);
  const [tradeAmount, setTradeAmount] = useState(100);

  const handleTrade = (type: 'buy' | 'sell') => {
    if (stats.balance < tradeAmount) return alert("Not enough virtual funds!");
    setActiveTrade({ amount: tradeAmount, type, entry: marketPrice });
  };

  const closeTrade = () => {
    if (!activeTrade) return;
    const profit = activeTrade.type === 'buy' 
      ? (marketPrice - activeTrade.entry) * (activeTrade.amount * 100)
      : (activeTrade.entry - marketPrice) * (activeTrade.amount * 100);
    
    const finalProfit = Number(profit.toFixed(2));
    
    setStats((prev: any) => ({
      ...prev,
      balance: prev.balance + finalProfit,
      xp: prev.xp + Math.max(10, Math.floor(Math.abs(finalProfit) / 5)), // Reward practice
      tradeHistory: [{
        id: Math.random().toString(36).substr(2, 9),
        pair: 'EUR/USD',
        type: activeTrade.type,
        entryPrice: activeTrade.entry,
        exitPrice: marketPrice,
        profit: finalProfit,
        amount: activeTrade.amount,
        timestamp: Date.now(),
        status: 'closed'
      }, ...prev.tradeHistory]
    }));
    setActiveTrade(null);
  };

  const currentProfit = activeTrade 
    ? (activeTrade.type === 'buy' ? (marketPrice - activeTrade.entry) : (activeTrade.entry - marketPrice)) * (activeTrade.amount * 100)
    : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6 max-w-2xl mx-auto">
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter">EUR/USD</h2>
            <p className="text-xs text-muted-foreground">Real-time Simulation</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-mono font-bold tracking-tighter tabular-nums">{marketPrice.toFixed(4)}</span>
            <div className={`text-xs font-bold flex items-center justify-end gap-1 ${marketPrice > 1.105 ? 'text-green-500' : 'text-red-500'}`}>
              {marketPrice > 1.105 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
              +0.12%
            </div>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartLine data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={false} 
                animationDuration={300}
              />
            </RechartLine>
          </ResponsiveContainer>
        </div>
      </div>

      {!activeTrade ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Trade Amount</span>
            <span className="text-lg font-bold">${tradeAmount}</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="1000" 
            step="10" 
            value={tradeAmount}
            onChange={(e) => setTradeAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleTrade('buy')}
              className="flex items-center justify-center gap-2 py-5 bg-green-500 text-white rounded-3xl font-black text-xl shadow-lg shadow-green-200 active:scale-95 transition-all uppercase"
            >
              <TrendingUp /> Buy
            </button>
            <button 
              onClick={() => handleTrade('sell')}
              className="flex items-center justify-center gap-2 py-5 bg-red-500 text-white rounded-3xl font-black text-xl shadow-lg shadow-red-200 active:scale-95 transition-all uppercase"
            >
              <TrendingDown /> Sell
            </button>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 text-white p-6 rounded-3xl space-y-6 shadow-xl"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-50 font-bold">Open Position</p>
              <h3 className="text-xl font-bold">{activeTrade.type.toUpperCase()} EUR/USD</h3>
            </div>
            <div className={`text-2xl font-mono font-bold ${currentProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {currentProfit >= 0 ? '+' : ''}{currentProfit.toFixed(2)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs opacity-60">
              <span>Entry: {activeTrade.entry}</span>
              <span>Size: ${activeTrade.amount}</span>
            </div>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
               <motion.div 
                animate={{ width: `${Math.min(100, Math.abs(currentProfit))}%` }}
                className={`h-full ${currentProfit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
               />
            </div>
          </div>

          <button 
            onClick={closeTrade}
            className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-sm tracking-tighter"
          >
            Close Position
          </button>
        </motion.div>
      )}

      {/* History */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold px-2">History</h3>
        <div className="space-y-3">
          {stats.tradeHistory.slice(0, 5).map(trade => (
            <div key={trade.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${(trade.profit ?? 0) >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                   {trade.type === 'buy' ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
                </div>
                <div>
                  <p className="font-bold text-sm">{trade.pair} {trade.type.toUpperCase()}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(trade.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
              <span className={`font-mono font-bold ${(trade.profit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(trade.profit ?? 0) >= 0 ? '+' : ''}${trade.profit}
              </span>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function TutorView() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: "Hello! I'm your AI Forex Coach. Ask me anything about trading, charts, or concepts like Pips and Leverage!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, { role: 'user', content: userMsg }].map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are a friendly, gamified Forex tutor for beginners. Use simple language, analogies, and emojis. Keep answers brief (under 100 words)."
        }
      });
      
      setMessages(prev => [...prev, { role: 'model', content: response.text || "I'm not sure, let's look at a lesson!" }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm feeling a bit offline. Try again later!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-64px)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-3xl ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-gray-100 rounded-tl-none text-gray-800'
            } shadow-sm text-sm leading-relaxed whitespace-pre-wrap`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-4 rounded-3xl rounded-tl-none animate-pulse text-gray-400">
              Thinking...
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input 
          type="text" 
          value={input}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What is a Pip?"
          className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="p-3 bg-blue-600 text-white rounded-2xl active:scale-90 transition-transform shadow-lg shadow-blue-200"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function ProfileView({ stats, levelInfo }: { stats: UserStats, levelInfo: any }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-8 max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-xl">
           <User size={48} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Trading Maverick</h2>
          <p className="text-sm font-bold opacity-50 uppercase tracking-widest">{levelInfo.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center">
          <p className="text-3xl font-bold">{stats.completedLessons.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-black">Lessons Ready</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center">
          <p className="text-3xl font-bold">{stats.tradeHistory.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-black">Practice Trades</p>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Badges</h3>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center group cursor-help">
               <Trophy size={24} className="text-gray-300 group-hover:text-blue-200 transition-colors" />
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground italic">Unlock badges by completing special challenges!</p>
      </section>

      <button className="w-full py-4 rounded-2xl border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">
        Reset All Progress
      </button>
    </motion.div>
  );
}

function BottomNav({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: any }) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'learn', icon: BookOpen, label: 'Learn' },
    { id: 'trade', icon: LineChart, label: 'Trade' },
    { id: 'tutor', icon: BrainCircuit, label: 'AI Tutor' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-2 py-3 z-50 flex justify-around">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 min-w-[64px] transition-all relative ${
              isActive ? 'text-blue-600 font-bold' : 'text-gray-400'
            }`}
          >
            <motion.div
              animate={{ y: isActive ? -4 : 0, scale: isActive ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span className="text-[10px] uppercase font-bold tracking-tighter">{tab.label}</span>
            {isActive && (
              <motion.div 
                layoutId="nav-active"
                className="absolute -top-3 w-1 h-1 bg-blue-600 rounded-full"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

