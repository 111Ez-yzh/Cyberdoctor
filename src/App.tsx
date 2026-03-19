import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Pill, Flame, History, MessageCircle, Settings, Trophy, Share2, Star } from 'lucide-react';
import { SteamGame, MedicalRecord, Achievement } from './types';
import { dataManager } from './services/dataManager';
import { aiService } from './services/aiService';
import { GameCard } from './components/GameCard';
import { ChatBox } from './components/ChatBox';
import { DrawSection } from './components/DrawSection';
import { MedicalHistory } from './components/MedicalHistory';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'tags' | 'hot' | 'chat' | 'history'>('home');
  const [loading, setLoading] = useState(false);
  const [randomGame, setRandomGame] = useState<{ game: SteamGame; quote: string; review: string } | null>(null);
  const [hotGames, setHotGames] = useState<SteamGame[]>([]);
  const [tagGames, setTagGames] = useState<SteamGame[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [history, setHistory] = useState<MedicalRecord[]>([]);
  const [dailyDose, setDailyDose] = useState<{ game: SteamGame; quote: string } | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<string | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('medical_records');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const loadData = async () => {
      // 加载所有标签
      const allTags = await dataManager.getAllTags();
      setTags(allTags);
      if (allTags.length > 0) {
        setSelectedTag(allTags[0]);
      }

      // 检查每日一剂
      const today = new Date().toDateString();
      const savedDose = localStorage.getItem('daily_dose');
      const doseDate = localStorage.getItem('daily_dose_date');

      if (savedDose && doseDate === today) {
        setDailyDose(JSON.parse(savedDose));
      } else {
        const games = await dataManager.getAllGames();
        if (games.length > 0) {
          const game = games[Math.floor(Math.random() * games.length)];
          const dose = { game, quote: "每日一剂，固本培元。今日主治：心浮气躁。" };
          setDailyDose(dose);
          localStorage.setItem('daily_dose', JSON.stringify(dose));
          localStorage.setItem('daily_dose_date', today);
        }
      }
    };
    loadData();
  }, []);

  const saveToHistory = (game: SteamGame, quote: string) => {
    const newRecord: MedicalRecord = {
      id: Math.random().toString(36).substr(2, 9),
      gameId: game.id,
      gameName: game.name,
      imgUrl: game.imgUrl,
      timestamp: Date.now(),
      doctorComment: quote
    };
    const updatedHistory = [newRecord, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem('medical_records', JSON.stringify(updatedHistory));
  };

  const handleTagSearch = async (tagId: string) => {
    setSelectedTag(tagId);
    setLoading(true);
    const games = await dataManager.getGamesByTag(tagId);
    setTagGames(games);
    setLoading(false);
  };

  const fetchHotGames = async () => {
    setLoading(true);
    const games = await dataManager.getAllGames();
    // 按评分排序，取前 10 个
    const sortedGames = games.sort((a, b) => {
      const scoreA = parseFloat(a.reviewScore || '0');
      const scoreB = parseFloat(b.reviewScore || '0');
      return scoreB - scoreA;
    }).slice(0, 10);
    setHotGames(sortedGames);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'hot') fetchHotGames();
    if (activeTab === 'tags') handleTagSearch(selectedTag);
  }, [activeTab]);

  const handleFeedback = (id: string, type: 'like' | 'dislike') => {
    const updatedHistory = history.map(h => h.gameId === id ? { ...h, feedback: type } : h);
    setHistory(updatedHistory);
    localStorage.setItem('medical_records', JSON.stringify(updatedHistory));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-tcm-green text-tcm-light p-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-tcm-light p-2 rounded-full">
              <Pill className="text-tcm-red" size={24} />
            </div>
            <h1 className="tcm-title !text-tcm-light text-2xl md:text-3xl">电子阳痿神医</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DrawSection />
            </motion.div>
          )}

          {activeTab === 'tags' && (
            <motion.div
              key="tags"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagSearch(tag)}
                    className={`px-4 py-1 rounded-full text-sm font-bold transition-all ${selectedTag === tag ? 'bg-tcm-red text-tcm-light scale-110 shadow-md' : 'bg-tcm-paper text-tcm-wood hover:bg-tcm-green hover:text-tcm-light'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin text-tcm-wood" size={48} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tagGames.map(game => (
                    <GameCard key={game.id} game={game} onFeedback={handleFeedback} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'hot' && (
            <motion.div
              key="hot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-3xl text-center text-tcm-red">江湖热度榜</h2>
              <div className="space-y-4">
                {hotGames.map((game, index) => (
                  <div key={game.id} className="tcm-card flex items-center gap-4 hover:bg-tcm-light transition-colors">
                    <span className="font-serif text-3xl text-tcm-wood w-8">{index + 1}</span>
                    <img src={game.imgUrl} alt={game.name} className="w-20 h-12 object-cover rounded border border-tcm-wood" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h3 className="font-bold truncate">{game.name}</h3>
                      <p className="text-xs opacity-70">{game.price}</p>
                    </div>
                    <a href={`https://store.steampowered.com/app/${game.id}`} target="_blank" rel="noopener noreferrer" className="tcm-button !px-3 !py-1 text-xs">
                      去看看
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ChatBox />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MedicalHistory />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-tcm-paper border-t-2 border-tcm-wood p-2 pb-safe z-50">
        <div className="max-w-4xl mx-auto flex justify-around items-center">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Pill size={20} />} label="开药" />
          <NavButton active={activeTab === 'tags'} onClick={() => setActiveTab('tags')} icon={<Share2 size={20} />} label="社媒" />
          <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageCircle size={24} />} label="问诊" isPrimary={true} />
          <NavButton active={activeTab === 'hot'} onClick={() => setActiveTab('hot')} icon={<Star size={20} />} label="评分" />
          <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20} />} label="病历" />
        </div>
      </nav>

      {history.length === 3 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 z-[60]"
        >
          <Trophy size={18} />
          <span className="text-sm font-bold">成就达成：连吃三剂不阳痿！</span>
        </motion.div>
      )}
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label, isPrimary = false }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isPrimary?: boolean }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 transition-all ${active ? 'text-tcm-red scale-110' : isPrimary ? 'text-tcm-red scale-110 shadow-lg' : 'text-tcm-wood opacity-60 hover:opacity-100'}`}
    style={{ 
      ...(isPrimary && { 
        backgroundColor: active ? '#f59e0b' : '#fef3c7', 
        borderRadius: '16px', 
        padding: '12px 16px',
        border: active ? '3px solid #b45309' : '3px solid #b45309',
        minWidth: '80px',
        boxShadow: active ? '0 0 15px rgba(245, 158, 11, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transform: active ? 'scale(1.15)' : 'scale(1.1)'
      })
    }}
  >
    {icon}
    <span className={`text-[12px] font-bold ${active || isPrimary ? 'text-tcm-red' : ''}`}>{label}</span>
  </button>
);