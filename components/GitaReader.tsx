import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getVerse, getChapterSummary } from '../services/geminiService';
import { Verse, LoadingState, BookmarkItem } from '../types';
import { useLanguage } from './LanguageContext';

// Hardcoded verse counts for standard Gita chapters to enable navigation limits
const chapterVerseCounts = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78];
const chapters = Array.from({ length: 18 }, (_, i) => i + 1);

type FontSize = 'sm' | 'base' | 'lg' | 'xl';
type Theme = 'light' | 'dark';

const GitaReader: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  
  // Content State
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number>(1);
  const [verseData, setVerseData] = useState<Verse | null>(null);
  const [chapterInfo, setChapterInfo] = useState<{ title: string; summary: string } | null>(null);
  
  // UI State
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Preferences State
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [theme, setTheme] = useState<Theme>('light');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('hkc_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }

    const savedTheme = localStorage.getItem('hkc_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);

    const savedFontSize = localStorage.getItem('hkc_fontSize');
    if (savedFontSize) setFontSize(savedFontSize as FontSize);
  }, []);

  useEffect(() => {
    localStorage.setItem('hkc_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  useEffect(() => {
    const fetchChapterInfo = async () => {
      const info = await getChapterSummary(selectedChapter, language);
      setChapterInfo(info);
    };
    fetchChapterInfo();
  }, [selectedChapter, language]);

  // Initial load or State Navigation Load
  useEffect(() => {
      // Check for incoming state from Home page (Soul Compass)
      if (location.state && typeof location.state.chapter === 'number' && typeof location.state.verse === 'number') {
          handleFetchVerse(location.state.chapter, location.state.verse);
          // Clear history state to prevent loop if user refreshes? 
          // Actually, React Router history handles this, but good to know logic is robust.
          window.history.replaceState({}, document.title);
      } else {
          handleFetchVerse(selectedChapter, selectedVerse);
      }
  }, [language]); // Depend on language, but internal logic handles initial mount

  const handleFetchVerse = async (chapter = selectedChapter, verse = selectedVerse) => {
    setStatus(LoadingState.LOADING);
    setLoadingMsg(t('gita.reading'));
    try {
      const data = await getVerse(chapter, verse, language);
      setVerseData(data);
      setStatus(LoadingState.SUCCESS);
      setSelectedChapter(chapter);
      setSelectedVerse(verse);
      
      // Scroll to top of reading pane for better UX on mobile
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      setStatus(LoadingState.ERROR);
    }
  };

  const toggleBookmark = () => {
    const exists = bookmarks.some(b => b.chapter === selectedChapter && b.verse === selectedVerse);
    if (exists) {
      setBookmarks(prev => prev.filter(b => !(b.chapter === selectedChapter && b.verse === selectedVerse)));
      setToastMsg("Bookmark removed");
    } else {
      setBookmarks(prev => [...prev, { chapter: selectedChapter, verse: selectedVerse, timestamp: Date.now() }]);
      setToastMsg("Verse bookmarked");
    }
  };

  const loadBookmark = (b: BookmarkItem) => {
    setShowBookmarks(false);
    handleFetchVerse(b.chapter, b.verse);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('hkc_theme', newTheme);
  };

  const changeFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('hkc_fontSize', size);
  };

  // Navigation Handlers
  const handlePrevVerse = () => {
    if (selectedVerse > 1) {
      handleFetchVerse(selectedChapter, selectedVerse - 1);
    } else if (selectedChapter > 1) {
      // Go to previous chapter, last verse
      const prevChapter = selectedChapter - 1;
      const lastVerse = chapterVerseCounts[prevChapter - 1];
      handleFetchVerse(prevChapter, lastVerse);
    }
  };

  const handleNextVerse = () => {
    const currentChapterMax = chapterVerseCounts[selectedChapter - 1];
    if (selectedVerse < currentChapterMax) {
      handleFetchVerse(selectedChapter, selectedVerse + 1);
    } else if (selectedChapter < 18) {
      // Go to next chapter, first verse
      handleFetchVerse(selectedChapter + 1, 1);
    }
  };

  const isDark = theme === 'dark';
  
  const getFontSizeClass = (base: string) => {
    const sizeMap: Record<FontSize, string> = {
      'sm': 'text-sm', 'base': 'text-base', 'lg': 'text-lg', 'xl': 'text-xl'
    };
    if (base === 'h2') {
       const h2Map: Record<FontSize, string> = { 'sm': 'text-lg', 'base': 'text-xl', 'lg': 'text-2xl', 'xl': 'text-3xl' };
       return h2Map[fontSize];
    }
    if (base === 'sanskrit') {
       const sMap: Record<FontSize, string> = { 'sm': 'text-xl', 'base': 'text-2xl', 'lg': 'text-3xl', 'xl': 'text-4xl' };
       return sMap[fontSize];
    }
    return sizeMap[fontSize];
  };

  const isBookmarked = bookmarks.some(b => b.chapter === selectedChapter && b.verse === selectedVerse);

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${isDark ? 'bg-slate-900' : 'bg-[#f8fafc]'}`}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="text-sm font-medium">{toastMsg}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className={`text-5xl font-serif font-bold mb-3 ${isDark ? 'text-orange-300' : 'text-slate-800'}`}>
            {t('gita.title')}
          </h1>
          <p className={`text-lg font-light ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('gita.author')}
          </p>
        </div>

        {/* Modern Toolbar */}
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl mb-8 shadow-sm transition-all border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
           
           {/* Font Controls */}
           <div className="flex items-center space-x-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-full">
              {(['sm', 'base', 'lg', 'xl'] as FontSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => changeFontSize(s)}
                  className={`w-9 h-9 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                    fontSize === s 
                      ? 'bg-white text-orange-600 shadow-sm' 
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  title={`Font size: ${s}`}
                >
                  <span style={{ fontSize: s === 'sm' ? '12px' : s === 'base' ? '14px' : s === 'lg' ? '16px' : '18px' }}>A</span>
                </button>
              ))}
           </div>

           {/* Theme & Bookmarks */}
           <div className="flex items-center space-x-3">
              <button 
                onClick={toggleTheme}
                className={`p-3 rounded-full transition-colors ${isDark ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                title="Toggle Theme"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>

              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${
                  showBookmarks 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                    : isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
              >
                <svg className="w-4 h-4" fill={showBookmarks ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                <span>Bookmarks</span>
                {bookmarks.length > 0 && <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{bookmarks.length}</span>}
              </button>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
           
           {/* Sidebar Controls */}
           <div className={`md:col-span-4 ${showBookmarks ? 'hidden md:block' : 'block'}`}>
              <div className={`rounded-3xl p-6 shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                 <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Jump to Verse</h3>
                 <div className="space-y-4">
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('gita.chapter')}</label>
                        <select
                          value={selectedChapter}
                          onChange={(e) => {
                            setSelectedChapter(Number(e.target.value));
                            setSelectedVerse(1); 
                            setVerseData(null);
                          }}
                          className={`w-full rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-50 text-slate-800 border-slate-200'}`}
                        >
                          {chapters.map((c) => (
                            <option key={c} value={c}>{t('gita.chapter')} {c}</option>
                          ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('gita.verse')}</label>
                        <select
                          value={selectedVerse}
                          onChange={(e) => setSelectedVerse(Number(e.target.value))}
                          className={`w-full rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-50 text-slate-800 border-slate-200'}`}
                        >
                           {/* Dynamically generate verse options based on selected chapter */}
                           {Array.from({ length: chapterVerseCounts[selectedChapter - 1] }, (_, i) => i + 1).map(v => (
                             <option key={v} value={v}>Verse {v}</option>
                           ))}
                        </select>
                    </div>
                    <button
                        onClick={() => handleFetchVerse()}
                        disabled={status === LoadingState.LOADING}
                        className="w-full bg-orange-600 text-white py-3 rounded-2xl hover:bg-orange-700 transition duration-300 font-bold shadow-lg shadow-orange-200 disabled:opacity-50 disabled:shadow-none active:scale-95"
                    >
                        {status === LoadingState.LOADING ? 'Loading...' : t('gita.readBtn')}
                    </button>
                 </div>
              </div>

              {/* Chapter Summary Widget */}
              {chapterInfo && (
                <div className={`mt-6 rounded-3xl p-6 border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-orange-50/50 border-orange-100'}`}>
                    <h4 className={`font-bold mb-2 ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>{chapterInfo.title}</h4>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{chapterInfo.summary}</p>
                </div>
              )}
           </div>

           {/* Reading Pane */}
           <div className="md:col-span-8">
              {showBookmarks ? (
                <div className={`rounded-3xl p-6 md:p-8 shadow-sm border min-h-[400px] animate-fade-in ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-slate-700">
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Saved Verses</h2>
                        <button onClick={() => setShowBookmarks(false)} className="px-4 py-2 rounded-full bg-orange-100 text-sm font-bold text-orange-700 hover:bg-orange-200 transition-colors">Close</button>
                    </div>
                    <div className="grid gap-3">
                        {bookmarks.map((b, idx) => (
                        <button 
                            key={idx}
                            onClick={() => loadBookmark(b)}
                            className={`text-left p-5 rounded-2xl border transition-all hover:scale-[1.01] group ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md'}`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-orange-600 block mb-1">Chapter {b.chapter}, Verse {b.verse}</span>
                                <svg className="w-5 h-5 text-orange-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Saved on {new Date(b.timestamp).toLocaleDateString()}</span>
                        </button>
                        ))}
                        {bookmarks.length === 0 && (
                          <div className="text-center py-12">
                             <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-300'}`}>
                               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                             </div>
                             <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No bookmarks saved yet.</p>
                          </div>
                        )}
                    </div>
                </div>
              ) : (
                <>
                    {status === LoadingState.LOADING && (
                        <div className={`rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px] border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-orange-600 font-medium animate-pulse">{loadingMsg}</p>
                        </div>
                    )}
                    
                    {status === LoadingState.SUCCESS && verseData && (
                        <div className={`rounded-3xl overflow-hidden shadow-lg border transition-all duration-300 relative ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                            <div className="relative h-2 bg-gradient-to-r from-orange-400 to-rose-500"></div>
                            <div className="p-8 md:p-12 pb-24"> {/* Extra padding bottom for nav buttons */}
                                <div className="flex justify-between items-start mb-8">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${isDark ? 'bg-slate-700 text-orange-300' : 'bg-orange-100 text-orange-800'}`}>
                                        {t('gita.chapter')} {verseData.chapter} &bull; {t('gita.verse')} {verseData.verse}
                                    </span>
                                    <button 
                                      onClick={toggleBookmark} 
                                      className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                                      title={isBookmarked ? "Remove Bookmark" : "Bookmark Verse"}
                                    >
                                        <svg className={`w-7 h-7 ${isBookmarked ? 'text-orange-500 fill-current' : isDark ? 'text-slate-500' : 'text-slate-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} fill="none">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-10">
                                    <div className="text-center">
                                        <p className={`font-serif leading-loose font-medium ${getFontSizeClass('sanskrit')} ${isDark ? 'text-orange-100' : 'text-slate-800'}`}>
                                            {verseData.sanskrit.split('\n').map((line, i) => (
                                                <span key={i} className="block">{line}</span>
                                            ))}
                                        </p>
                                        <p className={`mt-6 italic ${getFontSizeClass('base')} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {verseData.transliteration}
                                        </p>
                                    </div>

                                    <div className="w-16 h-1 bg-orange-200 mx-auto rounded-full opacity-50"></div>

                                    <div>
                                        <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3 text-center">Translation</h3>
                                        <p className={`text-center font-medium leading-relaxed ${getFontSizeClass('lg')} ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                                            {verseData.translation}
                                        </p>
                                    </div>

                                    {verseData.purport && (
                                        <div className={`p-6 rounded-2xl ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                                            <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Purport</h3>
                                            <p className={`leading-loose text-justify ${getFontSizeClass('base')} ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                {verseData.purport}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Navigation Footer within Card */}
                            <div className={`absolute bottom-0 left-0 right-0 p-6 border-t flex justify-between items-center ${isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-50'}`}>
                               <button 
                                 onClick={handlePrevVerse}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'}`}
                               >
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                 Prev
                               </button>
                               <button 
                                 onClick={handleNextVerse}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                               >
                                 Next
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                               </button>
                            </div>
                        </div>
                    )}
                </>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default GitaReader;