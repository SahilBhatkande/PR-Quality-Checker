import mongoose from 'mongoose';

const prRecordSchema = new mongoose.Schema(
    {
        repoFullname: {
            type: String,
            required: true,
        },
        prNumber: {
            type: Number,
            required: true,
        },
        prTitle: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'passed', 'failed'],
            default: 'pending',
        },
        lintErrors: {
            type: Number,
            default: 0,
        },
        lintWarnings: {
            type: Number,
            default: 0,
        },
        testFailures: {
            type: Number,
            default: 0,
        },
        passedAllTests: {
            type: Boolean,
            default: false,
        },
        aiSuggestions: {
            type: String,
        },
        githubCommentId: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

// Indexing for faster queries (dashboard)
prRecordSchema.index({ repoFullname: 1, prNumber: 1 });

const PrRecord = mongoose.model('PrRecord', prRecordSchema);
export default PrRecord;
