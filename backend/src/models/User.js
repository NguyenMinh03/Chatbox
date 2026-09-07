import mongoose from 'mongoose';

const notificationPreferencesSchema = new mongoose.Schema(
    {
        directMessages: { type: Boolean, default: true },
        groupMessages: { type: Boolean, default: true },
        friendRequests: { type: Boolean, default: true },
        sound: { type: Boolean, default: true },
        desktopAlerts: { type: Boolean, default: false },
    },
    { _id: false }
);

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    avatarUrl: {
        type: String
    },
    avatarId: {
        type: String
    },
    bio : {
        type: String,
        maxlength: 500,
    },
    phone: {
        type: String,
        sparse: true,
},
    notificationPreferences: {
        type: notificationPreferencesSchema,
        default: () => ({}),
    },
}, { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
export default User;