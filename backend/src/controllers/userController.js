import User from "../models/User.js";

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
        new: true,
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