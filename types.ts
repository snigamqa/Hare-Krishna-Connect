export interface Chapter {
  number: number;
  title: string;
  summary: string;
  verses_count: number;
}

export interface Verse {
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation: string;
  purport?: string;
}

export interface BookmarkItem {
  chapter: number;
  verse: number;
  timestamp: number;
}

export interface SongCategory {
  id: string;
  name: string;
  description: string;
}

export interface Song {
  title: string;
  author: string;
  lyrics: string[]; // Array of lines
  translation?: string[];
  audioUrl?: string; // Optional URL for demo purposes
}

export interface Temple {
  name: string;
  address: string;
  city: string;
  country: string;
  description?: string;
  website?: string;
  timings?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  source: string;
  imageUrl?: string;
  link?: string;
}

export interface Saint {
  name: string;
  title: string;
  bio: string;
  contributions: string[];
  placesFound?: string[];
  imageDescription?: string;
}

export interface HolyPlace {
  name: string;
  location: string;
  description: string;
  pastime: string;
  significance: string;
  imageDescription?: string;
}

export interface Affirmation {
  quote: string;
  verse: string;
  meaning: string;
  theme: string;
}

export interface TempleWisdom {
  verseReference: string;
  translation: string;
  significance: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}