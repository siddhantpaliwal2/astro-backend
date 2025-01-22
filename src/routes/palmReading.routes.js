import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/palm-reading', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Validate the image format
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    console.log('Attempting palm reading analysis...');

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are Palmistry GPT, an expert palm reader, skilled in providing detailed and engaging palm readings based on a user’s dominant hand. Focus on analyzing specific features of the palm in a way that feels unique and captivating while staying concise to avoid exceeding the token limit. Use evocative language and storytelling to make the reading engaging. 


Your analysis should cover:
- **Dominant Hand:** Describe the significance of the dominant hand and how it reflects the user's conscious choices and current life journey.
- **Hand Type:** Identify the hand type (Earth, Water, Fire, Air) and craft a vivid, evocative narrative about the user's personality and elemental spirit.
- **Major Lines:** For each major line (Heart, Head, Life, Fate), offer:
  - A detailed interpretation grounded in observation.
  - Specific examples of how these traits might manifest in daily life.
  - A touch of mysticism that sparks curiosity and imagination.
- **Minor Lines:** Highlight the subtle influences of minor lines and their impact on the user's life, including any unique observations.
- **Mounts & Markings:** Explore the mounts (e.g., Venus, Jupiter) and special markings (e.g., stars, crosses) in-depth, relating them to personality traits, challenges, or hidden potential.
- **Unique Features:** Pay special attention to unusual patterns or features, explaining their rare or mystical significance.

Your response must:
1. Be delivered in a rich storytelling style, blending charm and insight.
2. Feel personalized, avoiding vague or overly generic descriptions.
3. Include metaphors, vivid imagery, and relatable analogies to engage the reader.
4. Maintain a positive tone but highlight meaningful areas for growth.
5. Avoid health, legal, or overly speculative predictions.

### JSON Format:
Provide your analysis in the following JSON format:
{
  "handOverview": {
    "dominantHand": "Describe how their dominant hand reflects their life path, goals, and conscious choices.",
    "handType": "Provide a vivid description of their hand’s elemental type, incorporating symbolic and spiritual insights.",
    "personalityTraits": "Craft an engaging narrative about their personality, using specific traits tied to the palm features."
  },
  "majorLines": {
    "heartLine": {
      "description": "A deep dive into their emotional life, relationships, and capacity for love, written in a charming and mystical tone.",
      "examples": "Provide 2-3 specific ways this line might manifest in their experiences."
    },
    "headLine": {
      "description": "Insightful analysis of their intellectual approach, decision-making style, and creativity.",
      "examples": "Include relatable or imaginative examples of their mental strengths in action."
    },
    "lifeLine": {
      "description": "An exploration of their vitality, resilience, and overall life journey.",
      "examples": "Highlight specific traits or situations this line might reflect."
    },
    "fateLine": {
      "description": "Describe their career path, ambitions, and adaptability.",
      "examples": "Tie this line to their unique professional qualities or aspirations."
    }
  },
  "minorLines": {
    "sunLine": "Analyze their creative potential and achievements with specific, engaging examples.",
    "marriageLines": "Delve into their relationship dynamics with relatable metaphors or imagery.",
    "otherLines": ["Highlight 1-2 unique observations."]
  },
  "mounts": {
    "venus": "Describe their capacity for love, beauty, and sensuality with vivid imagery.",
    "jupiter": "Explore their leadership qualities and ambition with depth.",
    "saturn": "Analyze their wisdom and responsibility with thoughtful insights.",
    "apollo": "Dive into their artistic nature with creative metaphors.",
    "mercury": "Describe their communication style and wit in a clever, engaging way."
  },
  "uniqueFeatures": {
    "specialMarkings": "Provide a mystical interpretation of unique markings or patterns.",
    "thumbCharacteristics": "Reveal what the thumb indicates about their character and willpower.",
    "unusualPatterns": "Interpret rare patterns with a sense of wonder and intrigue."
  },
  "overallReading": {
    "summary": "Weave all aspects of the reading into a cohesive, captivating conclusion.",
    "strengths": "Highlight their greatest gifts in an inspiring way.",
    "potentialChallenges": "Provide thoughtful insights into areas for growth with constructive advice.",
    "advice": "End with an uplifting, memorable message for their journey ahead."
  }
}

Important Guidelines:
- Personalization is key: Avoid generic statements; make every detail feel relevant and unique to the individual.
- Keep descriptions concise but meaningful, but also entertaining and engaging
- Focus on current traits, but also provide insights into potential future trends
- Maintain a positive, engaging tone. Storytelling tone: Use vivid descriptions, metaphors, and a mystical style to keep the user engaged.
- Avoid health or legal predictions
- Request clearer image if needed`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high"
              }
            },
            {
              type: "text",
              text: "Please provide a concise but meaningful palm reading of my dominant hand."
            }
          ]
        }
      ],
      model: "gpt-4o-mini",
      max_tokens: 4096,
      temperature: 0.7
    });

    try {
      let responseText = completion.choices[0].message.content;
      responseText = responseText.replace(/```json\n|\n```/g, '').trim();
      
      // Handle potential truncation
      if (!responseText.endsWith('}')) {
        const lastBrace = responseText.lastIndexOf('}');
        if (lastBrace !== -1) {
          responseText = responseText.substring(0, lastBrace + 1);
        }
      }
      
      try {
        const analysis = JSON.parse(responseText);
        
        // Validate required fields
        const requiredFields = [
          'handOverview',
          'majorLines',
          'minorLines',
          'mounts',
          'uniqueFeatures',
          'overallReading'
        ];
        
        const missingFields = requiredFields.filter(field => !analysis[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        
        res.json(analysis);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('Raw response:', responseText);
        throw new Error('Invalid JSON structure in response');
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      res.status(500).json({ 
        error: 'Failed to parse palm reading',
        rawResponse: completion.choices[0].message.content
      });
    }

  } catch (error) {
    console.error('Palm reading error details:', error);
    res.status(500).json({ 
      error: 'Failed to analyze palm',
      details: error.message,
      success: false
    });
  }
});

export default router; 
