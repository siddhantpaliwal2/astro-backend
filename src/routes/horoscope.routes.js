import express from 'express';
import { getHoroscope, getAllHoroscopes } from '../utils/horoscopeAPI.js';

const router = express.Router();

const ZODIAC_SIGNS = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Get all horoscopes
router.get('/all-horoscopes', async (req, res) => {
    try {
        const horoscopes = await getAllHoroscopes();
        res.json({
            horoscopes,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching horoscopes:', error);
        res.status(500).json({ 
            error: 'Failed to fetch horoscopes',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get horoscope for timeframe
router.get('/:timeframe-horoscope', async (req, res) => {
    try {
        const { sign } = req.query;
        const { timeframe } = req.params;
        
        if (!sign || !ZODIAC_SIGNS.includes(sign.toLowerCase())) {
            throw new Error('Invalid zodiac sign');
        }

        if (!['daily', 'weekly', 'monthly'].includes(timeframe)) {
            throw new Error('Invalid timeframe');
        }

        console.log(`Requesting ${timeframe} horoscope for ${sign}`);
        const horoscope = await getHoroscope(sign.toLowerCase(), timeframe);
        
        if (!horoscope.success) {
            console.error('Horoscope fetch failed:', horoscope);
            throw new Error('Failed to fetch horoscope from API');
        }

        const response = { 
            text: horoscope.data.horoscope_data,
            sign: sign,
            date: horoscope.data.date,
            timestamp: new Date().toISOString()
        };

        console.log('Sending response:', response);
        res.json(response);
    } catch (error) {
        console.error('Error fetching horoscope:', error);
        res.status(500).json({ 
            error: 'Failed to fetch horoscope',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

router.get('/zodiac-signs', (req, res) => {
    res.json({ signs: ZODIAC_SIGNS });
});

export default router; 