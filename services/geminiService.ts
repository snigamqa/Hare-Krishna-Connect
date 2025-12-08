import { Verse, Song, Temple, NewsItem, Saint, HolyPlace, Affirmation, TempleWisdom, KrishnaLeela } from "../types";

// Backend API URL - defaults to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface VaishnavEvent {
  date: string;
  month: string;
  day: string;
  title: string;
  description: string;
}

// --- Caching System ---
const CACHE_PREFIX = 'hkc_cache_v1_';

function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Cache read error", e);
  }
  return null;
}

function saveToCache(key: string, data: any) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn("Cache write error (quota exceeded?)", e);
  }
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// Helper to call backend API
async function callBackendAPI<T>(endpoint: string, body: any): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Backend API error at ${endpoint}:`, error);
    throw error;
  }
}

export const getVaishnavCalendarEvents = async (language: string = 'en'): Promise<VaishnavEvent[]> => {
  const today = new Date();
  const cacheKey = `vaishnav_calendar_${today.getFullYear()}_${today.getMonth()}_${language}`;
  const cached = getFromCache<VaishnavEvent[]>(cacheKey);
  if (cached) return cached;

  try {
    const result = await callBackendAPI<VaishnavEvent[]>('/api/calendar/events', { language });
    saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching Vaishnava calendar:", error);
    return [];
  }
};

// --- Bhagavad Gita Services ---

export const getChapterSummary = async (chapterNumber: number, language: string): Promise<{ title: string; summary: string }> => {
  const cacheKey = `chapter_${chapterNumber}_${language}`;
  const cached = getFromCache<{ title: string; summary: string }>(cacheKey);
  if (cached) return cached;

  try {
    const result = await callBackendAPI<{ title: string; summary: string }>('/api/gita/chapter', {
      chapter: chapterNumber,
      language,
    });
    saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return { title: `Chapter ${chapterNumber}`, summary: "Unable to load summary at this time." };
  }
};

export const getVerse = async (chapter: number, verse: number, language: string): Promise<Verse> => {
  const cacheKey = `verse_${chapter}_${verse}_${language}`;
  const cached = getFromCache<Verse>(cacheKey);
  if (cached) return cached;

  try {
    const result = await callBackendAPI<Verse>('/api/gita/verse', {
      chapter,
      verse,
      language,
    });
    saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching verse:", error);
    throw error;
  }
};
            translation: { type: Type.STRING },
            purport: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return JSON.parse(text) as Verse;
  });
  
  saveToCache(cacheKey, result);
  return result;
};

export const getGitaAffirmation = async (mood: string, language: string): Promise<Affirmation> => {
  const cacheKey = `affirmation_${mood}_${language}`;
  const cached = getFromCache<Affirmation>(cacheKey);
  if (cached) return cached;

  if (!apiKey) throw new Error("API Key missing");

  const result = await retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Spiritual mentor for Gen Z feeling "${mood}". 
      Return JSON: quote (Gita based), verse (e.g. "2.47"), meaning (1 sentence), theme (1 word).
      Language: ${language}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            verse: { type: Type.STRING },
            meaning: { type: Type.STRING },
            theme: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return JSON.parse(text) as Affirmation;
  });

  saveToCache(cacheKey, result);
  return result;
};

// --- Vaishnav Geet Services ---

export const getBhajanLyrics = async (songTitle: string, language: string): Promise<Song> => {
  const cacheKey = `lyrics_${songTitle}_${language}`;
  const cached = getFromCache<Song>(cacheKey);
  if (cached) return cached;

  if (!apiKey) throw new Error("API Key missing");

  const result = await retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Lyrics and translation for "${songTitle}" (Vaishnav song). Lang: ${language}. JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            lyrics: { type: Type.ARRAY, items: { type: Type.STRING } },
            translation: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return JSON.parse(text) as Song;
  });

  saveToCache(cacheKey, result);
  return result;
};

// --- Temple Locator Services ---

export const findTemples = async (location: string, language: string): Promise<Temple[]> => {
  const cacheKey = `temples_${location}_${language}`;
  const cached = getFromCache<Temple[]>(cacheKey);
  if (cached) return cached;

  if (!apiKey) return [];
  
  try {
    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `List 5 ISKCON centers in/near ${location}. JSON. Lang: ${language}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                address: { type: Type.STRING },
                city: { type: Type.STRING },
                country: { type: Type.STRING },
                description: { type: Type.STRING },
                timings: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                     lat: { type: Type.NUMBER },
                     lng: { type: Type.NUMBER }
                  }
                }
              },
            },
          },
        },
      });

      const text = response.text;
      if (!text) return [];
      return JSON.parse(text) as Temple[];
    });
    
    saveToCache(cacheKey, result);
    return result;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getTempleWisdom = async (templeName: string, location: string, language: string): Promise<TempleWisdom | null> => {
  const cacheKey = `wisdom_${templeName}_${location}_${language}`;
  const cached = getFromCache<TempleWisdom>(cacheKey);
  if (cached) return cached;

  if (!apiKey) return null;

  try {
    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Select 1 Gita verse for ${templeName}, ${location}. Lang: ${language}. JSON: verseReference, translation, significance (1 sentence).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verseReference: { type: Type.STRING },
              translation: { type: Type.STRING },
              significance: { type: Type.STRING },
            },
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("No data returned");
      return JSON.parse(text) as TempleWisdom;
    });

    saveToCache(cacheKey, result);
    return result;
  } catch (e) {
    console.error("Temple wisdom fetch failed", e);
    return null;
  }
};

// --- News Services ---

export const getISKCONNews = async (location?: {lat: number, lng: number}, language: string = 'en'): Promise<NewsItem[]> => {
  const locKey = location ? `${location.lat.toFixed(2)}_${location.lng.toFixed(2)}` : 'global';
  const cacheKey = `news_${locKey}_${language}`;
  const cached = getFromCache<NewsItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const result = await callBackendAPI<NewsItem[]>('/api/news', { coords: location, language });
    saveToCache(cacheKey, result);
    return result;
  } catch (e) {
    console.error("News fetch error", e);
    return [];
  }
};

// --- Pilgrimage & Knowledge Services ---

export const getSaintDetails = async (name: string, language: string): Promise<Saint> => {
  const cacheKey = `saint_${name}_${language}`;
  const cached = getFromCache<Saint>(cacheKey);
  if (cached) return cached;

  if (!apiKey) throw new Error("API Key missing");

  const result = await retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Info on saint "${name}". Lang: ${language}. JSON: name, title, bio (brief), contributions (list), placesFound (list), imageDescription.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            title: { type: Type.STRING },
            bio: { type: Type.STRING },
            contributions: { type: Type.ARRAY, items: { type: Type.STRING } },
            placesFound: { type: Type.ARRAY, items: { type: Type.STRING } },
            imageDescription: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return JSON.parse(text) as Saint;
  });

  saveToCache(cacheKey, result);
  return result;
};

export const getHolyPlaceDetails = async (placeName: string, language: string): Promise<HolyPlace> => {
  const cacheKey = `place_${placeName}_${language}`;
  const cached = getFromCache<HolyPlace>(cacheKey);
  if (cached) return cached;

  if (!apiKey) throw new Error("API Key missing");

  const result = await retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Info on holy place "${placeName}" in Braj. Lang: ${language}. JSON: name, location, description (brief), pastime, significance, imageDescription.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            pastime: { type: Type.STRING },
            significance: { type: Type.STRING },
            imageDescription: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return JSON.parse(text) as HolyPlace;
  });
  
  saveToCache(cacheKey, result);
  return result;
};

// --- Image Generation Service ---

export const generateDevotionalImage = async (prompt: string): Promise<string | null> => {
  // Caching images is heavy on storage, but for "super fast" user experience we can try.
  const cacheKey = `img_${prompt.substring(0, 30)}`; 
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  if (!apiKey) return null;
  try {
    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Photorealistic devotional painting: ${prompt}.` }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9", 
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    });

    if (result) saveToCache(cacheKey, result);
    return result;
  } catch (e) {
    console.error("Image generation failed", e);
    return null;
  }
};

export const getKrishnaLeela = async (leelaTitle: string, language: string): Promise<KrishnaLeela | null> => {
  const cacheKey = `leela_${leelaTitle}_${language}`;
  const cached = getFromCache<KrishnaLeela>(cacheKey);
  if (cached) return cached;

  try {
    const result = await callBackendAPI<KrishnaLeela>('/api/leelas/story', {
      title: leelaTitle,
      language,
    });
    saveToCache(cacheKey, result);
    return result;
  } catch (e) {
    console.error("Error fetching Krishna leela:", e);
    return null;
  }
};

export const getLeelasList = async (language: string): Promise<string[]> => {
  const cacheKey = `leelas_list_${language}`;
  const cached = getFromCache<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const result = await callBackendAPI<string[]>('/api/leelas/list', { language });
    saveToCache(cacheKey, result);
    return result;
  } catch (e) {
    console.error("Error fetching leelas list:", e);
    return [];
  }
};