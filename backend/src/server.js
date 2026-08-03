import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './libs/db.js';
import authRoutes from './routes/authRoute.js';
import friendRoute from './routes/friendRoute.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoute.js';
import { protectedRoute } from './middlewares/authMiddleware.js';
import messageRoute from './routes/messageRoute.js'; // Import the message routes
import conversationRoute from './routes/conversationRoute.js'; // Import the conversation routes
import cors from "cors"
import { initSocket } from './socket/index.js';
dotenv.config();
const app = express();
const server = http.createServer(app);
initSocket(server);
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:process.env.CLIENT_URL,credentials:true}))
// public routes 
app.use('/api/auth', authRoutes);
// private routes
app.use(protectedRoute); // Apply the protectedRoute middleware to all routes below
app.use('/api/users', userRoutes);
app.use("/api/friends", friendRoute)
app.use("/api/messages", messageRoute); // Add this line to include the message routes
app.use("/api/conversations", conversationRoute); // Add this line to include the conversation routes
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
