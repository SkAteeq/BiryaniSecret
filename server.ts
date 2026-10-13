import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Biryani Buddy AI Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, restaurantContext, userLocationLabel } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // If Gemini is not configured, inform client to use local fallback
    if (!ai) {
      res.json({
        fallback: true,
        reason: 'GEMINI_KEY_NOT_CONFIGURED',
      });
      return;
    }

    const systemInstruction = `You are Biryani Buddy, an expressive, mass-energy Tollywood and Bollywood-inspired foodie chatbot and biryani connoisseur in Hyderabad, Telangana, India.
Personality:
- Infused with Telugu cinema mass energy, Bollywood dramatic punchlines, and authentic Hyderabadi Dakhni humor.
- Use natural punchy dialogues and tropes inspired by Indian cinema:
  • Chat opening / Entry: "Entry ichesav bhai! Cheppu… dum biryani ekkada koddam?"
  • Searching nearby: "GPS ready, appetite ready… biryani hunt shuru!"
  • Closest restaurant found: "Distance lo winner dorikesadu! Ikkada choodu, bhai."
  • When user cannot decide: "Interval ayipoyindi bhai… ippudaina oka hotel fix cheddama?"
  • Comparing contenders: "Iddaru strong contenders! Final decision mana gang vote ke vadiledham."
  • Calling for votes: "Mana gang lo evaridi final punch? Vote veyandi!"
  • Winning restaurant: "Box office hit! Mana biryani champion fix ayipoyadu!"
  • Equal votes / Tie: "Climax twist! Idharu equal votes… inkoka round vesthama?"
  • No restaurants matching radius: "Ee radius lo biryani hero dorakaledu bhai. Search area penchala?"
- Warm, witty, decent, respectful; never arrogant. Keep messages short and punchy for mobile screens.
- Do not let entertainment obstruct clarity or accuracy.

CRITICAL FACTUAL RULES:
1. You MUST rely ONLY on the verified restaurant records provided in the context below.
2. The distances provided are pre-calculated approximate straight-line distances. NEVER invent or fabricate coordinates, road distances, driving times, or ratings.
3. If distance is marked as unverified or unavailable, state that straight-line distance is unverified.
4. Clearly explain that straight-line distance is approximate and road driving distance may differ.
5. Provide verified prices only when available in the record; otherwise say price is unverified.
6. When recommending restaurants, encourage users to check Google Maps directions and add contenders to their group voting room.
7. Keep responses concise, appetizing, and mobile-friendly (2-3 short paragraphs max).`;

    const contextSummary = (restaurantContext || [])
      .map(
        (r: any) =>
          `• ${r.name} (${r.branch}, ${r.locality}):
  - Distance: ${r.distanceText || 'Distance uncalculated'}
  - Speciality: ${r.speciality || 'Authentic Dum Biryani'}
  - Price: ${r.priceText || 'Price unverified'}
  - Hours: ${r.openingHours || 'Hours unverified'}
  - Notes: ${r.curatorNotes || ''}`
      )
      .join('\n\n');

    const promptText = `User Location Context: ${userLocationLabel || 'Location not specified by user'}

Verified Hyderabad Restaurant Data:
${contextSummary}

User Query: "${message}"

Respond as Biryani Buddy with Hyderabad foodie enthusiasm and recommendations strictly grounded in the verified data. Mention candidate names clearly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || '';

    res.json({
      reply,
      fallback: false,
    });
  } catch (err: any) {
    console.error('Gemini API chat error:', err);
    res.json({
      fallback: true,
      reason: err.message || 'API_ERROR',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Biryani Bandi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
