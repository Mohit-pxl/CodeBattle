const mongoose = require('mongoose');
const { Schema } = mongoose;

const gameSchema = new Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    roomType: {
        type: String,
        enum: ['random', 'private'],
        required: true,
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'finished'],
        default: 'waiting',
    },
    duration: {
        type: Number, // in seconds
        default: 600,
    },
    problem: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        default: null,
    },
    players: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            username: { type: String, required: true },
            socketId: { type: String },
            code: { type: String, default: '' },
            language: { type: String, default: 'cpp' },
            submitted: { type: Boolean, default: false },
            submittedAt: { type: Date, default: null },
            score: { type: Number, default: 0 },
            testcasesPassed: { type: Number, default: 0 },
            totalTestcases: { type: Number, default: 0 },
        },
    ],
    winner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    startedAt: {
        type: Date,
        default: null,
    },
    finishedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;
