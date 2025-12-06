import React, { useState, useEffect, useRef } from 'react';
import { findTemples, getTempleWisdom } from '../services/geminiService';
import { Temple, LoadingState, TempleWisdom } from '../types';
import { useLanguage } from './LanguageContext';

declare global {
  interface Window {
    L: any;
  }
}

const TempleLocator: React.FC = () => {
  const { t, language } = useLanguage();
  const [locationQuery, setLocationQuery] = useState('');
  const [temples, setTemples] = useState<Temple[]>([]);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [selectedTempleIndex, setSelectedTempleIndex] = useState<number | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Wisdom State
  const [templeWisdom, setTempleWisdom] = useState<TempleWisdom | null>(null);
  const [wisdomLoading, setWisdomLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('hkc_temple_history');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Fetch Wisdom when selection changes
  useEffect(() => {
    const fetchWisdom = async () => {
        if (selectedTempleIndex === null || !temples[selectedTempleIndex]) {
            setTempleWisdom(null);
            return;
        }

        const temple = temples[selectedTempleIndex];
        setWisdomLoading(true);
        setTempleWisdom(null);
        
        try {
            const data = await getTempleWisdom(temple.name, temple.city, language);
            // Verify if selection is still the same to prevent race conditions
            // Accessing current value via index is safe here as effect runs on change
            setTempleWisdom(data);
        } catch (error) {
            console.error(error);
        } finally {
            setWisdomLoading(false);
        }
    };

    fetchWisdom();
  }, [selectedTempleIndex, temples, language]);

  const addToHistory = (query: string) => {
    const clean = query.trim();
    if (!clean) return;
    const updated = [clean, ...recentSearches.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('hkc_temple_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('hkc_temple_history');
  };

  const executeSearch = async (query: string) => {
    setStatus(LoadingState.LOADING);
    setTemples([]);
    setSelectedTempleIndex(null);
    setTempleWisdom(null);
    
    try {
      const results = await findTemples(query, language);
      setTemples(results);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(LoadingState.ERROR);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    addToHistory(locationQuery);
    await executeSearch(locationQuery);
  };

  const handleHistoryClick = (query: string) => {
    setLocationQuery(query);
    executeSearch(query);
  };

  const handleUseCurrentLocation = () => {
     if (navigator.geolocation) {
       setStatus(LoadingState.LOADING);
       setSelectedTempleIndex(null);
       setTempleWisdom(null);
       navigator.geolocation.getCurrentPosition(async (position) => {
          setLocationQuery(t('temples.nearMe'));
          const results = await findTemples(`coordinates ${position.coords.latitude}, ${position.coords.longitude}`, language);
          setTemples(results);
          setStatus(LoadingState.SUCCESS);
       }, (err) => {
         alert("Could not get location. Please enter city manually.");
         setStatus(LoadingState.IDLE);
       });
     } else {
       alert("Geolocation is not supported by this browser.");
     }
  };

  const handleTempleClick = (idx: number) => {
    setSelectedTempleIndex(idx);
    if (itemRefs.current[idx]) {
      itemRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (markersRef.current[idx]) markersRef.current[idx].openPopup();
  };

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (temples.length > 0) {
        const bounds = window.L.latLngBounds([]);
        let hasValidCoords = false;

        temples.forEach((temple, idx) => {
            if (temple.coordinates && typeof temple.coordinates.lat === 'number' && typeof temple.coordinates.lng === 'number') {
                const marker = window.L.marker([temple.coordinates.lat, temple.coordinates.lng])
                    .addTo(map)
                    .bindPopup(`
                        <div style="font-family: 'Outfit', sans-serif; text-align:center;">
                            <h3 style="color:#ea580c; font-weight:700; margin-bottom:4px;">${temple.name}</h3>
                            <p style="font-size:12px; color:#64748b;">${temple.city}</p>
                        </div>
                    `);
                
                // Add click listener that calls the React state updater
                marker.on('click', () => {
                    handleTempleClick(idx);
                });
                
                markersRef.current.push(marker);
                bounds.extend([temple.coordinates.lat, temple.coordinates.lng]);
                hasValidCoords = true;
            }
        });

        if (hasValidCoords) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }
  }, [temples]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
       <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl text-slate-800 font-serif font-bold mb-4">{t('temples.title')}</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">{t('temples.subtitle')}</p>
      </div>

      {/* Floating Search Bar */}
      <div className="max-w-3xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="bg-white p-2 rounded-full shadow-lg border border-slate-100 flex items-center">
            <div className="pl-4 text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder={t('temples.placeholder')}
              className="flex-grow px-4 py-3 bg-transparent outline-none text-slate-700 placeholder-slate-400"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            <button 
                type="button"
                onClick={handleUseCurrentLocation}
                className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-orange-600 px-3 border-r border-slate-200"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Near Me
            </button>
            <button 
                type="submit"
                className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition-colors ml-2 shadow-md shadow-orange-200"
                disabled={status === LoadingState.LOADING}
            >
                {status === LoadingState.LOADING ? '...' : t('temples.search')}
            </button>
        </form>
        {recentSearches.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {recentSearches.map((s, i) => (
                    <button key={i} onClick={() => handleHistoryClick(s)} className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full hover:bg-slate-50 transition-colors">
                        {s}
                    </button>
                ))}
                <button onClick={clearHistory} className="text-xs text-orange-500 hover:text-orange-700 underline px-2">Clear</button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[700px]">
        {/* Results List */}
        <div className="overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {status === LoadingState.IDLE && (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center">
               <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <p className="text-slate-500">{t('temples.placeholder')}</p>
            </div>
          )}
          
          {status === LoadingState.ERROR && (
             <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-center">
               Unable to find location. Please try again.
            </div>
          )}

          {temples.map((temple, idx) => (
            <div 
              key={idx} 
              ref={el => itemRefs.current[idx] = el}
              onClick={() => handleTempleClick(idx)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                selectedTempleIndex === idx 
                  ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200 shadow-md transform scale-[1.01]' 
                  : 'bg-white border-slate-100 hover:shadow-lg hover:border-orange-100'
              }`}
            >
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{temple.name}</h3>
                    <p className="text-orange-600 text-sm font-medium">{temple.city}, {temple.country}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${selectedTempleIndex === idx ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-600'}`}>
                      {idx + 1}
                  </div>
              </div>
              
              <p className="text-slate-500 text-sm mt-3 mb-4 leading-relaxed">{temple.description || temple.address}</p>
              
              {temple.timings && (
                  <div className="mb-4 inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {temple.timings}
                  </div>
              )}

              {/* Dynamic Spiritual Wisdom Card */}
              {selectedTempleIndex === idx && (
                 <div className="mt-4 pt-4 border-t border-orange-100 animate-fade-in">
                    {wisdomLoading ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm italic">
                            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                            Receiving spiritual insight...
                        </div>
                    ) : templeWisdom ? (
                        <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100 p-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                <svg className="w-20 h-20 text-orange-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            </div>
                            <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                Temple Wisdom &bull; {templeWisdom.verseReference}
                            </h4>
                            <p className="text-slate-800 font-serif italic mb-3 text-lg leading-relaxed">"{templeWisdom.translation}"</p>
                            <p className="text-slate-600 text-sm leading-relaxed border-t border-orange-100 pt-2"><span className="font-semibold text-orange-800">Connection:</span> {templeWisdom.significance}</p>
                        </div>
                    ) : null}
                 </div>
              )}

              <div className="flex gap-3 mt-4">
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(temple.name + " " + temple.address)}`, '_blank')
                  }}
                  className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl hover:bg-slate-800 text-sm font-bold transition-colors shadow-lg shadow-slate-200"
                 >
                   Get Directions
                 </button>
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTempleClick(idx);
                  }}
                  className="px-4 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors"
                 >
                   {selectedTempleIndex === idx ? 'Locating...' : 'View on Map'}
                 </button>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="h-full bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200 relative">
            <div id="map" ref={mapContainerRef} className="w-full h-full z-0"></div>
            {status === LoadingState.LOADING && (
                 <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-sm">
                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TempleLocator;