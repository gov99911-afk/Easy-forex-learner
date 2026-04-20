export interface Lesson {
  id: string;
  title: string;
  content: string;
  xpReward: number;
  unlockedLevel: number;
  category: 'Basics' | 'Currency' | 'Market' | 'Risk' | 'Strategy';
  quiz: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface UserStats {
  xp: number;
  level: number;
  balance: number; // virtual money
  streak: number;
  badges: Badge[];
  completedLessons: string[];
  tradeHistory: Trade[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  achievedAt: number;
}

export interface Trade {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  profit?: number;
  amount: number;
  timestamp: number;
  status: 'open' | 'closed';
}

export const LEVELS = [
  { name: 'Beginner', minXp: 0, color: '#94a3b8' },
  { name: 'Trader', minXp: 500, color: '#4ade80' },
  { name: 'Pro', minXp: 2000, color: '#3b82f6' },
  { name: 'Expert', minXp: 5000, color: '#a855f7' },
  { name: 'Legend', minXp: 10000, color: '#f59e0b' },
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'intro',
    title: 'What is Forex?',
    category: 'Basics',
    unlockedLevel: 0,
    xpReward: 100,
    content: `Forex (Foreign Exchange) is the global marketplace for exchanging national currencies. It is the largest financial market in the world, with trillions of dollars traded daily. Imagine you are traveling from the US to Europe - you need to exchange your USD for EUR. That exchange rate is what traders try to predict to make profit!`,
    quiz: [
      {
        question: "What does 'Forex' stand for?",
        options: ["Formal Exchange", "Future Exchange", "Foreign Exchange", "Federal Exchange"],
        correctAnswer: 2,
        explanation: "Forex is a shortened term for Foreign Exchange."
      }
    ]
  },
  {
    id: 'pairs',
    title: 'Currency Pairs',
    category: 'Currency',
    unlockedLevel: 0,
    xpReward: 150,
    content: `In Forex, currencies are always traded in pairs. For example, EUR/USD. The first currency is the 'Base' and the second is the 'Quote'. If the price of EUR/USD is 1.10, it means 1 Euro is worth 1.10 US Dollars.`,
    quiz: [
      {
        question: "In the pair GBP/USD, which is the 'Base' currency?",
        options: ["USD", "GBP", "Neither", "Both"],
        correctAnswer: 1,
        explanation: "The first currency in the pair is always the base currency."
      }
    ]
  },
  {
    id: 'pips',
    title: 'What is a Pip?',
    category: 'Basics',
    unlockedLevel: 1,
    xpReward: 200,
    content: `A 'Pip' stands for 'Point in Percentage'. It's the smallest price move that an exchange rate can make. For most pairs, it's the 4th decimal place. For example, if EUR/USD moves from 1.1050 to 1.1051, it moved by 1 pip!`,
    quiz: [
      {
        question: "How many pips are in a move from 1.1200 to 1.1205?",
        options: ["50 pips", "5 pips", "0.5 pips", "500 pips"],
        correctAnswer: 1,
        explanation: "A move of 0.0005 in a 4-decimal pair is 5 pips."
      }
    ]
  }
];
