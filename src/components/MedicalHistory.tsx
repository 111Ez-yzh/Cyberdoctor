import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dataManager } from '../services/dataManager';

interface Record {
  gameId: string;
  gameName: string;
  timestamp: number;
  attitude: 'like' | 'dislike';
}

export const MedicalHistory: React.FC = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [cureProgress, setCureProgress] = useState(0);

  // 加载病历记录
  useEffect(() => {
    const history = dataManager.getHistory();
    // 只显示喜欢过的游戏
    const likedRecords = history.filter(record => record.attitude === 'like');
    setRecords(likedRecords);
    
    // 计算治愈进度
    const likeCount = likedRecords.length;
    const progress = Math.min(100, (likeCount / 5) * 10);
    setCureProgress(progress);
  }, []);

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-amber-800 font-serif">我的游戏收藏</h2>
        <p className="text-amber-600 mt-2">查看您喜欢过的游戏，点击可直接跳转到Steam</p>
      </div>

      {/* 治愈进度条 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-amber-700 font-medium">治愈进度</span>
          <span className="text-amber-700 font-medium">{Math.round(cureProgress)}%</span>
        </div>
        <div className="w-full h-4 bg-amber-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-green-600"
            initial={{ width: 0 }}
            animate={{ width: `${cureProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-amber-600 mt-1">每增加 5 个喜欢的游戏，进度条增加 10%</p>
      </div>

      {/* 病历记录 */}
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-12 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-600">暂无病历记录</p>
            <p className="text-xs text-amber-500 mt-2">开始抽签并反馈您的游戏体验吧</p>
          </div>
        ) : (
          records.map((record, index) => (
            <motion.div
              key={`${record.gameId}-${record.timestamp}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => window.open(`https://store.steampowered.com/app/${record.gameId}`, '_blank')}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                ❤️
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-amber-800">{record.gameName}</h3>
                <p className="text-xs text-amber-600">{formatTime(record.timestamp)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  喜欢
                </div>
                <span className="text-xs text-amber-600">↗️</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};