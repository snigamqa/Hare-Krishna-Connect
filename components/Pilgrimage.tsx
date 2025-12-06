import React, { useState, useEffect, useRef } from 'react';
import { getSaintDetails, getHolyPlaceDetails, generateDevotionalImage } from '../services/geminiService';
import { Saint, HolyPlace, LoadingState } from '../types';
import { useLanguage } from './LanguageContext';

const MANTRA_AUDIO_URL = "https://archive.org/download/MahaMantra_201708/Maha%20Mantra.mp3"; 

type Tab = 'saints' | 'places' | 'temples';

const saintsList = ["Chaitanya Mahaprabhu", "Rupa Goswami", "Sanatana Goswami", "Jiva Goswami", "Gopala Bhatta Goswami", "Raghunatha Dasa Goswami", "Raghunatha Bhatta Goswami"];
const placesList = ["Radha Kunda", "Shyam Kunda", "Govardhan Hill", "Kusum Sarovar", "Seva Kunj", "Nidhivan", "Varshana", "Nandgaon", "Gokul", "Mathura Janmabhoomi", "Keshi Ghat", "Chir Ghat", "Kalindi Kunj"];
const templesList = ["Sri Govindaji Temple", "Sri Madana-mohana Temple", "Sri Gopinatha Temple", "Sri Radha-Ramana Temple", "Sri Radha-Damodara Temple", "Sri Gokulananda Temple", "Sri Syamasundara Temple"];

const Pilgrimage: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('saints');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  const [saintData, setSaintData] = useState<Saint | null>(null);
  const [placeData, setPlaceData] = useState<HolyPlace | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [imageStatus, setImageStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(MANTRA_AUDIO_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    const playAudio = async () => {
      try { if (audioRef.current) await audioRef.current.play(); } 
      catch (err) { console.log("Audio autoplay prevented."); }
    };
    playAudio();
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const fetchImage = async (prompt: string) => {
    setImageStatus(LoadingState.LOADING);
    setGeneratedImage(null);
    const base64Image = await generateDevotionalImage(prompt);
    if (base64Image) {
      setGeneratedImage(base64Image);
      setImageStatus(LoadingState.SUCCESS);
    } else {
      setImageStatus(LoadingState.ERROR);
    }
  };

  const handleItemClick = async (item: string) => {
    setSelectedItem(item);
    setStatus(LoadingState.LOADING);
    setImageStatus(LoadingState.IDLE);
    setSaintData(null);
    setPlaceData(null);
    setGeneratedImage(null);

    try {
      if (activeTab === 'saints') {
        const data = await getSaintDetails(item, language);
        setSaintData(data);
        setStatus(LoadingState.SUCCESS);
        const baseDesc = data.imageDescription || `Portrait of the great Vaishnava saint ${data.name}`;
        const refinedPrompt = `${baseDesc}. The saint should be depicted in traditional 16th-century devotional attire, wearing saffron or simple white cloth, with Tulsi neck beads and Vaishnava Tilak on the forehead. The facial expression should radiate deep humility, compassion, and spiritual ecstasy. The setting should be a serene forest grove in Vrindavan or the courtyard of an ancient stone temple. The lighting should be soft, golden, and ethereal, highlighting the saint's divine nature. Style: Classic devotional oil painting, highly detailed and realistic.`;
        fetchImage(refinedPrompt);
      } else {
        const data = await getHolyPlaceDetails(item, language);
        setPlaceData(data);
        setStatus(LoadingState.SUCCESS);
        const baseDesc = data.imageDescription || `The holy site of ${data.name} in Braj Bhumi`;
        const refinedPrompt = `${baseDesc}. The scene should capture the timeless, mystical atmosphere of the spiritual world. Include elements like lush Kadamba trees, peacocks, the Yamuna river (if applicable), and ancient sandstone architecture. The atmosphere should be peaceful and surcharged with devotion. Lighting should be the soft glow of dawn or dusk. Style: Photorealistic devotional landscape art, evocative and divine.`;
        fetchImage(refinedPrompt);
      }
    } catch (e) {
      console.error(e);
      setStatus(LoadingState.ERROR);
    }
  };

  const renderContent = () => {
    if (status === LoadingState.LOADING) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 h-full min-h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
          <p className="text-slate-500 font-medium">Consulting Vedic Archives...</p>
        </div>
      );
    }

    if (status === LoadingState.IDLE && !selectedItem) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <p className="mb-4 text-lg">Select a sacred place or saint</p>
        </div>
      );
    }

    const item = saintData || placeData;
    if (!item) return null;

    return (
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
         <div className="relative w-full h-80 bg-slate-100">
            {imageStatus === LoadingState.LOADING && (
               <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-50/50 backdrop-blur-sm z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mb-2"></div>
                    <span className="text-xs font-bold uppercase tracking-wider">Manifesting vision...</span>
                  </div>
               </div>
            )}
            {imageStatus === LoadingState.SUCCESS && generatedImage && (
               <img src={generatedImage} alt={item.name} className="w-full h-full object-cover animate-fade-in" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white">
                <h2 className="text-4xl font-serif font-bold mb-2">{item.name}</h2>
                <p className="opacity-90 font-light">{(item as Saint).title || (item as HolyPlace).location}</p>
            </div>
         </div>

         <div className="p-8 md:p-12 space-y-8">
           {'bio' in item ? (
             <>
               <div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Biography</h3>
                 <p className="text-slate-700 leading-loose text-lg font-light">{item.bio}</p>
               </div>
               <div className="grid md:grid-cols-2 gap-8">
                {item.contributions && (
                    <div className="bg-orange-50 p-6 rounded-2xl">
                        <h3 className="text-sm font-bold text-orange-800 uppercase mb-4">Contributions</h3>
                        <ul className="space-y-2 text-slate-700">
                        {item.contributions.map((c, i) => <li key={i} className="flex gap-2"><span className="text-orange-400">•</span> {c}</li>)}
                        </ul>
                    </div>
                )}
                {item.placesFound && (
                    <div className="bg-slate-50 p-6 rounded-2xl">
                        <h3 className="text-sm font-bold text-slate-800 uppercase mb-4">Discovered Places</h3>
                        <ul className="space-y-2 text-slate-700">
                        {item.placesFound.map((p, i) => <li key={i} className="flex gap-2"><span className="text-slate-400">•</span> {p}</li>)}
                        </ul>
                    </div>
                )}
               </div>
             </>
           ) : (
             <>
               <div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Description</h3>
                 <p className="text-slate-700 leading-loose text-lg">{item.description}</p>
               </div>
               <div className="bg-orange-50 border border-orange-100 p-8 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-24 h-24 text-orange-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
                 </div>
                 <h3 className="text-lg font-serif font-bold text-orange-900 mb-3 relative z-10">Divine Pastimes (Lila)</h3>
                 <p className="text-orange-800/80 italic leading-relaxed relative z-10">{item.pastime}</p>
               </div>
               <div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Significance</h3>
                 <p className="text-slate-700 leading-relaxed">{item.significance}</p>
               </div>
             </>
           )}
         </div>
      </div>
    );
  };

  const getList = () => {
    switch(activeTab) {
      case 'saints': return saintsList;
      case 'places': return placesList;
      case 'temples': return templesList;
      default: return [];
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 relative">
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="bg-white/90 backdrop-blur text-slate-800 rounded-full p-4 shadow-xl border border-slate-100 hover:scale-105 transition-transform"
        >
          {isMuted ? (
             <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          ) : (
             <svg className="w-6 h-6 text-orange-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          )}
        </button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-5xl text-slate-800 font-serif font-bold mb-4">{t('pilgrim.title')}</h1>
        <p className="text-slate-500 max-w-xl mx-auto">{t('pilgrim.subtitle')}</p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="bg-white p-1 rounded-full shadow-sm border border-slate-200 inline-flex">
            {[
            { id: 'saints', label: t('pilgrim.tab.saints') },
            { id: 'places', label: t('pilgrim.tab.places') },
            { id: 'temples', label: t('pilgrim.tab.temples') }
            ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => {
                setActiveTab(tab.id as Tab);
                setSelectedItem(null);
                setSaintData(null);
                setPlaceData(null);
                setGeneratedImage(null);
                setStatus(LoadingState.IDLE);
                }}
                className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                activeTab === tab.id
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
                {tab.label}
            </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="p-4 bg-slate-50 border-b border-slate-100">
                   <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Item</h3>
               </div>
               <ul className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {getList().map((item) => (
                <li key={item}>
                    <button 
                        onClick={() => handleItemClick(item)}
                        className={`w-full text-left px-6 py-5 hover:bg-slate-50 transition-colors flex justify-between items-center group ${
                        selectedItem === item ? 'bg-orange-50/50' : ''
                        }`}
                    >
                    <span className={`font-medium transition-colors ${selectedItem === item ? 'text-orange-700 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>{item}</span>
                    {selectedItem === item && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                    </button>
                </li>
                ))}
            </ul>
           </div>
        </div>
        <div className="lg:col-span-8 min-h-[500px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Pilgrimage;