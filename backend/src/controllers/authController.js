import bcrypt from 'bcrypt';
import User from '../models/User.js';
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
