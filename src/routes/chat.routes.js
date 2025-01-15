import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Construct messages array with system prompt and history
    const messages = [
      { 
        role: "system", 
        content: "You are an expert astrology assistant. You provide insightful astrological advice and interpretations. Keep responses concise and engaging. Add mystic emojis with every response." 
      },
      ...history,
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 500
    });

    res.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

export default router; 