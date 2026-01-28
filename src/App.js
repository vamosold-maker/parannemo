/* eslint-disable */
import React, { useState, useEffect } from 'react';
// import './App.css'; // Removed to fix build error
import { 
  LucideHome, LucidePlus, LucideSearch,
  Search, ExternalLink, Info, ShoppingBag, 
  Crown, PlusCircle, X, Lock, DollarSign, User, Globe, 
  AlertTriangle, Flag, Clock, Zap, CheckSquare, EyeOff, 
  ShieldAlert, Trash2, Megaphone, Gift, ArrowRight, Smile,
  ChevronDown, ChevronUp, Copy, Terminal, Tag, Mail, LogOut,
  Image as ImageIcon, FileText, Scale, Bot, Cpu, Heart, Coins, Eye, RotateCw, Loader2, HelpCircle, Sparkles, Filter,
  Video, Music, Code, PenTool, Briefcase, Upload, Shield // ✅ Added Shield icon
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

// --- Safe Firebase Init ---
let app = null;
let auth = null;
let db = null;
let storage = null;
let appId = 'paran-nemo-default';

try {
 const firebaseConfig = {
  apiKey: "AIzaSyCl6V2eaXVQ1t2sHsv1xFnuuhQK1gQrHTA",
  authDomain: "parannemo-cf9f2.firebaseapp.com",
  projectId: "parannemo-cf9f2",
  storageBucket: "parannemo-cf9f2.firebasestorage.app",
  messagingSenderId: "742987276997",
  appId: "1:742987276997:web:e09e15b0963bd6dc6b86ac",
  measurementId: "G-SQQVDD4V45"
};
  
  if (typeof __app_id !== 'undefined') {
      appId = __app_id;
  }

  if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    console.log("Running in Demo Mode (No Firebase Config)");
  }
} catch (e) {
  console.error("Firebase Init Error:", e);
}

// --- Constants ---
const BLIND_THRESHOLD_SCORE = 5; 
const REVENUE_PER_XP = 0.5; 
const MASTER_KEY = "justnix0513"; 
const COLLECTION_NAME = 'gems'; // Firestore Collection Name

// Revenue calculation logic
const calculateRevenue = (xp) => {
    let revenue = 0;
    if (xp <= 50) {
        revenue = 0; 
    } else if (xp <= 500) {
        revenue = (xp - 50) * 0.2;
    } else if (xp <= 2000) {
        revenue = 90 + (xp - 500) * 0.5;
    } else {
        revenue = 840 + (xp - 2000) * 1.2;
    }
    return Math.floor(revenue);
};

// AI Models List
const AI_MODELS = [
    { id: 'ChatGPT', label: 'ChatGPT', color: 'bg-emerald-500', text: 'text-white' },
    { id: 'Gemini', label: 'Gemini', color: 'bg-blue-500', text: 'text-white' },
    { id: 'Claude', label: 'Claude', color: 'bg-orange-600', text: 'text-white' },
    { id: 'GitHub Copilot', label: 'Copilot', color: 'bg-slate-900', text: 'text-white' },
    { id: 'Cursor', label: 'Cursor', color: 'bg-stone-800', text: 'text-white' },
    { id: 'Replit', label: 'Replit', color: 'bg-orange-500', text: 'text-white' },
    { id: 'Manus', label: 'Manus', color: 'bg-gray-900', text: 'text-white' },
    { id: 'Perplexity', label: 'Perplexity', color: 'bg-teal-600', text: 'text-white' },
    { id: 'Antigravity', label: 'Antigravity', color: 'bg-violet-600', text: 'text-white' },
    { id: 'Grok', label: 'Grok', color: 'bg-slate-700', text: 'text-white' },
    { id: 'Waiting', label: 'Coming Soon', color: 'bg-gray-300', text: 'text-gray-600' },
    { id: 'Other', label: 'Other', color: 'bg-gray-400', text: 'text-white' }
];

// Categories List for Dropdown
const CATEGORY_LIST = [
  "Investing", "Social", "Business", "Coding", "Writing", 
  "Education", "Gaming", "Art", "Video", "Music", 
  "Shopping", "Travel", "Law", "Pet", "Dream", 
  "Health", "Assignments", "RealEstate", "Startup", "Other"
].sort();

// --- Mock Data (30 High Quality Items) ---
const INITIAL_GEMS = [
  // 1. Investing
  {
    id: 1,
    title: "Bitcoin Scalping Expert",
    nickname: "CoinKing",
    password: "1234",
    description: "Specialized in analyzing charts from Upbit and Binance. Advises buy/sell timing based on RSI.",
    prompt: "You are a Wall Street trader. Analyze this chart image for RSI and Bollinger Bands.",
    images: ["https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800",
    tags: ["Investing", "Crypto", "Finance"],
    xp: 25000, 
    views: 85420,
    gemLink: "https://gemini.google.com/app",
    affiliateLink: "https://binance.com",
    affiliateText: "Get 20% Fee Discount",
    type: "tool",
    hall: "Investing", 
    aiModel: "Gemini", 
    reportScore: 0
  },
  {
    id: 2,
    title: "Insta Vibe Caption Bot",
    nickname: "MarketerK",
    password: "0000",
    description: "Generates emotional captions and hashtags for your Instagram photos.",
    prompt: "Analyze this photo's mood and write an Instagram caption in a calm tone.",
    images: ["https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
    tags: ["Social", "Marketing", "Instagram"],
    xp: 120,
    views: 3400,
    gemLink: "https://gemini.google.com/app",
    affiliateLink: "https://coupang.com",
    affiliateText: "Best Lighting Deal",
    type: "tool",
    hall: "Social", 
    aiModel: "ChatGPT", 
    reportScore: 0
  },
  {
    id: 3,
    title: "Biz Email Pro",
    nickname: "BizGuru",
    password: "biz",
    description: "Translates rough drafts into polite and formal Business English.",
    prompt: "Act as a professional secretary. Rewrite this email to be formal.",
    images: ["https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=800",
    tags: ["Business", "English", "Office"],
    xp: 890,
    views: 8900,
    gemLink: "https://gemini.google.com/app",
    affiliateLink: "https://amazon.com",
    affiliateText: "Productivity Mouse",
    type: "tool",
    hall: "Business", 
    aiModel: "Manus", 
    reportScore: 0
  },
  {
    id: 4,
    title: "Python Error Fixer",
    nickname: "DevKim",
    password: "code",
    description: "Paste your error message. Explains the cause and solution.",
    prompt: "You are a Python expert. Analyze this error and fix it.",
    images: ["https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800",
    tags: ["Coding", "Python", "Dev"],
    xp: 1540,
    views: 12000,
    gemLink: "https://chatgpt.com",
    affiliateLink: "https://inflearn.com",
    affiliateText: "Python Course Deal",
    type: "tool",
    hall: "Coding", 
    aiModel: "Claude", 
    reportScore: 0
  },
  {
    id: 5,
    title: "Fantasy World Builder",
    nickname: "StoryTel",
    password: "111",
    description: "Helps set up magic systems, nations, and races for novels.",
    prompt: "Create a magic system based on elements.",
    images: ["https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
    tags: ["Novel", "Writing", "Creative"],
    xp: 320,
    views: 1500,
    gemLink: "https://chatgpt.com",
    affiliateLink: "https://yes24.com",
    affiliateText: "Bestseller Books",
    type: "tool",
    hall: "Writing", 
    aiModel: "ChatGPT", 
    reportScore: 0
  },
  {
    id: 13,
    title: "React Boilerplate Gen",
    nickname: "Frontend",
    password: "react",
    description: "Generate React structure in 3 mins.",
    prompt: "Create a React boilerplate with Tailwind CSS.",
    images: ["https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
    tags: ["Coding", "React", "WebDev"],
    xp: 2800,
    views: 19500,
    gemLink: "https://github.com/features/copilot",
    affiliateLink: "https://udemy.com",
    affiliateText: "React Course Deal",
    type: "tool",
    hall: "Coding", 
    aiModel: "GitHub Copilot", 
    reportScore: 0
  },
  {
    id: 7,
    title: "US ETF Analyzer",
    nickname: "WarrenB",
    password: "rich",
    description: "Analyzes status of SPY, QQQ.",
    prompt: "Analyze market sentiment for QQQ.",
    images: ["https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800",
    tags: ["Stock", "Investing", "ETF"],
    xp: 560,
    views: 4100,
    gemLink: "https://gemini.google.com",
    affiliateLink: "https://tossinvest.com",
    affiliateText: "Free Fees Event",
    type: "tool",
    hall: "Investing", 
    aiModel: "Gemini", 
    reportScore: 0
  },
  {
    id: 8,
    title: "Excel Macro Master",
    nickname: "ExcelGod",
    password: "xls",
    description: "Solves complex Excel formulas.",
    prompt: "I need a formula to compare columns.",
    images: ["https://images.unsplash.com/photo-1543286386-713df548e9cc?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1543286386-713df548e9cc?auto=format&fit=crop&q=80&w=800",
    tags: ["Excel", "Work", "Office"],
    xp: 2100,
    views: 18000,
    gemLink: "https://chatgpt.com",
    affiliateLink: "https://microsoft.com",
    affiliateText: "Office 365 Deal",
    type: "tool",
    hall: "Business", 
    aiModel: "Manus", 
    reportScore: 0
  },
  {
    id: 9,
    title: "Diet Meal Planner",
    nickname: "Healthy",
    password: "food",
    description: "Creates diet plans with fridge ingredients.",
    prompt: "I have eggs and tofu. Suggest a recipe.",
    images: ["https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
    tags: ["Health", "Diet", "Cooking"],
    xp: 80,
    views: 500,
    gemLink: "https://chatgpt.com",
    affiliateLink: "https://coupang.com",
    affiliateText: "Diet Food Deal",
    type: "tool",
    hall: "Social", 
    aiModel: "Claude", 
    reportScore: 0
  },
  {
    id: 10,
    title: "Report Draft Generator",
    nickname: "A+Student",
    password: "univ",
    description: "Writes report outlines based on topics.",
    prompt: "Write an outline for a report on AI.",
    images: ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800",
    tags: ["College", "Assignment", "Study"],
    xp: 3300,
    views: 29000,
    gemLink: "https://chatgpt.com",
    affiliateLink: "https://grammarly.com",
    affiliateText: "Free Grammar Check",
    type: "tool",
    hall: "Assignments", 
    aiModel: "Manus", 
    reportScore: 0
  },
  {
    id: 11,
    title: "TRPG Dungeon Master",
    nickname: "DungeonM",
    password: "game",
    description: "AI DM for D&D campaigns.",
    prompt: "Act as a DM for D&D 5e.",
    images: ["https://images.unsplash.com/photo-1642430588661-d790d96d2e61?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1642430588661-d790d96d2e61?auto=format&fit=crop&q=80&w=800",
    tags: ["Game", "TRPG", "Fantasy"],
    xp: 450,
    views: 2200,
    gemLink: "https://chatgpt.com",
    affiliateLink: "https://steam.com",
    affiliateText: "Game Discounts",
    type: "tool",
    hall: "Gaming", 
    aiModel: "ChatGPT", 
    reportScore: 0
  },
  {
    id: 12,
    title: "Interview Coach",
    nickname: "Interview",
    password: "job",
    description: "Predicts interview questions from resume.",
    prompt: "Review resume and generate questions.",
    images: ["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    tags: ["Job", "Interview", "Business"],
    xp: 920,
    views: 6700,
    gemLink: "https://chatgpt.com",
    affiliateLink: "https://linkedin.com",
    affiliateText: "LinkedIn Premium",
    type: "tool",
    hall: "Business", 
    aiModel: "Claude", 
    reportScore: 0
  },
  {
    id: 14,
    title: "Dating Psychology",
    nickname: "LoveGuru",
    password: "love",
    description: "Analyzes chat tones for dating advice.",
    prompt: "Analyze this chat tone.",
    images: ["https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&q=80&w=800",
    tags: ["Social", "Dating", "Advice"],
    xp: 8500,
    views: 45000,
    gemLink: "https://chatgpt.com",
    affiliateLink: "https://tinder.com",
    affiliateText: "App Free Trial",
    type: "tool",
    hall: "Social", 
    aiModel: "ChatGPT", 
    reportScore: 0
  },
  {
    id: 15,
    title: "Real Estate Comparator",
    nickname: "EstateAI",
    password: "house",
    description: "Compares 3 apartment complexes.",
    prompt: "Compare these apartments.",
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
    tags: ["RealEstate", "Investing", "Home"],
    xp: 620,
    views: 2800,
    gemLink: "https://gemini.google.com",
    affiliateLink: "https://zigbang.com",
    affiliateText: "Moving Support",
    type: "tool",
    hall: "Investing", 
    aiModel: "Gemini", 
    reportScore: 0
  },
  {
    id: 16,
    title: "Lowest Price Finder",
    nickname: "ShopMaster",
    password: "shop",
    description: "Finds global lowest prices.",
    prompt: "Find lowest price for Sony headphones.",
    images: ["https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
    tags: ["Shopping", "Deal", "Price"],
    xp: 4100,
    views: 21000,
    gemLink: "https://perplexity.ai",
    affiliateLink: "https://amazon.com",
    affiliateText: "Prime Free Trial",
    type: "tool",
    hall: "Shopping", 
    aiModel: "Perplexity", 
    reportScore: 0
  },
  {
    id: 17,
    title: "X Trend Analyzer",
    nickname: "TrendX",
    password: "x",
    description: "Summarizes Twitter trends.",
    prompt: "Summarize X trends on AI.",
    images: ["https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&q=80&w=800",
    tags: ["Marketing", "Trend", "Analysis"],
    xp: 1200,
    views: 5600,
    gemLink: "https://grok.x.ai",
    affiliateLink: "https://twitter.com",
    affiliateText: "X Premium",
    type: "tool",
    hall: "Business", 
    aiModel: "Grok", 
    reportScore: 0
  },
  {
    id: 18,
    title: "Legacy Code Refactor",
    nickname: "CleanCode",
    password: "ref",
    description: "Cleans up spaghetti code.",
    prompt: "Refactor this code.",
    images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    tags: ["Coding", "Refactoring", "Dev"],
    xp: 3800,
    views: 18000,
    gemLink: "https://cursor.sh",
    affiliateLink: "https://cursor.sh",
    affiliateText: "Pro Plan Free",
    type: "tool",
    hall: "Coding", 
    aiModel: "Cursor", 
    reportScore: 0
  },
  {
    id: 19,
    title: "Math Solver",
    nickname: "MathTutor",
    password: "math",
    description: "Solves math problems from photos.",
    prompt: "Solve this calculus.",
    images: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
    tags: ["Education", "Math", "Study"],
    xp: 2200,
    views: 9800,
    gemLink: "https://gemini.google.com",
    affiliateLink: "https://megastudy.net",
    affiliateText: "Pass Discount",
    type: "tool",
    hall: "Education", 
    aiModel: "Gemini", 
    reportScore: 0
  },
  {
    id: 20,
    title: "SWOT Analysis Bot",
    nickname: "Startupper",
    password: "ceo",
    description: "Performs SWOT analysis for business ideas.",
    prompt: "SWOT analysis for coffee shop.",
    images: ["https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    tags: ["Business", "Startup", "Plan"],
    xp: 5100,
    views: 32000,
    gemLink: "https://manus.ai",
    affiliateLink: "https://wanted.co.kr",
    affiliateText: "Job Posting Free",
    type: "tool",
    hall: "Business", 
    aiModel: "Manus", 
    reportScore: 0
  },
  {
    id: 21,
    title: "Lofi Beat Maker",
    nickname: "Beats",
    password: "music",
    description: "Generates copyright-free lofi beats.",
    prompt: "Create lofi hip hop beat.",
    images: ["https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800",
    tags: ["Music", "BGM", "YouTube"],
    xp: 1800,
    views: 7500,
    gemLink: "https://suno.ai",
    affiliateLink: "https://epidemicsound.com",
    affiliateText: "30 Days Free",
    type: "tool",
    hall: "Music", 
    aiModel: "Other", 
    reportScore: 0
  },
  {
    id: 22,
    title: "Webtoon Character Gen",
    nickname: "Webtoonist",
    password: "art",
    description: "Draws webtoon style characters.",
    prompt: "Draw a character with blue hair.",
    images: ["https://images.unsplash.com/photo-1560932669-5c98d0092147?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1560932669-5c98d0092147?auto=format&fit=crop&q=80&w=800",
    tags: ["Art", "Webtoon", "Design"],
    xp: 3300,
    views: 14200,
    gemLink: "https://antigravity.ai",
    affiliateLink: "https://wacom.com",
    affiliateText: "Tablet Sale",
    type: "tool",
    hall: "Art", 
    aiModel: "Antigravity", 
    reportScore: 0
  },
  {
    id: 23,
    title: "Essay Polisher",
    nickname: "Poet",
    password: "book",
    description: "Makes text emotional and poetic.",
    prompt: "Rewrite professionally.",
    images: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
    tags: ["Writing", "Essay", "Edit"],
    xp: 950,
    views: 3100,
    gemLink: "https://claude.ai",
    affiliateLink: "https://brunch.co.kr",
    affiliateText: "Author Apply",
    type: "tool",
    hall: "Writing", 
    aiModel: "Claude", 
    reportScore: 0
  },
  {
    id: 24,
    title: "1-Min Website Deploy",
    nickname: "SpeedCoder",
    password: "web",
    description: "Deploys HTML code instantly.",
    prompt: "Deploy this HTML.",
    images: ["https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800",
    tags: ["Coding", "Web", "Deploy"],
    xp: 2500,
    views: 11000,
    gemLink: "https://replit.com",
    affiliateLink: "https://vercel.com",
    affiliateText: "Pro Discount",
    type: "tool",
    hall: "Coding", 
    aiModel: "Replit", 
    reportScore: 0
  },
  {
    id: 25,
    title: "AI Video Creator",
    nickname: "MovieMaker",
    password: "mov",
    description: "Generates video from text.",
    prompt: "Cinematic drone shot of a futuristic city at sunset.",
    images: ["https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=800",
    tags: ["Video", "YouTube", "GenAI"],
    xp: 6200,
    views: 52000,
    gemLink: "https://runwayml.com",
    affiliateLink: "https://adobe.com",
    affiliateText: "Premiere Sale",
    type: "tool",
    hall: "Video", 
    aiModel: "Other", 
    reportScore: 0
  },
  {
    id: 26,
    title: "Travel Planner AI",
    nickname: "TripGuide",
    password: "trip",
    description: "Plans your perfect trip itinerary based on your preferences.",
    prompt: "Plan a 3-day trip to Kyoto.",
    images: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800",
    tags: ["Travel", "Plan", "Kyoto"],
    xp: 1500,
    views: 6000,
    gemLink: "https://chatgpt.com",
    affiliateLink: "https://agoda.com",
    affiliateText: "Hotel Deal",
    type: "tool",
    hall: "Social", // Lifestyle fits Social
    aiModel: "ChatGPT", 
    reportScore: 0
  },
  {
    id: 27,
    title: "Legal Document Drafter",
    nickname: "LawBot",
    password: "law",
    description: "Drafts simple legal documents and contracts.",
    prompt: "Draft a freelance contract.",
    images: ["https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
    tags: ["Law", "Contract", "Work"],
    xp: 2100,
    views: 8500,
    gemLink: "https://claude.ai",
    affiliateLink: "https://legalzoom.com",
    affiliateText: "Legal Service",
    type: "tool",
    hall: "Business", 
    aiModel: "Claude", 
    reportScore: 0
  },
  {
    id: 28,
    title: "Pet Behavior Analyst",
    nickname: "PetWhisperer",
    password: "dog",
    description: "Analyzes pet behavior from description or video.",
    prompt: "Why is my dog barking at night?",
    images: ["https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800",
    tags: ["Pet", "Dog", "Cat"],
    xp: 3400,
    views: 12500,
    gemLink: "https://gemini.google.com",
    affiliateLink: "https://chewy.com",
    affiliateText: "Pet Food Sale",
    type: "tool",
    hall: "Social", 
    aiModel: "Gemini", 
    reportScore: 0
  },
  {
    id: 29,
    title: "Dream Interpreter",
    nickname: "Sandman",
    password: "sleep",
    description: "Interprets your dreams and gives meanings.",
    prompt: "I dreamt of flying over the ocean.",
    images: ["https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=800",
    tags: ["Dream", "Fun", "Magic"],
    xp: 800,
    views: 4000,
    gemLink: "https://chatgpt.com",
    affiliateLink: "https://calm.com",
    affiliateText: "Sleep App Trial",
    type: "tool",
    hall: "Social", 
    aiModel: "ChatGPT", 
    reportScore: 0
  },
  {
    id: 30,
    title: "Fitness Coach",
    nickname: "GymBro",
    password: "gym",
    description: "Creates workout routines based on your goals.",
    prompt: "Create a 3-day split workout plan.",
    images: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800"],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
    tags: ["Health", "Workout", "Gym"],
    xp: 1600,
    views: 9000,
    gemLink: "https://gemini.google.com",
    affiliateLink: "https://myprotein.com",
    affiliateText: "Protein Sale",
    type: "tool",
    hall: "Social", 
    aiModel: "Gemini", 
    reportScore: 0
  }
];

const RANKS = [
  { name: 'Newbie', threshold: 0, color: 'text-gray-400', icon: '🌱' },
  { name: 'Rising', threshold: 100, color: 'text-orange-400', icon: '🔥' },
  { name: 'Hot', threshold: 500, color: 'text-red-500', icon: '🌶️' },
  { name: 'Legend', threshold: 1000, color: 'text-purple-500', icon: '👑' }
];

const getRank = (xp) => [...RANKS].reverse().find(r => xp >= r.threshold) || RANKS[0];
const getModelStyle = (modelName) => AI_MODELS.find(m => m.id === modelName) || AI_MODELS[5];

// --- Helper Functions ---
const getRecommendations = (currentGem, allGems) => {
    const realUserGems = allGems.filter(g => typeof g.id === 'string' && g.id !== currentGem.id);
    if (realUserGems.length === 0) return [];

    const sameModel = realUserGems
        .filter(g => g.aiModel === currentGem.aiModel)
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 3);

    const categoryTop = realUserGems
        .filter(g => g.hall === currentGem.hall && !sameModel.find(sm => sm.id === g.id))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 1);
     
    return [...sameModel, ...categoryTop];
};

// --- Components ---

const InstaGemCard = ({ gem, onClick, isSmall = false }) => {
  const rank = getRank(gem.xp);
  const displayImage = (gem.images && gem.images.length > 0) ? gem.images[0] : (gem.imageUrl || "https://via.placeholder.com/400x600?text=No+Image");
  const modelStyle = getModelStyle(gem.aiModel);

  if (gem.reportScore >= BLIND_THRESHOLD_SCORE) return null;

  if (isSmall) {
      return (
        <div onClick={() => onClick(gem)} className="flex-shrink-0 w-32 cursor-pointer bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mr-3 relative group">
            <div className="aspect-square relative">
                <img src={displayImage} alt={gem.title} className="w-full h-full object-cover"/>
                <div className={`absolute top-1 right-1 px-1 py-0.5 rounded text-[8px] font-bold uppercase ${modelStyle.color} ${modelStyle.text}`}>{gem.aiModel}</div>
            </div>
            <div className="p-2">
                <h4 className="font-bold text-xs truncate text-gray-800 mb-1">{gem.title}</h4>
                <div className="flex items-center justify-between text-[9px] text-gray-500">
                    <span className="truncate max-w-[50px]">{gem.nickname}</span>
                    <span className="flex items-center text-pink-500 font-bold"><span className="mr-0.5">💋</span>{gem.xp}</span>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div onClick={() => onClick(gem)} className="group relative aspect-[3/4] cursor-pointer bg-gray-200 overflow-hidden">
      <img src={displayImage} alt={gem.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => {e.target.src = "https://via.placeholder.com/400x600?text=No+Image"}}/>
      
      {/* 👇 [수정됨] z-10 추가로 그라데이션이 글씨 밑에 깔리게 함 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity z-10"></div>
      
      <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm z-20 ${modelStyle.color} ${modelStyle.text}`}>{gem.aiModel || 'AI'}</div>
      {(gem.affiliateLink || gem.affiliateText) && (<div className="absolute top-8 right-2 bg-green-500 text-white p-0.5 rounded-sm shadow-sm animate-pulse z-20"><DollarSign className="w-3 h-3" /></div>)}
      <div className="absolute top-2 left-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded backdrop-blur-sm z-20">{gem.hall}</div>
      
      {/* 👇 [수정됨] z-20 추가로 글씨가 가장 위에 뜨게 함 (깜빡임 해결) */}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-white z-20">
        <div className="flex items-center mb-1"><span className="mr-1 text-xs">{rank.icon}</span><span className={`text-[10px] font-bold uppercase ${rank.color}`}>{rank.name}</span></div>
        <h3 className="font-bold text-xs truncate leading-tight mb-0.5 text-shadow">{gem.title}</h3>
        <div className="flex items-center justify-between">
           <span className="text-[10px] text-gray-300 truncate max-w-[60px]">{gem.nickname}</span>
           <div className="flex items-center space-x-2">
              <div className="flex items-center text-[10px] font-bold text-gray-300"><Eye className="w-3 h-3 mr-0.5" />{gem.views > 1000 ? (gem.views/1000).toFixed(1) + 'k' : gem.views}</div>
              <div className="flex items-center text-[10px] font-bold"><span className="mr-0.5 text-xs leading-none">💋</span>{gem.xp}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

const TopStarBanner = ({ gem, onClick }) => {
    const estimatedRevenue = calculateRevenue(gem.xp).toLocaleString();
    const modelStyle = getModelStyle(gem.aiModel);

    return (
        <div onClick={() => onClick(gem)} className="mx-2 mt-4 mb-2 cursor-pointer group">
            <div className="relative bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-0.5 shadow-lg transform transition-all group-hover:scale-[1.01]">
                <div className="absolute -top-3 -right-2 transform rotate-12 bg-white px-3 py-1 rounded-full shadow-md z-20 border-2 border-yellow-400">
                    <span className="text-xs font-black text-yellow-600 flex items-center"><Crown className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500"/> KING</span>
                </div>
                <div className="bg-white rounded-xl overflow-hidden flex h-32 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/50 to-transparent z-0"></div>
                    <div className="w-2/3 p-4 z-10 flex flex-col justify-center">
                        <div className="flex items-center space-x-2 mb-1">
                            {/* 👇 [수정됨] '위' 제거하고 #1 형태로 변경 */}
                            <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-wider">{gem.hall} #1</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${modelStyle.color} ${modelStyle.text}`}>{gem.aiModel}</span>
                        </div>
                        <h3 className="font-black text-lg text-gray-900 leading-tight truncate mb-1">{gem.title}</h3>
                        <div className="flex items-center text-yellow-600 font-bold text-sm"><Coins className="w-4 h-4 mr-1" /><span className="text-gray-500 text-xs mr-1">Est. Revenue</span><span className="text-lg">${estimatedRevenue}</span></div>
                    </div>
                    <div className="w-1/3 relative">
                        <img src={gem.images?.[0] || gem.imageUrl} alt={gem.title} className="w-full h-full object-cover absolute inset-0"/>
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20"></div>
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center"><span className="mr-1">💋</span> {gem.xp.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MainBanner = () => (
    <div className="max-w-7xl mx-auto px-2 mt-4 mb-2">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-center shadow-sm text-xs text-green-800 text-center sm:text-left">
            <div className="flex items-center mb-1 sm:mb-0 sm:mr-2">
                <Megaphone className="w-4 h-4 mr-1 text-green-600 flex-shrink-0" />
                <span className="font-bold">💰 Promote yourself freely or earn anonymously!</span>
            </div>
            <span className="hidden sm:inline text-green-300 mr-2">|</span>
            <span>
                <strong>No Login · No Subscribers · No Cost to Supporters</strong> AI Agent Sharing Platform
            </span>
        </div>
    </div>
);

const LikeUnlockModal = ({ text, onClose, onConfirm }) => (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-orange-500"></div>
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            <div className="flex justify-center mb-4 mt-2">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center animate-bounce text-3xl">💋</div>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">Shop as usual,<br/>Support as a bonus! 💖</h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left mb-4">
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    By purchasing through affiliate links,<br/>
                    you support the creator with a small commission.<br/>
                    <span className="text-orange-600 font-bold text-xs">(No extra cost to the buyer!)</span>
                </p>
                <div className="mt-3 pt-3 border-t border-gray-200"><p className="text-xs text-gray-500 flex items-center"><Smile className="w-4 h-4 mr-1 text-blue-500"/>No extra cost to the buyer!</p></div>
            </div>
            <button onClick={onConfirm} className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-md flex items-center justify-center">Visit & Support Creator <ArrowRight className="w-4 h-4 ml-1" /></button>
        </div>
    </div>
);

const TermsModal = ({ onClose }) => (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-lg flex items-center text-gray-900"><Scale className="w-5 h-5 mr-2" /> Service Terms</h3>
                <button onClick={onClose}><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800 font-bold text-xs">⚠️ This agreement contains clauses indemnifying the operator from legal liability. Users are deemed to agree to this upon using the service.</div>
                <section><h4 className="font-bold text-gray-900 mb-2">Article 1 (Nature of Service & Indemnification)</h4><p>This service provides an 'intermediary space' for users to share information, and all content and affiliate links are registered directly by users.</p><p className="mt-2 text-red-600 font-bold">The operator does not guarantee the accuracy, reliability, or legality of the posts and is not legally responsible for any financial or mental damages resulting from them.</p></section>
                <section><h4 className="font-bold text-gray-900 mb-2">Article 2 (Service Changes & Data Deletion)</h4><ul className="list-disc pl-4 space-y-1"><li>The operator may modify, suspend, or terminate the service at any time without prior notice.</li><li>Even if user data (posts, XP points, etc.) is lost due to service termination or server errors, the operator is not responsible for recovery or compensation.</li><li>This service is provided 'As Is', and uninterrupted service is not guaranteed.</li></ul></section>
                <section><h4 className="font-bold text-gray-900 mb-2">Article 3 (Exclusion of Liability for Investment & Transactions)</h4><ul className="list-disc pl-4 space-y-1"><li>Investment information, revenue verification, and product recommendations in posts are solely the subjective views of the author.</li><li>Losses resulting from investments or purchases made based on this are entirely the user's responsibility.</li></ul></section>
                <section><h4 className="font-bold text-gray-900 mb-2">Article 4 (User Obligations & Damages)</h4><p className="mb-2">If a user posts illegal information (pornography, fraud, copyright infringement, etc.) and a claim is raised by a third party or the operator gets involved in a legal dispute:</p><ul className="list-disc pl-4 space-y-1 text-red-600 font-bold"><li>The user must indemnify the operator at their own expense and responsibility.</li><li>The user must compensate the operator for all damages (including legal fees).</li></ul></section>
                <section><h4 className="font-bold text-gray-900 mb-2">Article 5 (Jurisdiction & Governing Law)</h4><p>Lawsuits related to disputes arising from the use of this service shall be under the exclusive jurisdiction of the <strong>US courts having jurisdiction over the operator's residence or address</strong>.</p></section>
                 <section>
                    <h4 className="font-bold text-gray-900 mb-2">Article 6 (Idea Sharing & Theft Indemnification)</h4>
                    <p>Ideas and content registered on the service are considered 'public information'. The operator is not responsible for any profit infringement or damages caused by third parties imitating or stealing them, and the responsibility for protecting ideas lies entirely with the author.</p>
                </section>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <button onClick={onClose} className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">I confirm and agree to the above.</button>
            </div>
        </div>
    </div>
);

// 👇 [추가됨] Privacy Modal
const PrivacyModal = ({ onClose }) => (
    <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-lg flex items-center text-gray-900"><Shield className="w-5 h-5 mr-2" /> Privacy Policy</h3>
                <button onClick={onClose}><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800 font-bold text-xs">ℹ️ Paran Nemo minimizes data collection to ensure anonymity.</div>
                <section>
                    <h4 className="font-bold text-gray-900 mb-2">1. Collected Information</h4>
                    <p>We do not require account registration. We only collect the following minimal information for service operation:</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li>Uploaded content (Images, text, links)</li>
                        <li>Anonymized interaction data (Likes, views)</li>
                        <li>Temporary IP address logs for security and anti-abuse purposes</li>
                    </ul>
                </section>
                <section>
                    <h4 className="font-bold text-gray-900 mb-2">2. Purpose of Collection</h4>
                    <p>To provide the platform service, manage content quality, and prevent spam/abuse.</p>
                </section>
                <section>
                    <h4 className="font-bold text-gray-900 mb-2">3. Third-Party Sharing</h4>
                    <p>We do not share your personal data with third parties unless required by law.</p>
                </section>
                <section>
                    <h4 className="font-bold text-gray-900 mb-2">4. Data Retention</h4>
                    <p>Content you post is retained until you delete it. Server logs are periodically deleted.</p>
                </section>
                <section>
                    <h4 className="font-bold text-gray-900 mb-2">5. Contact</h4>
                    <p>For privacy concerns, please contact: contact@parannemo.org</p>
                </section>
            </div>
             <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <button onClick={onClose} className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">Close</button>
            </div>
        </div>
    </div>
);


const GemDetailModal = ({ gem, allGems, onClose, onSwitchGem, onLike, onReport, onDelete }) => {
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [showLinkConfirm, setShowLinkConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [unlockedData, setUnlockedData] = useState(null);
  const [showRevenueInfo, setShowRevenueInfo] = useState(false);
  
  const imageList = gem.images && gem.images.length > 0 ? gem.images : [gem.imageUrl || "https://via.placeholder.com/400x600?text=No+Image"];
  const [activeImage, setActiveImage] = useState(imageList[0]);

  useEffect(() => {
      const initialImage = (gem.images && gem.images.length > 0) ? gem.images[0] : (gem.imageUrl || "https://via.placeholder.com/400x600?text=No+Image");
      setActiveImage(initialImage);
  }, [gem]);

  const modelStyle = getModelStyle(gem.aiModel);
  const estimatedRevenue = calculateRevenue(gem.xp).toLocaleString();
  const recommendations = getRecommendations(gem, allGems || []);

  if (!gem) return null;
  const rank = getRank(gem.xp);

  const handleLinkClick = (e, link) => { e.preventDefault(); setShowLinkConfirm(true); };
  const confirmLinkVisit = () => { window.open(gem.gemLink, '_blank'); setShowLinkConfirm(false); };
  const submitReport = (reason, weight) => { if(window.confirm(`🚨 Do you want to report for '${reason}'?`)) { onReport(gem.id, weight); setShowReportOptions(false); }};
  const handleDeleteSubmit = () => { 
      if (deletePassword === gem.password || deletePassword === MASTER_KEY) { 
          if(window.confirm("Are you sure you want to delete? (Admin or Password match)")) { 
              onDelete(gem.id); 
              onClose(); 
          } 
      } else { 
          alert("Incorrect Password."); 
      }
  };
  const handleLikeClick = () => { onLike(gem.id); if (gem.affiliateLink) { setUnlockedData({ link: gem.affiliateLink, text: gem.affiliateText }); } else { alert("Thanks for the Kiss! 💋"); }};
  const copyPrompt = () => { if (gem.prompt) { const textArea = document.createElement("textarea"); textArea.value = gem.prompt; document.body.appendChild(textArea); textArea.select(); document.execCommand('copy'); document.body.removeChild(textArea); setCopied(true); setTimeout(() => setCopied(false), 2000); }};

  return (
    <>
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-sm gem-detail-modal-content">
            <div className="w-full min-h-screen md:min-h-0 md:my-10 md:max-w-6xl md:mx-auto bg-white shadow-2xl relative flex flex-col md:rounded-2xl border border-gray-200">
                <div className="sticky top-0 z-[100] bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center shadow-sm">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center text-gray-700 font-bold text-sm"><ArrowRight className="w-5 h-5 mr-1 rotate-180" /> Back to List</button>
                    <div className="flex space-x-2">
                        {!isDeleting ? ( <button onClick={() => setIsDeleting(true)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button> ) : ( <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-red-200"><input type="password" placeholder="Password" className="w-16 p-1 text-xs border border-gray-300 rounded mr-1 outline-none" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoFocus /><button onClick={handleDeleteSubmit} className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold mr-1">Delete</button><button onClick={() => setIsDeleting(false)} className="text-gray-400"><X className="w-4 h-4"/></button></div> )}
                        <button onClick={() => setShowReportOptions(true)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Flag className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="flex flex-col">
                        <div className="w-full aspect-square md:aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden border border-gray-300 relative shadow-sm mb-3 flex items-center justify-center flex-shrink-0">
                            {activeImage ? ( <img src={activeImage} alt={gem.title} className="w-full h-full object-contain absolute inset-0" onError={(e) => {e.target.src = "https://via.placeholder.com/400x600?text=No+Image"}} /> ) : ( <div className="text-gray-400 font-bold">No Image</div> )}
                            <div className="absolute top-3 left-3 flex space-x-2 z-10">
                                <span className="bg-black/70 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md">{gem.hall}</span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-white shadow-sm uppercase border border-gray-200 ${rank.color}`}>{rank.icon} {rank.name}</span>
                            </div>
                        </div>
                        {imageList.length > 1 && ( <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">{imageList.map((img, idx) => ( <button key={idx} onClick={() => setActiveImage(img)} onMouseEnter={() => setActiveImage(img)} className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-gray-100 ${activeImage === img ? 'border-pink-500 ring-2 ring-pink-100 opacity-100' : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'}`}><img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" /></button> ))}</div> )}
                    </div>

                    <div className="flex flex-col">
                        <div className="mb-6">
                            <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${modelStyle.color} ${modelStyle.text}`}>
                                <Bot className="w-3 h-3 mr-1"/> {gem.aiModel || 'AI Tool'}
                            </div>
                            <div className="flex items-center text-xs text-gray-400 mb-1">
                                <Eye className="w-3 h-3 mr-1" />
                                {gem.views > 1000 ? (gem.views/1000).toFixed(1) + 'k' : gem.views} views
                            </div>
                            <h1 className="text-xl md:text-3xl font-black text-gray-900 leading-tight mb-2">{gem.title}</h1>
                            <p className="text-sm text-gray-500 flex items-center"><User className="w-3 h-3 mr-1.5" /> <span className="font-bold text-gray-700">{gem.nickname}</span> <span className="mx-2 text-gray-300">|</span><span className="text-gray-400">Just updated</span></p>
                        </div>
                        <div className="flex items-center space-x-4 mb-6 border-y border-gray-100 py-4">
                            <div className="flex items-center text-pink-500"><span className="text-2xl mr-2">💋</span><span className="text-3xl font-bold tracking-tight">{gem.xp}</span><span className="text-sm text-gray-400 ml-1 font-medium">Kisses</span></div>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <button onClick={handleLikeClick} className="text-sm font-bold text-gray-600 hover:text-pink-500 transition-colors flex items-center"><span className="text-xl mr-1.5">💋</span> Send Kiss</button>
                        </div>
                        
                        {gem.xp > 0 && (
                            <div className="mb-6">
                                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
                                    <div className="flex items-center justify-between relative z-10">
                                        <div>
                                            <div className="flex items-center mb-1">
                                                <p className="text-[10px] font-bold text-yellow-400 mr-2">
                                                    Est. amount the creator receives
                                                </p>
                                                <button onClick={() => setShowRevenueInfo(!showRevenueInfo)} className="text-gray-400 hover:text-white transition-colors">
                                                    <HelpCircle className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <p className="text-3xl font-black text-white tracking-tight">
                                                ${estimatedRevenue}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                            <Coins className="w-8 h-8 text-yellow-400" />
                                        </div>
                                    </div>
                                </div>
                                {showRevenueInfo && (
                                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-900 animate-in fade-in slide-in-from-top-2">
                                        <p className="font-bold mb-1">🤔 How is this calculated?</p>
                                        <p className="leading-relaxed mb-2">
                                            We analyzed data from micro-influencers generating revenue through affiliate links (avg. conversion rate 1.5-3%).
                                        </p>
                                        <p className="leading-relaxed mb-2">
                                            'Kiss' is a strong purchase signal. The 'Snowball Effect' where exposure and trust increase with more Kisses is reflected.
                                        </p>
                                        <p className="leading-relaxed font-medium text-yellow-800 border-t border-yellow-200 pt-2">
                                            💡 <strong>Important:</strong> <strong>Not selling directly!</strong><br/>
                                            It's a fair marketing reward for sharing good info and connecting traffic. (Buyer pays $0 extra)
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-8">{gem.tags && gem.tags.map((tag, idx) => ( <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">#{tag}</span> ))}</div>
                        
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 shadow-sm mb-8">
                            <button onClick={(e) => handleLinkClick(e, gem.gemLink)} className="w-full py-4 bg-black text-white text-lg font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-transform active:scale-95 flex items-center justify-center">Use AI Agent <ExternalLink className="w-5 h-5 ml-2" /></button>
                        </div>
                        {(gem.affiliateLink || gem.affiliateText) && ( <div className="mb-8 p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl border border-pink-100 flex items-center justify-between"><div className="text-xs text-gray-800"><span className="block font-bold mb-0.5 text-pink-600"><Gift className="w-3 h-3 inline mr-1"/> Creator's Pick</span>{unlockedData ? "Check it out now!" : "Creator's Recommendation"}</div>{unlockedData ? ( <a href={unlockedData.link} target="_blank" rel="noreferrer" className="text-xs font-bold text-white bg-pink-500 px-3 py-2 rounded-lg hover:bg-pink-600">Go to Link</a> ) : ( <button onClick={handleLikeClick} className="text-xs font-bold text-pink-600 bg-white border border-pink-200 px-3 py-2 rounded-lg hover:bg-white/50 shadow-sm flex items-center"><Lock className="w-3 h-3 mr-1"/> Unlock with Kiss</button> )}</div> )}
                        
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-black pl-3">Description</h3>
                            <div className="text-sm text-gray-700 leading-7 whitespace-pre-line mb-8 min-h-[100px]">{gem.description || "No description available."}</div>
                            {gem.prompt && ( <div className="mt-6"><h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-gray-400 pl-3 flex items-center">Prompt <span className="text-xs font-normal text-gray-400 ml-2">(Copy to use)</span></h3><div className="bg-gray-100 p-3 rounded-xl border border-gray-200 font-mono text-sm text-gray-700 relative group"><div className="max-h-60 overflow-y-auto pr-8 leading-relaxed">{gem.prompt}</div><button onClick={copyPrompt} className="absolute top-2 right-2 p-2 bg-white hover:bg-gray-200 rounded-lg text-gray-600 transition-colors shadow-sm" title="Copy">{copied ? <CheckSquare className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}</button></div></div> )}
                        </div>

                        {recommendations.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-yellow-500" />Recommended with this Agent</h3>
                                <div className="flex overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                                    {recommendations.map(rec => ( <InstaGemCard key={rec.id} gem={rec} isSmall onClick={onSwitchGem} /> ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showLinkConfirm && ( <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-in fade-in"><div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl scale-100 animate-in zoom-in-95"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto"><LogOut className="w-8 h-8 text-gray-600 ml-1" /></div><h3 className="text-xl font-black text-gray-900 mb-2">Go to External Site</h3><p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">You are leaving for an external AI agent page.<br/>A new window will open.</p><div className="w-full space-y-3"><button onClick={confirmLinkVisit} className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center">Visit <ExternalLink className="w-4 h-4 ml-2" /></button><button onClick={() => setShowLinkConfirm(false)} className="w-full py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">Cancel</button></div><p className="text-[10px] text-gray-400 mt-6 max-w-xs mx-auto truncate">URL: {gem.gemLink}</p></div></div> )}
            {showReportOptions && ( <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001] flex items-center justify-center p-4"><div className="bg-white rounded-xl p-6 w-full max-w-xs shadow-2xl"><h3 className="text-lg font-bold mb-4 flex items-center text-red-600"><ShieldAlert className="w-5 h-5 mr-2"/>Report Reason</h3><div className="space-y-2"><button onClick={() => submitReport('Explicit Content', 2)} className="w-full p-3 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200 hover:bg-red-100 text-left">🔞 Explicit Content (Immediate Ban)</button><button onClick={() => submitReport('Scam / Spam', 1)} className="w-full p-3 bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-100 text-left">📢 Scam / Spam</button></div><button onClick={() => setShowReportOptions(false)} className="mt-4 text-sm text-gray-400 underline w-full text-center">Cancel</button></div></div> )}
        </div>
        {unlockedData && <LikeUnlockModal text={unlockedData.text} url={unlockedData.link} onClose={() => setUnlockedData(null)} onConfirm={() => { window.open(unlockedData.link, '_blank'); setUnlockedData(null); }} /> }
    </>
  );
};

const GemRegisterModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        nickname: '', password: '', title: '', description: '', prompt: '', 
        imageMain: '', imageSub1: '', imageSub2: '', imageSub3: '', imageSub4: '',
        gemLink: '', affiliateLink: '', affiliateText: '', hall: 'Investing', 
        aiModel: 'ChatGPT'
    });
    // 👇 [추가됨] 파일 업로드를 위한 state
    const [imageFiles, setImageFiles] = useState({
        imageMain: null, imageSub1: null, imageSub2: null, imageSub3: null, imageSub4: null
    });
    const [isAgreed, setIsAgreed] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Helper: Image Upload Function
    const uploadImageFile = async (file) => {
        if (!file || !storage) return null;
        try {
            const fileRef = ref(storage, `artifacts/${appId}/images/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.error("Upload failed", error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAgreed) return;
        setIsUploading(true);
        
        // 👇 [수정됨] 이미지 파일 업로드 처리
        let finalImages = { ...formData };
        try {
            if (imageFiles.imageMain) finalImages.imageMain = await uploadImageFile(imageFiles.imageMain);
            if (imageFiles.imageSub1) finalImages.imageSub1 = await uploadImageFile(imageFiles.imageSub1);
            if (imageFiles.imageSub2) finalImages.imageSub2 = await uploadImageFile(imageFiles.imageSub2);
            if (imageFiles.imageSub3) finalImages.imageSub3 = await uploadImageFile(imageFiles.imageSub3);
            if (imageFiles.imageSub4) finalImages.imageSub4 = await uploadImageFile(imageFiles.imageSub4);
        } catch (err) {
            console.error("Image upload error", err);
            alert("Image upload failed.");
            setIsUploading(false);
            return;
        }
        
        const images = [finalImages.imageMain, finalImages.imageSub1, finalImages.imageSub2, finalImages.imageSub3, finalImages.imageSub4].filter(img => img && img.trim() !== '');
        if (images.length === 0) images.push("https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800");

        const finalHall = formData.hall.trim() || 'Other';
        const finalNickname = formData.nickname.trim() || 'Anonymous';
        
        onSubmit({ 
            ...formData,
            ...finalImages, // Update with URLs
            nickname: finalNickname, 
            hall: finalHall, 
            id: Date.now(), 
            xp: 0, 
            views: 0,
            reportScore: 0, 
            type: 'tool', 
            images: images 
        });
        setIsUploading(false);
    };

    const handleFileChange = (e, key) => {
        if (e.target.files && e.target.files[0]) {
            setImageFiles(prev => ({ ...prev, [key]: e.target.files[0] }));
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-black text-white rounded-t-2xl sticky top-0 z-10">
                        <div><h2 className="text-lg font-bold">Register AI Agent Idea</h2></div>
                        <button onClick={onClose}><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-xs text-red-700">
                            <div className="flex items-center font-bold mb-1"><ShieldAlert className="w-4 h-4 mr-1"/> Prohibited Content</div>
                            Explicit content, gambling, and violence will be deleted immediately.
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">Nickname / SNS ID (Optional)</label><input type="text" placeholder="e.g., Anonymous or @sns_id" className="w-full p-2 border rounded bg-gray-50 text-sm outline-none" onChange={e => setFormData({...formData, nickname: e.target.value})} /></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1 flex items-center text-red-600"><Lock className="w-3 h-3 mr-1"/>Password (Required)</label><input type="password" placeholder="4 digits" required maxLength={4} className="w-full p-2 border border-red-200 rounded bg-red-50 text-sm focus:ring-2 focus:ring-red-500 outline-none" onChange={e => setFormData({...formData, password: e.target.value})} /></div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-800 mt-2">
                            <div className="flex items-center font-bold mb-1"><AlertTriangle className="w-4 h-4 mr-1"/> Note</div>
                            Since there is no login, this password is required to edit or delete later.
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center"><Cpu className="w-3 h-3 mr-1"/> AI Model (Required)</label>
                                <select 
                                    className="w-full p-2 border rounded text-sm bg-gray-50 focus:bg-white outline-none"
                                    value={formData.aiModel}
                                    onChange={e => setFormData({...formData, aiModel: e.target.value})}
                                >
                                    {AI_MODELS.map(model => ( <option key={model.id} value={model.id}>{model.label}</option> ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Category (Required)</label>
                                {/* 👇 [수정됨] 카테고리 Input -> Select 로 변경 */}
                                <select 
                                    className="w-full p-2 border rounded text-sm bg-gray-50 focus:bg-white outline-none"
                                    value={formData.hall}
                                    onChange={e => setFormData({...formData, hall: e.target.value})}
                                >
                                    {CATEGORY_LIST.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <input type="text" placeholder="Title" required className="w-full p-2 border rounded font-bold" onChange={e => setFormData({...formData, title: e.target.value})} />
                            <textarea placeholder="Description (Detail the advantages and usage of this agent)" required className="w-full p-2 border rounded h-32 resize-none text-sm" onChange={e => setFormData({...formData, description: e.target.value})} />
                            <div className="relative"><textarea placeholder="Prompt or Code to share (Required)" required className="w-full p-2 border border-gray-300 rounded h-24 resize-none text-sm bg-gray-50 focus:bg-white transition-colors" onChange={e => setFormData({...formData, prompt: e.target.value})} /><div className="absolute top-2 right-2 text-xs text-gray-400 pointer-events-none"><Terminal className="w-3 h-3" /></div></div>
                            
                            {/* 👇 [수정됨] 이미지 URL 입력 -> 파일 업로드로 변경 */}
                            <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center"><ImageIcon className="w-3 h-3 mr-1"/> Upload Images (Max 5)</label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs w-12 font-bold text-gray-400">Main</span>
                                        <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'imageMain')} className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'imageSub1')} className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-gray-200"/>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'imageSub2')} className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-gray-200"/>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'imageSub3')} className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-gray-200"/>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'imageSub4')} className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-gray-200"/>
                                    </div>
                                </div>
                            </div>

                            <input type="url" placeholder="AI Agent Share Link (Required)" required className="w-full p-2 border border-indigo-200 bg-indigo-50 rounded text-sm" onChange={e => setFormData({...formData, gemLink: e.target.value})} />
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200 border-dashed">
                            <h3 className="text-sm font-bold text-green-800 mb-2 flex items-center"><DollarSign className="w-4 h-4 mr-1"/> Revenue Link (Monetization)</h3>
                            <div className="space-y-2">
                                <input type="text" placeholder="Button Text (e.g. Shop as usual, Support as a bonus! 🎁)" className="w-full p-2 border border-green-300 rounded text-sm bg-white" onChange={e => setFormData({...formData, affiliateText: e.target.value})} />
                                <input type="url" placeholder="https:// (YouTube, Linktree, Social Bio, Affiliate Link, etc.)" className="w-full p-2 border border-green-300 rounded text-sm bg-white" onChange={e => setFormData({...formData, affiliateLink: e.target.value})} />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center"><input type="checkbox" id="agree" checked={isAgreed} onChange={e => setIsAgreed(e.target.checked)} className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer" /><label htmlFor="agree" className="ml-2 text-xs text-gray-600 cursor-pointer select-none">I agree to the Terms of Service and Policy.</label></div>
                            <button type="button" onClick={() => setShowTerms(true)} className="text-[10px] flex items-center bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"><FileText className="w-3 h-3 mr-1" /> View Terms</button>
                        </div>
                        <button type="submit" disabled={!isAgreed || isUploading} className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center ${isAgreed && !isUploading ? 'bg-black hover:bg-gray-800 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}>
                             {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Uploading Images...</> : "Post"}
                        </button>
                    </form>
                </div>
            </div>
            {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
        </>
    );
};

const Footer = ({ onOpenTerms, onOpenPrivacy }) => (
    <footer className="bg-slate-50 border-t border-slate-100 pt-12 pb-8 mt-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
            
            <div className="mb-8">
                <h3 className="font-black text-2xl text-slate-800 mb-2 flex items-center justify-center">
                    <div className="mr-2 flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                            <rect x="2" y="10" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.8" />
                            <rect x="12" y="10" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.6" />
                            <rect x="7" y="2" width="10" height="10" rx="2" fill="currentColor" />
                        </svg>
                    </div>
                    Paran Nemo
                </h3>
                <p className="text-sm font-bold text-slate-600">
                    The First! Marketplace for everyone.
                </p>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed mb-8 max-w-2xl mx-auto">
                <p className="mb-2">
                    <strong>Paran Nemo</strong> is the world's first <strong>open AI Agent sharing platform</strong>.
                    Share your unique know-how using ChatGPT, Gemini, Claude, etc.<br className="hidden sm:block"/>
                    <strong>Promote yourself with your SNS ID or share anonymously.</strong>
                </p>
                <p>
                    Experience the miracle where small ideas become profit.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-10">
                {['#TheFirst', '#AIAgent', '#ShareFreely', '#Monetization', '#Affiliate', '#PromptShare', '#ChatGPT', '#Gemini', '#Claude', '#DigitalNomad'].map((tag) => (
                    <span key={tag} className="text-[10px] text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="border-t border-slate-200 pt-8 flex flex-col items-center">
                <div className="flex space-x-6 text-xs font-medium text-slate-500 mb-3">
                    <button onClick={onOpenTerms} className="hover:text-blue-600 transition-colors">Terms of Service</button>
                    <span className="text-slate-300">|</span>
                    <button onClick={onOpenPrivacy} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
                    <span className="text-slate-300">|</span>
                    <a href="mailto:contact@parannemo.org" className="hover:text-blue-600 transition-colors flex items-center">
                        Contact Us
                    </a>
                </div>
                <p className="text-[10px] text-slate-400">
                    © 2026 Parannemo.org. All rights reserved.
                </p>
                <p className="text-[9px] text-slate-300 mt-2">
                    * Paran Nemo is an intermediary platform, and legal responsibility for individual transactions and information lies with the registrant.
                </p>
            </div>
        </div>
    </footer>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [realGems, setRealGems] = useState([]);
  const [gems, setGems] = useState(INITIAL_GEMS);
  const [selectedGem, setSelectedGem] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [currentHall, setCurrentHall] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [footerTermsOpen, setFooterTermsOpen] = useState(false);
  const [footerPrivacyOpen, setFooterPrivacyOpen] = useState(false);
  
  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);
  
  const [currentModel, setCurrentModel] = useState('all');

  useEffect(() => {
    const initAuth = async () => {
      // Direct anonymous sign-in for custom Firebase project to avoid token mismatch errors
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Anonymous auth failed", e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!db || !user) return;
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedGems = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          }));
          loadedGems.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setRealGems(loadedGems);
      }, (error) => {
          console.error("Firestore Error:", error);
      });
      return () => unsubscribe();
  }, [user]);

  // ✅ [스마트 생성기 적용 완료]
  // 30개 진짜 데이터 + 'Coming Soon' 데이터로 700개 채움
  useEffect(() => {
      // 1. 진짜 데이터 합치기 (Firestore + 초기 데이터)
      const myRealContent = [...realGems, ...INITIAL_GEMS];
      
      // 2. 중복 제거 (ID 기준)
      const uniqueContent = Array.from(new Map(myRealContent.map(item => [item.id, item])).values());
      
      // 3. 700개까지 모자란 개수 계산
      const totalTarget = 700;
      const currentCount = uniqueContent.length;
      const needed = Math.max(0, totalTarget - currentCount);

      // 4. 모자란 만큼 'Coming Soon' 박스 생성
      const placeholders = Array.from({ length: needed }, (_, i) => ({
          id: `placeholder-${i}`,
          title: `AI Agent #${currentCount + i + 1} (Coming Soon)`,
          nickname: "Paran Nemo",
          xp: 0,
          views: 0,
          aiModel: "Waiting",
          hall: "New",
          imageUrl: "https://via.placeholder.com/400x600?text=Coming+Soon", 
          description: "New AI Agents are being prepared...",
          tags: ["Waiting"],
          reportScore: 0,
          isPlaceholder: true
      }));

      // 5. 최종 데이터 적용
      setGems([...uniqueContent, ...placeholders]);

  }, [realGems]); 

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      // 새로고침 시 로직 (실제로는 데이터 다시 불러오기 등)
      setIsRefreshing(false);
      setPullMoveY(0);
  };

  const handleTouchStart = (e) => {
      if (window.scrollY === 0) setPullStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
      if (pullStartY > 0 && window.scrollY === 0) {
          const y = e.touches[0].clientY;
          const diff = y - pullStartY;
          if (diff > 0) setPullMoveY(diff);
      }
  };

  const handleTouchEnd = () => {
      if (pullMoveY > 100) handleRefresh();
      else setPullMoveY(0);
      setPullStartY(0);
  };

  const handleXPIncrease = async (id, amount) => { 
      setGems(prev => prev.map(gem => {
          if (gem.id === id) {
              const updatedGem = { ...gem, xp: gem.xp + amount };
              if (selectedGem && selectedGem.id === id) setSelectedGem(updatedGem);
              return updatedGem;
          }
          return gem;
      }));

      if (typeof id === 'string' && db && user) {
          try {
              const gemRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, id);
              await updateDoc(gemRef, { xp: increment(amount) });
          } catch (e) {
              console.error("Error updating XP:", e);
          }
      }
  };
  
  const handleViewIncrease = async (id) => {
      setGems(prev => prev.map(gem => {
          if (gem.id === id) {
              const updatedGem = { ...gem, views: (gem.views || 0) + 1 };
               if (selectedGem && selectedGem.id === id) setSelectedGem(updatedGem);
              return updatedGem;
          }
          return gem;
      }));

      if (typeof id === 'string' && db && user) {
          try {
              const gemRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, id);
              await updateDoc(gemRef, { views: increment(1) });
          } catch (e) {
              console.error("Error updating views:", e);
          }
      }
  };

  const handleCreateGem = async (newGemData) => {
      if (!db || !user) {
          alert("Database not connected. Running in Demo Mode.");
           setGems(prev => [{...newGemData, id: Date.now(), xp: 0, views: 0}, ...prev]);
           setIsRegisterOpen(false);
          return;
      }
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), {
              ...newGemData,
              createdAt: serverTimestamp()
          });
          setIsRegisterOpen(false);
      } catch (e) {
          console.error("Error adding document: ", e);
          alert("Failed to post. Please try again.");
      }
  };

  const handleReport = (id, weight = 1) => { setGems(prev => prev.map(gem => { if (gem.id === id) { const newScore = (gem.reportScore || 0) + weight; if (newScore >= BLIND_THRESHOLD_SCORE) setSelectedGem(null); return { ...gem, reportScore: newScore }; } return gem; })); };
  const handleDelete = (id) => { setGems(prev => prev.filter(gem => gem.id !== id)); };

  const filteredGems = gems.filter(gem => {
      if ((gem.reportScore || 0) >= BLIND_THRESHOLD_SCORE) return false;
      if (searchTerm) { const lowerTerm = searchTerm.toLowerCase(); if (!gem.title.toLowerCase().includes(lowerTerm) && !gem.nickname.toLowerCase().includes(lowerTerm)) { return false; } }
      
      const hallMatch = currentHall === 'all' || currentHall === 'latest' || gem.hall === currentHall;
      const modelMatch = currentModel === 'all' || gem.aiModel === currentModel;
      
      return hallMatch && modelMatch;
  }).sort((a, b) => { if (currentHall === 'latest') { return b.id - a.id; } return 0; });

  const topStar = filteredGems.length > 0 
      ? filteredGems.reduce((prev, current) => (prev.xp > current.xp) ? prev : current)
      : null;

  const allCategories = Array.from(new Set(gems.map(gem => gem.hall))).filter(Boolean).sort();
  
  const halls = [
      { id: 'all', label: 'All' },
      { id: 'latest', label: 'Latest' },
      ...allCategories.map(cat => ({ id: cat, label: cat }))
  ];

  return (
    <div 
        className="min-h-screen bg-white font-sans text-gray-900 pb-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 h-12 flex justify-between items-center">
            {isSearchOpen ? (
                <div className="flex-1 flex items-center animate-in fade-in slide-in-from-right-5 mr-2">
                    <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                    <input type="text" placeholder="Search agent name, nickname..." className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400 min-w-0" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                    <button onClick={() => { setIsSearchOpen(false); setSearchTerm(''); }} className="p-2 ml-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
            ) : (
                <>
                    <div className="flex items-center font-bold text-lg cursor-pointer group" onClick={() => { setCurrentHall('all'); setCurrentModel('all'); }}>
                        <div className="mr-2 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600 transform transition-transform group-hover:scale-110">
                                <rect x="2" y="10" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.8" />
                                <rect x="12" y="10" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.6" />
                                <rect x="7" y="2" width="10" height="10" rx="2" fill="currentColor" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                             <span className="text-sm sm:text-base tracking-tight text-slate-800 leading-none">Paran Nemo</span>
                             <span className="text-[8px] font-black text-blue-500 tracking-widest leading-none mt-0.5">THE FIRST</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <button onClick={handleRefresh} className={`p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors ${isRefreshing ? 'animate-spin' : ''}`}><RotateCw className="w-5 h-5" /></button>
                        <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><Search className="w-5 h-5" /></button>
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-2 rounded-full transition-colors ${currentHall !== 'all' ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>{isFilterOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</button>
                        <button onClick={() => setIsRegisterOpen(true)} className="bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-md active:scale-95 transition-all whitespace-nowrap"><PlusCircle className="w-3 h-3 mr-1" /> Post</button>
                    </div>
                </>
            )}
        </div>
      </nav>

      <div 
        className="flex justify-center overflow-hidden transition-all duration-300 ease-out" 
        style={{ height: isRefreshing ? '50px' : Math.min(pullMoveY * 0.4, 80) + 'px', opacity: Math.min(pullMoveY / 50, 1) }}
      >
          <div className="flex items-center text-blue-500 text-xs font-bold">
              {isRefreshing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <RotateCw className="w-5 h-5 mr-2" style={{ transform: `rotate(${pullMoveY * 2}deg)` }} />}
              {isRefreshing ? "Finding new agents..." : "Pull to refresh"}
          </div>
      </div>

      {isFilterOpen && ( 
          <>
            <div className="bg-white border-b border-gray-100 sticky top-12 z-30 overflow-x-auto no-scrollbar animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="max-w-7xl mx-auto px-2 flex space-x-4">
                    {halls.map((hall) => ( 
                        <button key={hall.id} onClick={() => setCurrentHall(hall.id)} className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-2 ${currentHall === hall.id ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>{hall.label}</button> 
                    ))}
                </div>
            </div>
            
            <div className="bg-gray-50 border-b border-gray-200 sticky top-[calc(3rem+45px)] z-20 overflow-x-auto no-scrollbar py-2 px-2 animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="max-w-7xl mx-auto flex space-x-2">
                    <button 
                        onClick={() => setCurrentModel('all')}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${currentModel === 'all' ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                    >
                        All AI
                    </button>
                    {AI_MODELS.map(model => (
                        <button 
                            key={model.id}
                            onClick={() => setCurrentModel(model.id)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border flex items-center ${currentModel === model.id ? `${model.color} text-white border-transparent shadow-md` : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                        >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentModel === model.id ? 'bg-white' : model.color.replace('text-', 'bg-').split(' ')[0]}`}></span>
                        {model.label}
                        </button>
                    ))}
                </div>
            </div>
          </>
      )}
      
      {!isFilterOpen && (currentHall !== 'all' || currentModel !== 'all') && ( 
          <div className="max-w-7xl mx-auto px-2 mt-2">
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-600 flex justify-between items-center cursor-pointer" onClick={() => setIsFilterOpen(true)}>
                  <span className="flex items-center">
                      <Filter className="w-3 h-3 mr-1"/> 
                      Filter: <span className="text-black ml-1">{halls.find(h=>h.id === currentHall)?.label || currentHall}</span>
                      {currentModel !== 'all' && <span className="mx-1 text-gray-400">+</span>}
                      {currentModel !== 'all' && <span className={`px-1.5 py-0.5 rounded text-[9px] text-white ml-1 ${AI_MODELS.find(m=>m.id === currentModel)?.color}`}>{currentModel}</span>}
                  </span>
                  <ChevronDown className="w-3 h-3 ml-1" />
              </div>
          </div> 
      )}
      
      {topStar && (
          <div className="max-w-7xl mx-auto">
              <TopStarBanner 
                gem={topStar} 
                onClick={(selected) => {
                    handleViewIncrease(selected.id);
                    setSelectedGem(selected);
                }} 
              />
          </div>
      )}

      <MainBanner />

      <main className="max-w-7xl mx-auto min-h-screen bg-white mt-2">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 sm:gap-1">
            {filteredGems.map((gem) => ( 
                <InstaGemCard 
                    key={gem.id} 
                    gem={gem} 
                    onClick={(selected) => {
                        handleViewIncrease(selected.id);
                        setSelectedGem(selected);
                    }} 
                /> 
            ))}
        </div>
        {filteredGems.length === 0 && ( <div className="text-center py-20 bg-gray-50 m-4 rounded-xl"><p className="text-gray-400 text-sm">{searchTerm ? `'${searchTerm}' not found.` : 'No agents match your criteria.'}</p></div> )}
      </main>
      
      <Footer onOpenTerms={() => setFooterTermsOpen(true)} onOpenPrivacy={() => setFooterPrivacyOpen(true)} />
      
      {selectedGem && <GemDetailModal gem={selectedGem} allGems={gems} onClose={() => setSelectedGem(null)} onSwitchGem={setSelectedGem} onLike={(id) => handleXPIncrease(id, 1)} onReport={handleReport} onDelete={handleDelete} /> }
      {isRegisterOpen && <GemRegisterModal onClose={() => setIsRegisterOpen(false)} onSubmit={handleCreateGem} />}
      
      {footerTermsOpen && <TermsModal onClose={() => setFooterTermsOpen(false)} />}
      {/* 👇 [추가됨] Footer Privacy Modal 연결 */}
      {footerPrivacyOpen && <PrivacyModal onClose={() => setFooterPrivacyOpen(false)} />}
      
    </div>
  );
}