import React from 'react';
import { ExternalLink, Search, Youtube, MessageCircle } from 'lucide-react';
import { SteamGame } from '../types';
import { motion } from 'framer-motion';

interface GameCardProps {
  game: SteamGame;
  doctorQuote?: string;
  steamReview?: string;
  onFeedback?: (id: string, type: 'like' | 'dislike') => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, doctorQuote, steamReview, onFeedback }) => {
  const steamUrl = `https://store.steampowered.com/app/${game.id}`;
  const bilibiliUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(game.name)}`;
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.name)}`;
  const douyinUrl = `https://www.douyin.com/search/${encodeURIComponent(game.name)}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="tcm-card flex flex-col gap-4 max-w-md w-full"
    >
      <div className="relative group overflow-hidden rounded-md border border-tcm-wood">
        <img 
          src={game.imgUrl} 
          alt={game.name} 
          className="w-full h-48 object-cover transition-transform group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 right-2 bg-tcm-red text-tcm-light px-2 py-1 text-xs rounded font-bold">
          {game.price}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-serif text-2xl text-tcm-wood truncate" title={game.name}>
          {game.name}
        </h3>
        
        {game.reviewScore && (
          <div className="text-xs italic text-tcm-green opacity-80">
            脉象：{game.reviewScore.replace(/<[^>]*>?/gm, '')}
          </div>
        )}

        {doctorQuote && (
          <div className="bg-tcm-green/10 p-3 rounded border-l-4 border-tcm-green italic text-sm">
            “{doctorQuote}”
          </div>
        )}

        {steamReview && (
          <div className="text-xs text-tcm-wood/70 bg-white/50 p-2 rounded border border-dashed border-tcm-wood">
            <span className="font-bold">病友医嘱：</span>
            {steamReview}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <a href={steamUrl} target="_blank" rel="noopener noreferrer" className="tcm-button text-xs flex items-center justify-center gap-1 py-1.5">
          <ExternalLink size={14} /> Steam
        </a>
        <a href={bilibiliUrl} target="_blank" rel="noopener noreferrer" className="tcm-button bg-blue-500 hover:bg-blue-600 text-xs flex items-center justify-center gap-1 py-1.5">
          <Search size={14} /> Bilibili
        </a>
        <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="tcm-button bg-red-600 hover:bg-red-700 text-xs flex items-center justify-center gap-1 py-1.5">
          <Youtube size={14} /> YouTube
        </a>
        <a href={douyinUrl} target="_blank" rel="noopener noreferrer" className="tcm-button bg-black hover:bg-gray-800 text-xs flex items-center justify-center gap-1 py-1.5">
          <MessageCircle size={14} /> 抖音
        </a>
      </div>

      {onFeedback && (
        <div className="flex justify-between items-center pt-2 border-t border-tcm-wood/20">
          <span className="text-xs font-bold text-tcm-wood">疗效反馈：</span>
          <div className="flex gap-4">
            <button 
              onClick={() => onFeedback(game.id, 'like')}
              className="text-tcm-green hover:scale-125 transition-transform"
            >
              👍
            </button>
            <button 
              onClick={() => onFeedback(game.id, 'dislike')}
              className="text-tcm-red hover:scale-125 transition-transform"
            >
              👎
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
