require('dotenv').config();
const mongoose = require('mongoose');
const redisClient = require('./src/config/redis');

async function test() {
  try {
    await mongoose.connect(process.env.DB_CONNECT_STRING);
    console.log('MongoDB ok');
  } catch(e) {
    console.error('Mongo Error');
  }
  try {
    await redisClient.connect();
    console.log('Redis ok');
  } catch(e) {
    console.error('Redis Error', e);
  }
}
test().then(() => process.exit(0));
