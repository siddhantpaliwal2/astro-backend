import axios from 'axios';

const HOROSCOPE_BASE_URL = 'https://horoscope-app-api.vercel.app/api/v1/get-horoscope';

export const getHoroscope = async (sign, timeframe = 'daily') => {
    try {
        // Log request details for debugging
        console.log(`Fetching horoscope for ${sign} (${timeframe})`);
        
        const response = await axios.get(`${HOROSCOPE_BASE_URL}/${timeframe}`, {
            params: {
                sign: sign.toLowerCase()
            },
            headers: {
                'accept': 'application/json'
            }
        });

        // Log response for debugging
        console.log('API Response:', response.data);

        if (!response.data.success) {
            throw new Error(response.data.message || 'API request failed');
        }

        // Ensure we're accessing the correct data structure
        const horoscopeData = response.data.data;
        if (!horoscopeData || !horoscopeData.horoscope_data) {
            throw new Error('Invalid response format from API');
        }

        return {
            success: true,
            data: {
                horoscope_data: horoscopeData.horoscope_data,
                date: horoscopeData.date || new Date().toISOString().split('T')[0]
            }
        };
    } catch (error) {
        console.error(`Failed to fetch horoscope for ${sign}:`, error.message);
        if (error.response) {
            console.error('API Error Response:', error.response.data);
        }
        return {
            success: false,
            data: {
                date: new Date().toISOString().split('T')[0],
                horoscope_data: "Unable to fetch horoscope at the moment. Please try again later."
            }
        };
    }
};

export const getAllHoroscopes = async () => {
    const signs = [
        'aries', 'taurus', 'gemini', 'cancer', 
        'leo', 'virgo', 'libra', 'scorpio', 
        'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];

    try {
        const horoscopes = {};
        for (const sign of signs) {
            try {
                const response = await getHoroscope(sign);
                if (response.success) {
                    horoscopes[sign] = {
                        prediction: response.data.horoscope_data,
                        date: response.data.date
                    };
                } else {
                    throw new Error('Failed to fetch horoscope');
                }
                // Add small delay between requests
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Error fetching horoscope for ${sign}:`, error);
                horoscopes[sign] = {
                    prediction: "Horoscope temporarily unavailable",
                    date: new Date().toISOString().split('T')[0]
                };
            }
        }
        return horoscopes;
    } catch (error) {
        console.error('Failed to fetch all horoscopes:', error);
        throw new Error(`Failed to fetch horoscopes: ${error.message}`);
    }
}; 