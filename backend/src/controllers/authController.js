import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from '../models/Session.js';
const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;
export const signUp = async (req, res) => {
   try {
      const { username, email, password, firstName, lastName } = req.body;
      if (!username || !email || !password || !firstName || !lastName) {
         return res.status(400).json({ message: "All fields are required" });
      }
      // check if user already exists
      const duplicate = await User.findOne({ $or: [{ username }, { email }] });
      if (duplicate) {
         return res.status(409).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      // create new user
      await User.create({
         username,
         email,
         hashedPassword,
         displayName: `${firstName} ${lastName}`,
      });
      return res.status(201).json({ message: "User created successfully" });
   } catch (error) {
    console.error("Error during sign up:", error);
    return res.status(500).json({ message: "Error creating user" });
   }
};

export const signIn = async (req, res) => {
   try {
      const { username, password } = req.body;
      if (!username || !password) {
         return res.status(400).json({ message: "Username and password are required" });
      }
      // find user by username
      const user = await User.findOne({ username });
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }
      // verify password
      const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
      if (!passwordCorrect) {
         return res.status(401).json({ message: "Invalid credentials" });
      }
      // create access token if password is correct
      const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
      // create refresh token
      const refreshToken = crypto.randomBytes(64).toString('hex');
      // create new session for saving refresh token
      await Session.create({
         userId: user._id,
         refreshToken,
         expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL), // 14 days from now
      });
      // send access token and refresh token to client by cookie
      res.cookie('refreshToken', refreshToken, {
         httpOnly: true,
         secure: true,
         sameSite: 'none',
         maxAge: REFRESH_TOKEN_TTL
      });
      // send access token to client in response body
      return res.status(200).json({ message: `User ${user.displayName} signed in successfully` , accessToken});
   } catch (error) {
      console.error("Error during sign in:", error);
      return res.status(500).json({ message: "Error signing in" });
   }
};

export const signOut = async (req, res) => {
   try {
      //take refresh token from cookie
      const token = req.cookies?.refreshToken;  
      if (token) {
         // delete refresh token from sessions collection
         await Session.deleteOne({ refreshToken: token });
         // delete cookie 
         res.clearCookie('refreshToken');
      }
      return res.sendStatus(204);
   }
      
   catch (error) {
      console.error("Error during sign out:", error);
      return res.status(500).json({ message: "Error signing out" });
}};

export const refreshToken = async (req, res) => {
   
}