import User from "../models/User.js";
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";

export const authMe = async (req, res) => {
    try {
        // req.user is set in the protectedRoute middleware
        const user = req.user;
        return res.status(200).json({ user });
    }
    catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
export const test = async (req, res) => {
    return res.sendStatus(204);
};

export const searchUserByUserName = async (req,res) => {
    try {
        const {username} = req.query;
        if(!username || username.trim() === "") {
            return res.status(400).json({ message: "Require username in query." });
        }
        const user = await User.findOne({username}).select("_id displayName username avatarUrl"); 
        return res.status(200).json({ user });
    }
    catch(error){
        console.error("Fail in searchUserByUsername", error);
        return res.status(500).json({ message: "Error system" });
    }
}
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { displayName, username, email, phone, bio } = req.body;

    const updates = {};

    if (displayName !== undefined) {
      const trimmed = displayName.trim();
      if (!trimmed) {
        return res.status(400).json({ message: "Display name cannot be empty" });
      }
      updates.displayName = trimmed;
    }

    if (username !== undefined) {
      const trimmed = username.trim().toLowerCase();
      if (!trimmed) {
        return res.status(400).json({ message: "Username cannot be empty" });
      }
      updates.username = trimmed;
    }

    if (email !== undefined) {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) {
        return res.status(400).json({ message: "Email cannot be empty" });
      }
      updates.email = trimmed;
    }

    if (phone !== undefined) {
      updates.phone = phone.trim();
    }

    if (bio !== undefined) {
      updates.bio = bio;
    }

    // Guard against clashing with another user's username/email
    if (updates.username || updates.email) {
      const orConditions = [];
      if (updates.username) orConditions.push({ username: updates.username });
      if (updates.email) orConditions.push({ email: updates.email });

      const duplicate = await User.findOne({
        _id: { $ne: userId },
        $or: orConditions,
      });

      if (duplicate) {
        const message =
          duplicate.username === updates.username
            ? "Username is already taken"
            : "Email is already in use";
        return res.status(409).json({ message });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-hashedPassword");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username or email already in use" });
    }
    console.error("Fail when updateProfile", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user._id;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadImageFromBuffer(file.buffer);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatarUrl: result.secure_url,
        avatarId: result.public_id,
      },
      {
        returnDocument: "after",
      }
    ).select("avatarUrl");

    if (!updatedUser.avatarUrl) {
      return res.status(400).json({ message: "Avatar turn back null" });
    }

    return res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    console.error("Fail when upload avatar", error);
    return res.status(500).json({ message: "Upload failed" });
  }
};