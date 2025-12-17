const express=require('express')
const app=express()
require('dotenv').config()
const main=require('./config/db')
const User=require('./models/users')
const cookieParser = require('cookie-parser')
const authRouter=require('./routes/userAuth')
const redisClient=require('./config/redis')
const problemRouter=require('./routes/problemCreator')



app.use(express.json())
app.use(cookieParser())

app.use("/user",authRouter)
app.use("/problem",problemRouter)

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

