import React, { useState } from 'react';
import { getGitaAffirmation } from '../services/geminiService';
import { Affirmation, LoadingState } from '../types';
import { useLanguage } from './LanguageContext';

const moods = [
  { id: 'anxious', label: '😰 Anxious', color: 'from-blue-400 to-cyan-300' },
  { id: 'lost', label: '🧭 Lost', color: 'from-purple-400 to-indigo-400' },
  { id: 'angry', label: '🔥 Angry', color: 'from-red-400 to-orange-400' },
  { id: 'unmotivated', label: '💤 Unmotivated', color: 'from-slate-400 to-gray-300' },
  { id: 'lonely', label: '🌧️ Lonely', color: 'from-sky-400 to-blue-300' },
  { id: 'grateful', label: '✨ Grateful', color: 'from-yellow-400 to-amber-300' },
  { id: 'confused', label: '😵‍💫 Confused', color: 'from-teal-400 to-emerald-300' },
  { id: 'stressed', label: '🤯 Stressed', color: 'from-rose-400 to-pink-300' }
];

const Affirmations: React.FC = () => {
  const { t, language } = useLanguage();
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

  const getGradient = () => {
    const mood = moods.find(m => m.id === selectedMood);
    return mood ? mood.color : 'from-orange-400 to-rose-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
       <div className="max-w-4xl w-full text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 mb-4 font-serif">
            Soul Compass
          </h1>
          <p className="text-gray-500 mb-10 text-lg">
            Ancient wisdom for your modern vibes. How are you feeling right now?
          </p>

          {/* Mood Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all transform hover:-translate-y-1 hover:shadow-md ${
                  selectedMood === mood.id
                    ? `bg-gradient-to-r ${mood.color} text-white shadow-lg scale-105`
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {mood.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="relative min-h-[400px] flex items-center justify-center">
            
            {status === LoadingState.IDLE && (
              <div className="text-gray-400 animate-pulse">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p>Tap a vibe to receive guidance.</p>
              </div>
            )}

            {status === LoadingState.LOADING && (
              <div className="text-center">
                <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 border-orange-400`}></div>
                <p className="text-gray-500 font-medium">Consulting the Gita...</p>
              </div>
            )}

            {status === LoadingState.SUCCESS && affirmation && (
              <div className="w-full max-w-2xl perspective-1000 animate-fade-in-up">
                 <div className={`relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br ${getGradient()} p-1`}>
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black opacity-10 blur-3xl"></div>
                    
                    <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 md:p-12 text-center h-full flex flex-col justify-center items-center relative z-10">
                       <span className="inline-block px-3 py-1 rounded-full bg-black/5 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
                         {affirmation.theme}
                       </span>
                       
                       <h2 className="text-2xl md:text-4xl font-serif font-medium text-gray-800 leading-tight mb-8">
                         "{affirmation.quote}"
                       </h2>
                       
                       <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8"></div>
                       
                       <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                         {affirmation.meaning}
                       </p>
                       
                       <div className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                         Bhagavad Gita {affirmation.verse}
                       </div>
                    </div>
                 </div>
                 
                 <div className="mt-8 flex justify-center gap-4">
                    <button 
                      onClick={() => handleMoodSelect(selectedMood!)}
                      className="px-6 py-2 bg-white rounded-full shadow-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Another One
                    </button>
                    {/* Placeholder for sharing functionality */}
                    <button className="px-6 py-2 bg-indigo-600 rounded-full shadow-sm text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                       </svg>
                       Share
                    </button>
                 </div>
              </div>
            )}
            
            {status === LoadingState.ERROR && (
               <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg">
                  Oops, the divine connection seems interrupted. Please try again.
               </div>
            )}
          </div>
       </div>
    </div>
  );
};

export default Affirmations;