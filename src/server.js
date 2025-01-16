import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.routes.js';
import compatibilityRoutes from './routes/compatibility.routes.js';
import horoscopeRoutes from './routes/horoscope.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', chatRoutes);
app.use('/api', compatibilityRoutes);
app.use('/api', horoscopeRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AstroBloom API is running',
    version: '1.0.0',
    compatibility: {
      minimumClientVersion: '1.0.0',
      recommendedClientVersion: '1.0.0',
      deprecationDate: null,
      endpoints: {
        chat: '/api/chat',
        compatibility: '/api/compatibility-reading',
        horoscope: '/api/daily-horoscope'
      }
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 