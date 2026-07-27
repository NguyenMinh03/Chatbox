import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './libs/db.js';
import authRoutes from './routes/authRoute.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoute.js';
import { protectedRoute } from './middlewares/authMiddleware.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cookieParser());
// public routes 
app.use('/api/auth', authRoutes);
// private routes
app.use(protectedRoute); // Apply the protectedRoute middleware to all routes below
app.use('/api/users', userRoutes);
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
