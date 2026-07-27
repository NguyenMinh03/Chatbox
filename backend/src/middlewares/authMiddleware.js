import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const protectedRoute = async (req, res, next) => {
    try {
        // take access token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // verify access token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if (err) {
                console.error("Error verifying access token:", err);
                return res.status(403).json({ message: "Forbidden" });
            }
            // check if user exists in the database
            const user = await User.findById(decodedUser.userId).select('-hashedPassword'); // Exclude hashedPassword from the result
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        console.error("Error in protected route middleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
