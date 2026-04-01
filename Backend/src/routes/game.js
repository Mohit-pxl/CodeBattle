const express = require('express');
const gameRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const {
    getRandomProblem,
    createRoom,
    joinRoom,
    getRoom,
    getResults,
    getGameHistory,
} = require('../controllers/gameController');

// All game routes require authentication
gameRouter.get('/random-problem', userMiddleware, getRandomProblem);
gameRouter.post('/create', userMiddleware, createRoom);
gameRouter.post('/join/:roomId', userMiddleware, joinRoom);
gameRouter.get('/history', userMiddleware, getGameHistory);
gameRouter.get('/results/:roomId', userMiddleware, getResults);
gameRouter.get('/:roomId', userMiddleware, getRoom);

module.exports = gameRouter;
