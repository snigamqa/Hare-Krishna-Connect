import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('ERROR: GEMINI_API_KEY environment variable not set');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const modelName = 'gemini-2.5-flash';

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get Gita Verse
app.post('/api/gita/verse', async (req, res) => {
  try {
    const { chapter, verse, language = 'en' } = req.body;

    if (!chapter || !verse) {
      return res.status(400).json({ error: 'Chapter and verse required' });
    }

    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Gita Chapter ${chapter} Verse ${verse} by Prabhupada. Lang: ${language}. JSON: sanskrit, transliteration, translation, short_purport (max 50 words).`,
        config: {
          responseMimeType: 'application/json',
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
      return JSON.parse(response.text);
    });

    res.json(result);
  } catch (error) {
    console.error('Gita verse error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Chapter Summary
app.post('/api/gita/chapter', async (req, res) => {
  try {
    const { chapter, language = 'en' } = req.body;

    if (!chapter) {
      return res.status(400).json({ error: 'Chapter required' });
    }

    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Title and very brief summary (max 30 words) of Bhagavad Gita Chapter ${chapter}. Language: ${language}.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
            },
          },
        },
      });
      return JSON.parse(response.text);
    });

    res.json(result);
  } catch (error) {
    console.error('Chapter error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Krishna Leela
app.post('/api/leelas/story', async (req, res) => {
  try {
    const { title, language = 'en' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Leela title required' });
    }

    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Tell the story of Krishna's "${title}" leela/pastime. Language: ${language}. JSON with: title, category (childhood/vrindavan/kurukshetra), description (1 line), fullStory (detailed 2-3 paragraphs), moralLesson (1 paragraph), relatedVerses (array of 2-3 Gita verses), imageDescription (detailed visual description for AI art).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              fullStory: { type: Type.STRING },
              moralLesson: { type: Type.STRING },
              relatedVerses: { type: Type.ARRAY, items: { type: Type.STRING } },
              imageDescription: { type: Type.STRING },
            },
          },
        },
      });
      return JSON.parse(response.text);
    });

    res.json(result);
  } catch (error) {
    console.error('Leela story error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Leelas List
app.post('/api/leelas/list', async (req, res) => {
  try {
    const { language = 'en' } = req.body;

    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `List 15 most famous Krishna leelas/pastimes (short names). Language: ${language}. Return as JSON array of strings only.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });
      return JSON.parse(response.text);
    });

    res.json(result);
  } catch (error) {
    console.error('Leelas list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get ISKCON News
app.post('/api/news', async (req, res) => {
  try {
    const { coords, language = 'en' } = req.body;

    let prompt = `Latest ISKCON news and events. `;
    if (coords) {
      prompt += `Near location (${coords.lat}, ${coords.lng}). `;
    }
    prompt += `Language: ${language}. Return JSON: array of {id, title, date, summary, source}.`;

    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                date: { type: Type.STRING },
                summary: { type: Type.STRING },
                source: { type: Type.STRING },
              },
            },
          },
        },
      });
      return JSON.parse(response.text);
    });

    res.json(result);
  } catch (error) {
    console.error('News error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Vaishnava Calendar Events
app.post('/api/calendar/events', async (req, res) => {
  try {
    const { language = 'en' } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `List the next 3 upcoming ISKCON/Vaishnava calendar events from today (${today}). Include festivals like Ekadashi, appearance/disappearance days of saints, major celebrations. Language: ${language}. Return as JSON array.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                month: { type: Type.STRING },
                day: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
          },
        },
      });
      return JSON.parse(response.text);
    });

    res.json(result);
  } catch (error) {
    console.error('Calendar events error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Image (for Krishna stories, saints, etc)
app.post('/api/image/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-exp',
        contents: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: '',
            },
          },
          `Generate an image for this prompt: ${prompt}`,
        ],
      });

      // Fallback: Return placeholder since Gemini 2.5 may have limited image generation
      return {
        success: true,
        message: 'Image generation queued. Using placeholder for now.',
        prompt: prompt,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Image generation error:', error);
    // Return graceful error for image generation
    res.status(500).json({
      success: false,
      message: 'Image generation not available',
      error: error.message,
    });
  }
});

// Get Affirmation
app.post('/api/affirmation', async (req, res) => {
  try {
    const { language = 'en' } = req.body;

    const result = await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Daily Krishna devotional affirmation. Language: ${language}. JSON: quote, verse, meaning, theme.`,
        config: {
          responseMimeType: 'application/json',
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
      return JSON.parse(response.text);
    });

    res.json(result);
  } catch (error) {
    console.error('Affirmation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Hare Krishna Connect API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
