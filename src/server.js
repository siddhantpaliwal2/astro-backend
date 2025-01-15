import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api', chatRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AstroBloom API is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 