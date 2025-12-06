import { GoogleGenAI, Type } from "@google/genai";
import { Verse, Song, Temple, NewsItem, Saint, HolyPlace, Affirmation, TempleWisdom } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const modelName = "gemini-2.5-flash";

// --- Caching System ---
const CACHE_PREFIX = 'hkc_cache_v1_';

function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (cached) {
      // Optional: Add expiry check here if needed
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
    console.warn(`API call failed. Retrying... (${retries} attempts left)`);
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// --- Bhagavad Gita Services ---

export const getChapterSummary = async (chapterNumber: number, language: string): Promise<{ title: string; summary: string }> => {
  const cacheKey = `chapter_${chapterNumber}_${language}`;
  const cached = getFromCache<{ title: string; summary: string }>(cacheKey);
  if (cached) return cached;

  if (!apiKey) return { title: `Chapter ${chapterNumber}`, summary: "API Key missing. Please configure your API key." };

  try {
    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Title and very brief summary (max 30 words) of Bhagavad Gita Chapter ${chapterNumber}. Language: ${language}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
            },
          },
        },
      });
      const text = response.text;
      if (!text) throw new Error("No response text");
      return JSON.parse(text);
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

  if (!apiKey) throw new Error("API Key missing");

  const result = await retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Gita Chapter ${chapter} Verse ${verse} by Prabhupada. Lang: ${language}. JSON: sanskrit, transliteration, translation, short_purport (max 50 words).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chapter: { type: Type.INTEGER },
            verse: { type: Type.INTEGER },
            sanskrit: { type: Type.STRING },
            transliteration: { type: Type.STRING },
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

  if (!apiKey) return [];

  try {
    let prompt = `Latest ISKCON news. Lang: ${language}.`;
    if (location) {
      prompt += ` Near lat ${location.lat}, lng ${location.lng} or global.`;
    } else {
      prompt += ` Focus on Global.`;
    }
    prompt += ` Format: ID:::Title:::Date:::Source:::Summary|||...`;

    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName, 
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }], 
        }
      });

      const text = response.text;
      if (!text) return [];

      const items = text.split('|||').map((rawItem, index) => {
          const parts = rawItem.trim().split(':::');
          if (parts.length < 4) return null;
          return {
              id: parts[0] || `news-${index}`,
              title: parts[1]?.trim(),
              date: parts[2]?.trim(),
              source: parts[3]?.trim(),
              summary: parts[4]?.trim() || "Read more."
          } as NewsItem;
      }).filter(item => item !== null) as NewsItem[];

      return items;
    });

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