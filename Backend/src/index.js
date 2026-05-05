const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const User = require('./models/users');
const cookieParser = require('cookie-parser');
const authRouter = require('../src/routes/userAuth');
const redisClient = require('./config/redis');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const cors = require('cors');
const gameRouter = require('./routes/game');
const initGameSocket = require('./utils/gameSocket');
const blogRouter=require("../src/routes/blogRoutes");

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/game', gameRouter);
app.use('/blog', blogRouter);
// Create HTTP server and attach Socket.io
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
    },
});

// Initialize game socket namespace
const gameIo = io.of('/game');
initGameSocket(gameIo);

const initializeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()]);
        console.log('DB Connected');

        httpServer.listen(process.env.PORT, () => {
            console.log('Listening at port no. :' + process.env.PORT);
        });
    } catch (err) {
        console.log('Error occurred: ' + err);
    }
};

initializeConnection();
