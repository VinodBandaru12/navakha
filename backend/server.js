import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import documentRoutes from './routes/document.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Document Reader — Mode 2
app.use('/api/document', documentRoutes);

app.listen(PORT, () => {
  console.log(`Navakha backend listening on port ${PORT}`);
});
