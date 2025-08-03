const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 5000;

const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend')));


// Your Google API key here
const GOOGLE_API_KEY = 'Your_API_Key';

app.use(cors());
app.use(express.json());

// Initialize Google Gemini AI client
const ai = new GoogleGenAI({
  apiKey: GOOGLE_API_KEY,
});

// Set of keywords to detect Revolmotors domain interest
const REVOLMOTORS_KEYWORDS = [
  'revolmotors',
  'motor',
  'battery',
  'electric vehicle',
  'ev',
  'charg',
  'engine',
  'range',
  'rpm',
  'torque',
  'watt',
];

function isRevolmotorsQuery(text) {
  const lower = text.toLowerCase();
  return REVOLMOTORS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  if (!isRevolmotorsQuery(message)) {
    return res.json({
      reply:
        "Sorry, I can only answer questions related to Revolmotors. Please ask about electric motors, batteries, or related topics.",
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
    });
    res.json({ reply: response.text });
  } catch (error) {
    console.error('Google Gemini API error:', error);
    res.status(500).json({ error: 'Failed to get response from Google Gemini API' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
