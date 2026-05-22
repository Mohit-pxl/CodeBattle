const mongoose = require('mongoose');
require('dotenv').config();
const Problem = require('./src/models/problem');

const check = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        const count = await Problem.countDocuments();
        const problems = await Problem.find({}).limit(5);
        console.log('Count:', count);
        console.log('Problems:', JSON.stringify(problems, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
