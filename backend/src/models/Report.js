import mongoose from 'mongoose';

export const REPORT_REASON_VALUES = [
    'spam',
    'harassment',
    'inappropriate_content',
    'impersonation',
    'other',
];

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        reportedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        reason: {
            type: String,
            enum: REPORT_REASON_VALUES,
            required: true,
        },
        details: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'dismissed'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

reportSchema.index({ reportedUser: 1, status: 1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
