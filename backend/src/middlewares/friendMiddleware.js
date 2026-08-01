import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";
const pair = (a, b) => {
    if (a > b) {
        return [b, a];
    }   
    return [a, b];
}
export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id.toString();
        const  recipientId  = req.body?.recipientId ?? null;
        const memberIds = req.body?.memberIds ?? [];

         if (!recipientId && memberIds.length === 0) {
            return res
            .status(400)
            .json({ message: "Need to provide recipientId or memberIds" });
    }
        if (recipientId) {
        const [userA, userB] = pair(me, recipientId);

        const isFriend = await Friend.findOne({ userA, userB });

        if (!isFriend) {
            return res.status(403).json({ message: "you are not friends with this user" });
        }
            return next();
    }
    // todo: check group friendship
    } catch (error) {
        res.status(500).json({ message: "Error checking friendship", error });
    }
};