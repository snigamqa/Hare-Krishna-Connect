import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GROQ_API_KEY;

if (!API_KEY) {
  console.error('ERROR: GROQ_API_KEY environment variable not set');
  process.exit(1);
}

const groq = new Groq({ apiKey: API_KEY });
const modelName = 'llama-3.1-70b-versatile';

// Middleware
app.use(cors({
  origin: [
    'https://snigamqa.github.io',
    'https://snigamqa.github.io/Hare-Krishna-Connect',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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

// Helper to call Groq with JSON response
async function callGroqJSON(prompt) {
  const response = await groq.chat.completions.create({
    model: modelName,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that ALWAYS responds with valid JSON only. No markdown, no explanations, just pure JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
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
      const prompt = `Provide Bhagavad Gita Chapter ${chapter} Verse ${verse} as taught by Srila Prabhupada. Language: ${language}. Return JSON with: chapter (number), verse (number), sanskrit (text), transliteration (romanized sanskrit), translation (English translation), purport (brief explanation, max 50 words).`;
      return await callGroqJSON(prompt);
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
      const prompt = `Provide title and brief summary (max 30 words) of Bhagavad Gita Chapter ${chapter}. Language: ${language}. Return JSON with: title, summary.`;
      return await callGroqJSON(prompt);
    });

    res.json(result);
  } catch (error) {
    console.error('Chapter error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Krishna Leela
// Get Krishna Leela
app.post('/api/leelas/story', async (req, res) => {
  try {
    const { title, language = 'en' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Leela title required' });
    }

    const result = await retryWithBackoff(async () => {
      const prompt = `Tell the story of Krishna's "${title}" leela/pastime. Language: ${language}. Return JSON with: title, category (childhood/vrindavan/kurukshetra), description (1 line), fullStory (detailed 2-3 paragraphs), moralLesson (1 paragraph), relatedVerses (array of 2-3 Gita verse references), imageDescription (detailed visual description).`;
      return await callGroqJSON(prompt);
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
      const prompt = `List 15 most famous Krishna leelas/pastimes (short names). Language: ${language}. Return JSON with: leelas (array of strings).`;
      const data = await callGroqJSON(prompt);
      return data.leelas || data;
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

    let prompt = `Generate latest ISKCON news and events. `;
    if (coords) {
      prompt += `Near location (${coords.lat}, ${coords.lng}). `;
    }
    prompt += `Language: ${language}. Return JSON with: news (array of objects with id, title, date, summary, source).`;

    const result = await retryWithBackoff(async () => {
      const data = await callGroqJSON(prompt);
      return data.news || data;
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
      const prompt = `List the next 3 upcoming ISKCON/Vaishnava calendar events from today (${today}). Include festivals like Ekadashi, appearance/disappearance days of saints, major celebrations. Language: ${language}. Return JSON with: events (array of objects with date, month, day, title, description).`;
      const data = await callGroqJSON(prompt);
      return data.events || data;
    });

    res.json(result);
  } catch (error) {
    console.error('Calendar events error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Image (placeholder)
app.post('/api/image/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    // Return placeholder
    res.json({
      success: true,
      message: 'Image generation not available with Groq. Using placeholder.',
      prompt: prompt,
    });
  } catch (error) {
    console.error('Image generation error:', error);
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
      const prompt = `Generate a daily Krishna devotional affirmation. Language: ${language}. Return JSON with: quote (inspirational quote), verse (related Bhagavad Gita verse reference), meaning (brief explanation), theme (spiritual theme).`;
      return await callGroqJSON(prompt);
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
