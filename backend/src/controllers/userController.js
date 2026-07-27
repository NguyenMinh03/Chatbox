export const authMe = async (req, res) => {
    try {
        // req.user is set in the protectedRoute middleware
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}