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

        const prompt = `You are an advanced astrology and relationship analysis expert. Analyze the compatibility between these two people and provide the response in JSON format:

Person 1: ${firstPerson.name} (Born: ${firstPerson.dateOfBirth} in ${firstPerson.birthplace || 'unknown location'})
Person 2: ${secondPerson.name} (Born: ${secondPerson.dateOfBirth} in ${secondPerson.birthplace || 'unknown location'})

Return a JSON object with the following structure:
{
    "overallCompatibility": {
        "description": "A detailed summary of their compatibility",
        "rating": "Score out of 100"
    },
    "personalityAlignment": {
        "description": "Analysis of their sun and rising signs",
        "rating": "Score out of 100"
    },
    "longTermHappiness": {
        "description": "Analysis based on moon signs and Jupiter",
        "rating": "Score out of 100"
    },
    "sexualCompatibility": {
        "description": "Analysis based on Venus and Mars",
        "rating": "Score out of 100"
    },
    "communicationStyles": {
        "description": "Analysis based on Mercury",
        "rating": "Score out of 100"
    },
    "wealthAndGrowth": {
        "description": "Analysis based on Jupiter and Saturn",
        "rating": "Score out of 100"
    },
    "strengthsAndChallenges": {
        "strengths": ["list of relationship strengths"],
        "challenges": ["list of potential challenges"]
    },
    "finalRecommendation": "Detailed advice and recommendations for the relationship",
    "overallScore": "A number between 1-100"
}`;

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert astrologer. Respond only with a valid JSON object. Do not include markdown formatting or any text outside the JSON structure."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "gpt-4o",
            temperature: 0.7,
            max_tokens: 1500
        });

        try {
            // Clean the response by removing any markdown or extra text
            let responseText = completion.choices[0].message.content;
            responseText = responseText.replace(/```json\n|\n```/g, '');  // Remove markdown
            responseText = responseText.trim();  // Remove whitespace
            
            // If response starts with { and ends with }, attempt to parse
            if (responseText.startsWith('{') && responseText.endsWith('}')) {
                const analysis = JSON.parse(responseText);
                res.json(analysis);
            } else {
                throw new Error('Response is not in valid JSON format');
            }
        } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
            res.status(500).json({ 
                error: 'Failed to parse compatibility reading',
                rawResponse: completion.choices[0].message.content
            });
        }

    } catch (error) {
        console.error('Error generating compatibility reading:', error);
        res.status(500).json({ 
            error: 'Failed to generate compatibility reading',
            details: error.message 
        });
    }
});

export default router;