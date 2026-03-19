export interface SteamGame {
  id: string;
  name: string;
  imgUrl: string;
  price?: string;
  reviewScore?: string;
  reviewCount?: string;
  tags?: string[];
  description?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
}

export interface MedicalRecord {
  id: string;
  gameId: string;
  gameName: string;
  imgUrl: string;
  timestamp: number;
  feedback?: 'like' | 'dislike';
  doctorComment: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
