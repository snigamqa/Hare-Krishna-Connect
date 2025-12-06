import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { getGitaAffirmation } from '../services/geminiService';
import { Affirmation, LoadingState } from '../types';

const moods = [
  { id: 'anxious', label: '😰 Anxious', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'lost', label: '🧭 Lost', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'angry', label: '🔥 Angry', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'unmotivated', label: '💤 Unmotivated', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  { id: 'lonely', label: '🌧️ Lonely', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { id: 'grateful', label: '✨ Grateful', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'confused', label: '😵‍💫 Confused', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { id: 'stressed', label: '🤯 Stressed', color: 'bg-rose-100 text-rose-800 border-rose-200' }
];

const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);

  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(moodId);
    setStatus(LoadingState.LOADING);
    setAffirmation(null);
    try {
      const data = await getGitaAffirmation(moodId, language);
      setAffirmation(data);
      setStatus(LoadingState.SUCCESS);
    } catch (e) {
      console.error(e);
      setStatus(LoadingState.ERROR);
    }
  };

  const resetMood = () => {
    setSelectedMood(null);
    setAffirmation(null);
    setStatus(LoadingState.IDLE);
  };

  const navigateToChapter = () => {
    if (affirmation && affirmation.verse) {
        // Parse verse string like "2.47" or "Chapter 2, Verse 47"
        // Regex to find the first two numbers
        const numbers = affirmation.verse.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
            navigate('/gita', { 
                state: { 
                    chapter: parseInt(numbers[0]), 
                    verse: parseInt(numbers[1]) 
                } 
            });
        } else {
            // Fallback if parsing fails
            navigate('/gita');
        }
    } else {
        navigate('/gita');
    }
  };

  return (
    <div className="px-4 md:px-8 pb-12">
      {/* Soul Compass / Hero Section */}
      <div className="max-w-7xl mx-auto mt-4 rounded-[2.5rem] overflow-hidden relative min-h-[600px] flex items-center transition-all duration-500">
         {/* Background Layer */}
         <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ease-in-out ${selectedMood && affirmation ? 'from-slate-900 to-slate-950' : 'from-orange-500 via-orange-600 to-rose-600'}`}></div>
         
         {/* Subtle Texture */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
         
         {/* Decorative Blur Orbs */}
         <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
         
         <div className="relative z-10 w-full px-6 md:px-16 py-12 flex flex-col items-center justify-center text-center">
            
            {/* Initial State: Mood Selector */}
            {!selectedMood && (
              <div className="animate-fade-in-up w-full max-w-5xl">
                 <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-semibold tracking-wider mb-8 border border-white/20 shadow-lg">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   Soul Compass
                 </span>
                 <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight drop-shadow-lg">
                   How is your spirit <br/> feeling today?
                 </h1>
                 <p className="text-xl md:text-2xl text-orange-50/90 mb-12 font-light max-w-3xl mx-auto leading-relaxed">
                   Select your current state of mind to receive instant, personalized guidance from the ancient wisdom of the Bhagavad Gita.
                 </p>
                 
                 <div className="flex flex-wrap justify-center gap-4">
                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => handleMoodSelect(mood.id)}
                        className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 border ${mood.color} bg-white shadow-sm hover:shadow-xl`}
                      >
                        {mood.label}
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {/* Loading State */}
            {status === LoadingState.LOADING && (
               <div className="animate-fade-in flex flex-col items-center">
                  <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mb-8"></div>
                  <h3 className="text-2xl text-white font-serif mb-2">Consulting the Archives...</h3>
                  <p className="text-white/60">Finding the perfect verse for you</p>
               </div>
            )}

            {/* Success State: Mature Result Card */}
            {status === LoadingState.SUCCESS && affirmation && (
               <div className="w-full max-w-2xl animate-scale-in">
                  {/* Glassmorphism Container */}
                  <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-2xl border border-white/50 text-left relative overflow-hidden">
                     
                     {/* Top Decor Bar */}
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-rose-500 to-purple-600"></div>

                     <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Your Guidance</p>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 leading-tight">
                                {affirmation.theme}
                            </h2>
                        </div>
                        <div className="hidden md:block">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 text-orange-600">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            </span>
                        </div>
                     </div>

                     <div className="mb-10">
                        <div className="relative">
                            <svg className="absolute -top-4 -left-6 w-12 h-12 text-slate-200 transform -scale-x-100" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.054 15.399 15.018 16.883 14.397C17.399 14.181 18 13.929 18 13.344C18 13.132 17.842 12.973 17.653 12.923C16.892 12.721 15.429 12.632 14.364 12.378C13.434 12.156 12 11.815 12 9.453C12 7.091 14.708 3 18.182 3C18.676 3 19 3.324 19 3.818V8.727C19 11.272 16.545 13.345 16.545 13.345C16.545 13.345 19 14.164 19 16.818C19 19.364 17.078 21 14.017 21ZM5.017 21L5.017 18C5.017 16.054 6.399 15.018 7.883 14.397C8.399 14.181 9 13.929 9 13.344C9 13.132 8.842 12.973 8.653 12.923C7.892 12.721 6.429 12.632 5.364 12.378C4.434 12.156 3 11.815 3 9.453C3 7.091 5.708 3 9.182 3C9.676 3 10 3.324 10 3.818V8.727C10 11.272 7.545 13.345 7.545 13.345C7.545 13.345 10 14.164 10 16.818C10 19.364 8.078 21 5.017 21Z"/></svg>
                            <p className="text-xl md:text-2xl text-slate-700 italic font-serif leading-relaxed pl-6 relative z-10">
                                {affirmation.quote}
                            </p>
                        </div>
                     </div>

                     <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                            <span className="font-bold text-slate-800">Why this helps:</span> {affirmation.meaning}
                        </p>
                     </div>

                     <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-slate-100">
                        <button 
                            onClick={navigateToChapter}
                            className="flex-1 px-6 py-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                        >
                            <span>Read Chapter {affirmation.verse}</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                        <button 
                            onClick={resetMood}
                            className="px-6 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                        >
                            Try Another Vibe
                        </button>
                     </div>

                  </div>
               </div>
            )}
         </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card: Gita */}
          <Link to="/gita" className="group relative bg-orange-50 rounded-3xl p-8 hover:bg-orange-100 transition-colors duration-300">
             <div className="absolute top-8 right-8 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
             </div>
             <div className="mt-12">
               <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors">{t('home.card.wisdom')}</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-4">{t('home.card.wisdom.desc')}</p>
               <span className="text-sm font-bold text-orange-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                 Read Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
               </span>
             </div>
          </Link>

          {/* Card: Music */}
          <Link to="/bhajans" className="group relative bg-rose-50 rounded-3xl p-8 hover:bg-rose-100 transition-colors duration-300">
             <div className="absolute top-8 right-8 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
             </div>
             <div className="mt-12">
               <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-rose-700 transition-colors">{t('home.card.music')}</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-4">{t('home.card.music.desc')}</p>
               <span className="text-sm font-bold text-rose-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                 Listen <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
               </span>
             </div>
          </Link>

          {/* Card: Temples */}
          <Link to="/temples" className="group relative bg-indigo-50 rounded-3xl p-8 hover:bg-indigo-100 transition-colors duration-300">
             <div className="absolute top-8 right-8 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
             <div className="mt-12">
               <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">{t('home.cta.find')}</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-4">Locate ISKCON centers near you and join the sankirtana movement.</p>
               <span className="text-sm font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                 Find Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
               </span>
             </div>
          </Link>

          {/* Card: News */}
          <Link to="/news" className="group relative bg-emerald-50 rounded-3xl p-8 hover:bg-emerald-100 transition-colors duration-300">
             <div className="absolute top-8 right-8 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
             </div>
             <div className="mt-12">
               <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">{t('home.card.community')}</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-4">{t('home.card.community.desc')}</p>
               <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                 Explore <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
               </span>
             </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Home;