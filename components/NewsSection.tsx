import React, { useEffect, useState } from 'react';
import { getISKCONNews, getVaishnavCalendarEvents, VaishnavEvent } from '../services/geminiService';
import { NewsItem } from '../types';
import { useLanguage } from './LanguageContext';

const NewsSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<string>(t('news.global'));
  const [upcomingEvents, setUpcomingEvents] = useState<VaishnavEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  
  // Initial load effect
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      // 1. Start by fetching global news immediately to ensure <1s render of content
      setLoading(true);
      try {
        const globalNews = await getISKCONNews(undefined, language);
        if (isMounted) {
            setNews(globalNews);
            setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }

      // 2. Attempt to get location in background to "upgrade" the content
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                if (!isMounted) return;
                
                setLocationStatus(t('news.location'));
                // Fetch local news silently or with a small indicator, 
                // but we typically replace the list.
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Set loading only if we really want to block UI, 
                // but to keep it fast, maybe just swap data when ready.
                // However, visually it helps to know it's updating.
                setLoading(true);
                try {
                    const localNews = await getISKCONNews(coords, language);
                    if (isMounted) {
                        setNews(localNews);
                        setLocationStatus(t('news.local'));
                    }
                } catch (e) {
                    console.error("Local news fetch failed", e);
                } finally {
                    if (isMounted) setLoading(false);
                }
            },
            (error) => {
                console.warn("Location access denied or failed, staying on global news", error);
                // No action needed, we already have global news
            },
            { timeout: 5000 } // Don't wait too long
        );
      }
    };

    loadData();

    // Load Vaishnava calendar events
    const loadEvents = async () => {
      setEventsLoading(true);
      try {
        const events = await getVaishnavCalendarEvents(language);
        if (isMounted) {
          setUpcomingEvents(events);
        }
      } catch (e) {
        console.error("Failed to load events", e);
      } finally {
        if (isMounted) setEventsLoading(false);
      }
    };
    loadEvents();

    return () => { isMounted = false; };
  }, [language, t]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl text-slate-800 font-serif font-bold mb-4">{t('news.title')}</h1>
        <p className="text-slate-500 mb-4">{t('news.subtitle')}</p>
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
           {locationStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Latest News Feed */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
             <h2 className="text-2xl font-bold text-slate-800">{t('news.latest')}</h2>
             <div className="h-[1px] bg-slate-200 flex-grow"></div>
          </div>
          
          {loading ? (
             <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="animate-pulse bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-40"></div>
               ))}
             </div>
          ) : (
             news.length > 0 ? news.map((item, index) => (
                <div key={index} className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-orange-100 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{item.source || 'News'}</span>
                    <span className="text-xs font-medium text-slate-400">{item.date || 'Recently'}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-orange-600 transition-colors cursor-pointer leading-tight">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.summary}</p>
                </div>
             )) : (
                <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">No updates currently available.</div>
             )
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 space-y-8">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                 {t('news.upcoming')}
              </h3>
              {eventsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <ul className="space-y-6">
                  {upcomingEvents.map((event, idx) => {
                    const colors = [
                      { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
                      { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                      { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
                    ];
                    const color = colors[idx % colors.length];
                    return (
                      <li key={idx} className="flex gap-4 items-center">
                        <div className={`flex-shrink-0 w-14 h-14 ${color.bg} rounded-2xl flex flex-col items-center justify-center ${color.text} font-bold border ${color.border}`}>
                          <span className="text-[10px] uppercase tracking-wide">{event.month}</span>
                          <span className="text-xl leading-none">{event.day}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{event.title}</p>
                          <p className="text-xs text-slate-500">{event.description}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-slate-400 text-sm text-center py-4">No upcoming events</p>
              )}
           </div>

           <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl shadow-lg text-white">
              <h3 className="text-xl font-bold mb-6">{t('news.official')}</h3>
              <div className="space-y-3">
                 <a href="https://twitter.com/iskcon" target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-colors font-medium border border-white/10 backdrop-blur-sm">
                    Twitter / X
                 </a>
                 <a href="https://www.facebook.com/iskcon" target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-colors font-medium border border-white/10 backdrop-blur-sm">
                    Facebook
                 </a>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default NewsSection;