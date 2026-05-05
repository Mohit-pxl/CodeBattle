const { createClient } =require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-18475.c241.us-east-1-4.ec2.cloud.redislabs.com',
        port: 18475
    }
});

module.exports=redisClient


