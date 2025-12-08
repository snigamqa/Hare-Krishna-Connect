import React, { useState, useEffect } from 'react';
import { getKrishnaLeela, getLeelasList, generateDevotionalImage } from '../services/geminiService';
import { KrishnaLeela, LoadingState } from '../types';
import { useLanguage } from './LanguageContext';

const KrishnaLeelas: React.FC = () => {
  const { t, language } = useLanguage();
  const [leelasList, setLeelasList] = useState<string[]>([]);
  const [selectedLeela, setSelectedLeela] = useState<string | null>(null);
  const [leelaData, setLeelaData] = useState<KrishnaLeela | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [imageStatus, setImageStatus] = useState<LoadingState>(LoadingState.IDLE);

  // Load leelas list on mount
  useEffect(() => {
    const loadLeelas = async () => {
      setStatus(LoadingState.LOADING);
      const leelas = await getLeelasList(language);
      setLeelasList(leelas);
      setStatus(LoadingState.IDLE);
    };
    loadLeelas();
  }, [language]);

  const handleLeelaClick = async (leela: string) => {
    setSelectedLeela(leela);
    setStatus(LoadingState.LOADING);
    setGeneratedImage(null);
    setLeelaData(null);

    try {
      const data = await getKrishnaLeela(leela, language);
      if (data) {
        setLeelaData(data);
        setStatus(LoadingState.SUCCESS);

        // Generate image
        setImageStatus(LoadingState.LOADING);
        const imagePrompt = `${data.imageDescription}. Divine Krishna, Radha, Gopis, peacocks, Vrindavan landscape. Golden lighting, spiritual atmosphere. Oil painting style, highly detailed, celestial.`;
        const base64Image = await generateDevotionalImage(imagePrompt);
        if (base64Image) {
          setGeneratedImage(base64Image);
          setImageStatus(LoadingState.SUCCESS);
        }
      } else {
        setStatus(LoadingState.ERROR);
      }
    } catch (e) {
      console.error(e);
      setStatus(LoadingState.ERROR);
    }
  };

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'childhood': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    'vrindavan': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    'kurukshetra': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  };

  const getCategoryColor = (category: string) => {
    const key = Object.keys(categoryColors).find(k => category.toLowerCase().includes(k));
    return categoryColors[key || 'childhood'];
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl text-slate-800 font-serif font-bold mb-4">Krishna Leelas</h1>
        <p className="text-slate-500">Explore the divine pastimes and divine stories of Lord Krishna</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Leelas List */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-20">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Select a Leela</h2>
            {leelasList.length === 0 ? (
              <div className="text-slate-400 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                <p>Loading leelas...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {leelasList.map((leela, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLeelaClick(leela)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                      selectedLeela === leela
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-slate-50 text-slate-800 hover:bg-orange-50'
                    }`}
                  >
                    <p className="font-medium text-sm">{leela}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-9">
          {status === LoadingState.LOADING ? (
            <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-3xl border border-slate-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
              <p className="text-slate-500 font-medium">Retrieving divine story...</p>
            </div>
          ) : status === LoadingState.IDLE && !selectedLeela ? (
            <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 text-lg">Select a leela from the list to begin</p>
              <p className="text-slate-300 text-sm mt-2">✨ Discover Krishna's divine pastimes ✨</p>
            </div>
          ) : leelaData ? (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
              {/* Image */}
              <div className="relative w-full h-80 bg-slate-100">
                {imageStatus === LoadingState.LOADING && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mb-2"></div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Manifesting vision...</span>
                    </div>
                  </div>
                )}
                {generatedImage && (
                  <img src={generatedImage} alt={leelaData.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <h2 className="text-4xl font-serif font-bold mb-2">{leelaData.title}</h2>
                  <div className="flex gap-2">
                    {leelaData.category && (
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${getCategoryColor(leelaData.category).bg} ${getCategoryColor(leelaData.category).text}`}>
                        {leelaData.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Overview</h3>
                  <p className="text-slate-700 leading-relaxed text-lg">{leelaData.description}</p>
                </div>

                {/* Full Story */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">The Story</h3>
                  <p className="text-slate-700 leading-loose text-lg whitespace-pre-wrap">{leelaData.fullStory}</p>
                </div>

                {/* Moral Lesson */}
                <div className="bg-orange-50 border border-orange-100 p-8 rounded-2xl">
                  <h3 className="text-lg font-serif font-bold text-orange-900 mb-4">Spiritual Lesson</h3>
                  <p className="text-orange-800 leading-relaxed">{leelaData.moralLesson}</p>
                </div>

                {/* Related Verses */}
                {leelaData.relatedVerses && leelaData.relatedVerses.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Related Gita Verses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {leelaData.relatedVerses.map((verse, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <p className="text-slate-600 italic text-sm">{verse}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default KrishnaLeelas;
