import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RefreshCw, Heart, X, Minus, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SteamGame } from '../types';
import { dataManager } from '../services/dataManager';

interface DrawResult {
  game: SteamGame;
  tag: string;
  review: string;
}

interface TagWeight {
  [tag: string]: number;
}

export const DrawSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tagWeights, setTagWeights] = useState<TagWeight>({});
  const [病友Messages, set病友Messages] = useState<string[]>([]);
  const [cardStates, setCardStates] = useState<Record<string, { liked: boolean; disliked: boolean; neutral: boolean; animating: boolean }>>({});
  
  // 音效引用
  const woodenFishSound = useRef<HTMLAudioElement | null>(null);
  const bellSound = useRef<HTMLAudioElement | null>(null);

  // 初始化音效
  useEffect(() => {
    woodenFishSound.current = new Audio('/wooden_fish.mp3');
    bellSound.current = new Audio('/bell.mp3');
  }, []);

  // 初始化默认权重
  useEffect(() => {
    dataManager.initDefaultWeights();
    // 加载权重数据
    const weights = dataManager.getWeights();
    setTagWeights(weights);
  }, []);

  // 生成病友消息
  useEffect(() => {
    const messages = [
      "病友 [张三] 刚刚开出了一帖《星露谷物语》，药效：安神补脑。",
      "病友 [李四] 抽到了《塞尔达传说》，药效：探索精神。",
      "病友 [王五] 获得了《空洞骑士》，药效：挑战自我。",
      "病友 [赵六] 开出了《动物森友会》，药效：放松心情。",
      "病友 [钱七] 抽到了《马里奥奥德赛》，药效：童真回归。"
    ];
    set病友Messages(messages);
  }, []);

  // 抽签算法
  const drawMedicine = async (count: number = 3): Promise<DrawResult[]> => {
    setLoading(true);
    setIsDrawing(true);
    
    // 播放木鱼声
    if (woodenFishSound.current) {
      woodenFishSound.current.loop = true;
      woodenFishSound.current.play().catch(console.error);
    }

    // 使用 dataManager 获取加权随机游戏
    const selectedGames = await dataManager.getWeightedRandomGames(count, tagWeights);

    // 生成评论（模拟）
    const results: DrawResult[] = selectedGames.map(game => {
      const reviews = [
        '这款游戏非常棒，推荐给大家！',
        '画面精美，玩法有趣，值得一试。',
        '沉浸式体验，让人流连忘返。',
        '操作简单，容易上手，适合所有年龄段。',
        '音效出色，剧情引人入胜。'
      ];
      const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
      return {
        game,
        tag: game.tags?.[0] || '待分类',
        review: randomReview
      };
    });

    // 停止木鱼声
    if (woodenFishSound.current) {
      woodenFishSound.current.pause();
      woodenFishSound.current.currentTime = 0;
    }

    // 播放清脆声
    if (bellSound.current) {
      bellSound.current.play().catch(console.error);
    }

    // 重置卡片状态
    const newCardStates: Record<string, { liked: boolean; disliked: boolean; neutral: boolean; animating: boolean }> = {};
    results.forEach(result => {
      newCardStates[result.game.id] = {
        liked: false,
        disliked: false,
        neutral: false,
        animating: false
      };
    });
    setCardStates(newCardStates);

    setDrawResults(results);
    setLoading(false);
    setIsDrawing(false);
    return results;
  };

  // 处理反馈
  const handleFeedback = (game: SteamGame, type: 'like' | 'dislike' | 'neutral') => {
    // 检查是否已经点击过
    const currentState = cardStates[game.id];
    if (!currentState) return;

    // 检查是否已经点击过该类型的按钮
    if (type === 'like' && currentState.liked) return;
    if (type === 'dislike' && currentState.disliked) return;
    if (type === 'neutral' && currentState.neutral) return;

    // 更新卡片状态
    setCardStates(prev => ({
      ...prev,
      [game.id]: {
        ...prev[game.id],
        liked: type === 'like' ? true : prev[game.id].liked,
        disliked: type === 'dislike' ? true : prev[game.id].disliked,
        neutral: type === 'neutral' ? true : prev[game.id].neutral,
        animating: true
      }
    }));

    // 执行反馈逻辑
    switch (type) {
      case 'like':
        // 添加到病历记录
        dataManager.addToHistory(game, 'like');
        // 更新标签权重
        dataManager.updateWeights(game.tags || [], 0.5);
        break;
      case 'dislike':
        // 添加到病历记录
        dataManager.addToHistory(game, 'dislike');
        // 更新标签权重
        dataManager.updateWeights(game.tags || [], -0.5);
        break;
      case 'neutral':
        // 中性反馈不做处理
        break;
    }
    
    // 更新本地权重状态
    setTagWeights(dataManager.getWeights());

    // 动画结束后移除卡片
    setTimeout(() => {
      setDrawResults(prev => prev.filter(result => result.game.id !== game.id));
      setCardStates(prev => {
        const newState = { ...prev };
        delete newState[game.id];
        return newState;
      });
    }, 500);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center space-y-2">
        <p className="font-serif text-xl text-tcm-wood italic">"药到病除，专治各种不服"</p>
      </div>

      {/* 抽签筒 */}
      <div className="relative">
        <motion.div
          className="w-48 h-64 bg-gradient-to-b from-amber-800 to-amber-600 rounded-b-full border-4 border-amber-900 flex flex-col items-center justify-center gap-2 shadow-2xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isDrawing ? { rotate: [0, 5, -5, 5, 0], transition: { duration: 1, repeat: Infinity, repeatType: "reverse" } } : {}}
        >
          <div className="w-32 h-4 bg-amber-900 rounded-full mb-4"></div>
          <motion.button
            onClick={() => drawMedicine(3)}
            disabled={loading}
            className="bg-amber-100 text-amber-900 px-6 py-3 rounded-full font-serif font-bold text-lg shadow-lg hover:bg-amber-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={24} />
            ) : (
              '抽 签'
            )}
          </motion.button>
          <p className="text-amber-100 text-sm font-serif">神医签筒</p>
        </motion.div>
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-b-full">
            <span className="font-serif text-lg text-white animate-pulse">神医正在施法...</span>
          </div>
        )}
      </div>

      {/* 抽签结果 */}
      <AnimatePresence>
        {drawResults.length > 0 && (
          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {drawResults.map((result, index) => (
                <motion.div
                  key={result.game.id}
                  initial={{ opacity: 0, y: 50, rotate: -10 + index * 10 }}
                  animate={cardStates[result.game.id]?.animating ? {
                    opacity: 0,
                    scale: 0.2,
                    rotate: 45,
                    x: "calc(100vw + 100px)",
                    y: "calc(100vh + 100px)",
                    position: "fixed",
                    zIndex: 1000,
                    transition: { duration: 0.5, ease: "easeIn" }
                  } : {
                    opacity: 1,
                    y: 0,
                    rotate: 0,
                    transition: { delay: index * 0.1, type: "spring", stiffness: 100 }
                  }}
                  exit={{ opacity: 0, y: 50 }}
                  className="bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-300 rounded-lg p-4 shadow-lg transform transition-transform hover:scale-105 cursor-pointer"
                  onClick={() => window.open(`https://store.steampowered.com/app/${result.game.id}`, '_blank')}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-32 h-20 relative">
                      <img 
                        src={result.game.imgUrl} 
                        alt={result.game.name} 
                        className="w-full h-full object-cover rounded border border-amber-400" 
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-amber-100 animate-pulse rounded border border-amber-400" style={{ display: 'none' }} />
                    </div>
                    <h3 className="font-bold text-center text-amber-800">{result.game.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {result.game.tags && result.game.tags.length > 0 ? (
                        result.game.tags.slice(0, 6).map((tag, index) => (
                          <span key={index} className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">{tag}</span>
                        ))
                      ) : (
                        <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">待分类</span>
                      )}
                      <span className="text-xs text-amber-600">{result.game.reviewScore}</span>
                    </div>
                    <p className="text-xs text-amber-700 italic text-center line-clamp-3">
                      "{result.review}"
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback(result.game, 'like');
                        }}
                        className={`p-2 rounded-full transition-colors ${cardStates[result.game.id]?.liked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                        disabled={cardStates[result.game.id]?.liked}
                      >
                        <Heart size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback(result.game, 'neutral');
                        }}
                        className={`p-2 rounded-full transition-colors ${cardStates[result.game.id]?.neutral ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        disabled={cardStates[result.game.id]?.neutral}
                      >
                        <Minus size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback(result.game, 'dislike');
                        }}
                        className={`p-2 rounded-full transition-colors ${cardStates[result.game.id]?.disliked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                        disabled={cardStates[result.game.id]?.disliked}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 病友滚动条 */}
      <div className="w-full max-w-4xl mt-8">
        <div className="bg-gradient-to-r from-transparent via-amber-50 to-transparent border-t border-b border-amber-200 py-2 overflow-hidden">
          <motion.div 
            className="flex items-center gap-8 whitespace-nowrap"
            animate={{ x: [-100, -1000, -100] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {病友Messages.map((message, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-amber-700">
                <Trophy size={14} className="text-amber-500" />
                <span>{message}</span>
              </div>
            ))}
            {/* 重复消息以实现无缝滚动 */}
            {病友Messages.map((message, index) => (
              <div key={`copy-${index}`} className="flex items-center gap-2 text-sm text-amber-700">
                <Trophy size={14} className="text-amber-500" />
                <span>{message}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};