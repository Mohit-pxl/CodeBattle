const express=require('express')
const app=express()
require('dotenv').config()
const main=require('./config/db')
const User=require('./models/users')
const cookieParser = require('cookie-parser')
const authRouter=require('../src/routes/userAuth')
const redisClient=require('./config/redis')



app.use(express.json())
app.use(cookieParser())

app.use("/user",authRouter)

const initializeConnection=async (req,res)=>{
    try{
       Promise.all([main(),redisClient.connect()]);
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

