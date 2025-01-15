import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.post('/compatibility-reading', async (req, res) => {
    try {
        const { firstPerson, secondPerson } = req.body;

        const prompt = `You are an advanced astrology and relationship analysis expert. Analyze the compatibility between:

Person 1: ${firstPerson.name} (Born: ${firstPerson.dateOfBirth} in ${firstPerson.birthplace || 'unknown location'})
Person 2: ${secondPerson.name} (Born: ${secondPerson.dateOfBirth} in ${secondPerson.birthplace || 'unknown location'})

Provide a detailed compatibility analysis with the following structure:

1. Overall Compatibility Summary
2. Personality Alignment (Sun and Rising Signs)
3. Long-Term Happiness (Moon Signs and Jupiter)
4. Sexual Compatibility (Venus and Mars)
5. Communication Styles (Mercury)
6. Wealth and Growth (Jupiter and Saturn)
7. Strengths and Challenges
8. Final Recommendation

Consider:
- Zodiac signs for both individuals
- Rising signs if birthplaces are provided
- Moon signs for emotional compatibility
- Key planetary placements (Venus, Mars, Mercury, Jupiter)
- Aspects between their planets

Format the response as a JSON object with these sections clearly defined.
Base all insights on astrological principles and provide actionable advice.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4",
            response_format: { type: "json_object" },
        });

        const analysis = JSON.parse(completion.choices[0].message.content);
        res.json(analysis);

    } catch (error) {
        console.error('Error generating compatibility reading:', error);
        res.status(500).json({ error: 'Failed to generate compatibility reading' });
    }
});

export default router;