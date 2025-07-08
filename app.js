import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import captionsRoutes from './routes/captionsRoutes.js';
import paymentsRoutes from './routes/paymentsRoutes.js';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://captions.freezygig.com', // Adjust to your frontend URL
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/captions', captionsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
