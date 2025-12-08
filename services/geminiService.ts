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

// --- Bhajans/Songs Services ---

export const getBhajanLyrics = async (songTitle: string, language: string): Promise<Song> => {
  const cacheKey = `lyrics_${songTitle}_${language}`;
  const cached = getFromCache<Song>(cacheKey);
  if (cached) return cached;

  // Return placeholder song (backend doesn't have this endpoint)
  return {
    title: songTitle,
    author: "Vaishnava",
    lyrics: [
      "Hare Krishna, Hare Krishna",
      "Krishna Krishna, Hare Hare",
      "Hare Rama, Hare Rama",
      "Rama Rama, Hare Hare"
    ],
    translation: ["Lord Krishna, Lord Krishna", "Krishna Krishna, Lord Lord", "Lord Rama, Lord Rama", "Rama Rama, Lord Lord"],
  };
};

// --- Temple Locator Services ---

export const findTemples = async (location: string, language: string): Promise<Temple[]> => {
  const cacheKey = `temples_${location}_${language}`;
  const cached = getFromCache<Temple[]>(cacheKey);
  if (cached) return cached;

  // Return placeholder temples (backend doesn't have this endpoint)
  const temples: Temple[] = [
    {
      name: "ISKCON Temple",
      address: "Main Street",
      city: location,
      country: "Global",
      description: "Visit local ISKCON temple"
    }
  ];
  
  saveToCache(cacheKey, temples);
  return temples;
};

export const getTempleWisdom = async (templeName: string, location: string, language: string): Promise<TempleWisdom | null> => {
  const cacheKey = `wisdom_${templeName}_${location}_${language}`;
  const cached = getFromCache<TempleWisdom>(cacheKey);
  if (cached) return cached;

  // Return placeholder wisdom
  const wisdom: TempleWisdom = {
    verseReference: "Bhagavad Gita 9.26",
    translation: "If one offers Me with love and devotion a leaf, a flower, fruit and water, I will accept it.",
    significance: "Devotion is more important than material offerings."
  };

  saveToCache(cacheKey, wisdom);
  return wisdom;
};

// --- Pilgrimage & Knowledge Services ---

export const getSaintDetails = async (name: string, language: string): Promise<Saint> => {
  const cacheKey = `saint_${name}_${language}`;
  const cached = getFromCache<Saint>(cacheKey);
  if (cached) return cached;

  // Return placeholder saint
  const saint: Saint = {
    name: name,
    title: "Great Vaishnava Saint",
    bio: "A devoted follower of Lord Krishna who made significant contributions to Vaishnavism.",
    contributions: ["Spiritual teachings", "Temple establishment", "Community service"],
    placesFound: ["Vrindavan", "Mathura"]
  };

  saveToCache(cacheKey, saint);
  return saint;
};

export const getHolyPlaceDetails = async (placeName: string, language: string): Promise<HolyPlace> => {
  const cacheKey = `place_${placeName}_${language}`;
  const cached = getFromCache<HolyPlace>(cacheKey);
  if (cached) return cached;

  // Return placeholder place
  const place: HolyPlace = {
    name: placeName,
    location: "Braj Bhumi",
    description: "A sacred place associated with Lord Krishna.",
    pastime: "Krishna performed divine pastimes here.",
    significance: "This place is sanctified by Krishna's presence and activities."
  };

  saveToCache(cacheKey, place);
  return place;
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

// --- Calendar Services ---

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

// --- Krishna Leelas Services ---

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

// --- Affirmations ---

export const getGitaAffirmation = async (mood: string, language: string): Promise<Affirmation> => {
  const cacheKey = `affirmation_${mood}_${language}`;
  const cached = getFromCache<Affirmation>(cacheKey);
  if (cached) return cached;

  try {
    const result = await callBackendAPI<Affirmation>('/api/affirmation', { language });
    saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching affirmation:", error);
    throw error;
  }
};

// --- Image Generation ---

export const generateDevotionalImage = async (prompt: string): Promise<string | null> => {
  try {
    // Use a placeholder approach - return a data URL for a simple placeholder
    // In production, this would call /api/image/generate on the backend
    
    // For now, return a simple gradient placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(1, '#FFA500');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add text
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('Image', 256, 240);
    ctx.fillText('Coming Soon', 256, 280);

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};
