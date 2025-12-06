import React, { useState, useEffect } from 'react';
import { getBhajanLyrics } from '../services/geminiService';
import { Song, LoadingState } from '../types';
import { useLanguage } from './LanguageContext';

const songCategories = {
  aarti: [
    "Mangala Aarti (Samsara Davanala)",
    "Tulasi Aarti",
    "Gaur Aarti (Kiba Jaya Jaya)",
    "Nrisimha Aarti",
    "Damodarashtakam",
    "Guruvashtakam",
    "Sri Guru Charana Padma",
    "Thakura Vaishnava Pada",
    "Nama Sankirtana (Hari Haraye Namah Krishna)"
  ],
  goswami: [
    "Shad Goswami Ashtakam",
    "Radha Kripa Kataksha",
    "Manah Shiksha",
    "Vraja Vilasa Stava",
    "Mukunda Mala Stotra",
    "Sri Govinda Damodara Stotra",
    "Jagannathashtakam"
  ],
  acharyas: [
    "Jaya Radha Madhava",
    "Bhaja Hu Re Mana",
    "Gauranga Bolite Habe",
    "Je Anilo Prema Dhana",
    "Hari Hari Biphale",
    "Gopinath Mama Nivedana Suno",
    "Vibhavari Shesha",
    "Radha Krishna Prana Mora",
    "Suddha Bhakata Charana Renu"
  ]
};

const VaishnavGeet: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<keyof typeof songCategories>('aarti');
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [songData, setSongData] = useState<Song | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);

  useEffect(() => {
    if (!selectedSong) return;

    const fetchLyrics = async () => {
      setStatus(LoadingState.LOADING);
      try {
        const data = await getBhajanLyrics(selectedSong, language);
        setSongData(data);
        setStatus(LoadingState.SUCCESS);
      } catch (error) {
        console.error(error);
        setStatus(LoadingState.ERROR);
      }
    };

    fetchLyrics();
  }, [selectedSong, language]);

  const handleSongSelect = (songTitle: string) => {
    if (selectedSong !== songTitle) {
        setSongData(null);
        setSelectedSong(songTitle);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl text-slate-800 font-serif font-bold mb-4">{t('geet.title')}</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light">
          {t('geet.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Song List */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
             {/* Category Tabs as segmented control */}
             <div className="p-4 bg-slate-50/50">
                <div className="flex bg-slate-200/50 p-1 rounded-xl">
                    {['aarti', 'goswami', 'acharyas'].map((cat) => (
                        <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat as any)}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeCategory === cat ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                        {t(`geet.cat.${cat}`)}
                        </button>
                    ))}
                </div>
             </div>

            <ul className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto px-2 pb-2">
              {songCategories[activeCategory].map((song) => (
                <li key={song}>
                  <button
                    onClick={() => handleSongSelect(song)}
                    className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-200 flex items-center justify-between group mb-1 ${
                      selectedSong === song ? 'bg-orange-50 text-orange-700' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`font-medium text-sm ${selectedSong === song ? 'font-bold' : ''}`}>{song}</span>
                    {selectedSong === song && (
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content: Lyrics & Player */}
        <div className="lg:col-span-8">
          {status === LoadingState.IDLE && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center justify-center h-full min-h-[500px]">
              <div className="bg-orange-50 p-6 rounded-full mb-6">
                <svg className="w-12 h-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('geet.select')}</h3>
              <p className="text-slate-500">{t('geet.select.desc')}</p>
            </div>
          )}

          {status === LoadingState.LOADING && (
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center h-full min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-orange-600 font-medium">Retrieving lyrics...</p>
             </div>
          )}

          {status === LoadingState.SUCCESS && songData && (
            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
               {/* Hero Header */}
               <div className="relative h-64 bg-gradient-to-br from-orange-600 to-rose-600 flex items-center justify-center p-8 text-center">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  <div className="relative z-10">
                    <h2 className="text-4xl font-serif font-bold text-white mb-3 drop-shadow-sm">{songData.title}</h2>
                    <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-sm backdrop-blur-md border border-white/20">
                        {songData.author}
                    </span>
                  </div>
               </div>

               {/* Audio Bar */}
               <div className="bg-slate-900 p-4">
                  <div className="bg-slate-800 rounded-2xl p-2 flex items-center gap-4">
                     <button className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform">
                       <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                         <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                       </svg>
                     </button>
                     <div className="flex-1">
                        <div className="h-1 bg-slate-600 rounded-full mb-2 overflow-hidden">
                            <div className="h-full w-1/3 bg-orange-500 rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 font-mono">
                            <span>1:24</span>
                            <span>5:30</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Content */}
               <div className="p-8 md:p-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Lyrics */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-slate-300"></span> Original Lyrics
                      </h3>
                      <div className="space-y-6 text-lg font-serif text-slate-800 leading-relaxed">
                        {songData.lyrics.map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>
                    </div>
                    
                    {/* Translation */}
                    {songData.translation && (
                      <div className="md:border-l md:border-slate-100 md:pl-12">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <span className="w-8 h-[1px] bg-slate-300"></span> Translation
                        </h3>
                        <div className="space-y-6 text-slate-600 leading-relaxed">
                          {songData.translation.map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                      </div>
                    )}
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaishnavGeet;