const express=require('express')
const app=express()
require('dotenv').config()
const main=require('./config/db')
const User=require('./models/users')
const cookieParser = require('cookie-parser')
const authRouter=require('../src/routes/userAuth')
const redisClient=require('./config/redis') 
const problemRouter=require('./routes/problemCreator')
const submitRouter=require('./routes/submit')
const cors=require('cors')
const aiRouter=require('./routes/aiChatting')

app.use(cors({
    origin:["http://localhost:5173" || "http://localhost:5174" ],
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/user",authRouter)
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);

const initializeConnection=async ()=>{
    try{
       await Promise.all([main(),redisClient.connect()]);
       console.log("DB Connected");
         
       app.listen(process.env.PORT,()=>{
       console.log("listening at port no. :"+process.env.PORT)
       })
    }
    catch(err){
        console.log("error occured"+err)
    }
}

initializeConnection();

