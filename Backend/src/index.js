const express=require('express')
const app=express()
require('dotenv').config()
const main=require('../config/db')
const User=require('../models/users')




app.use(express.json())


main().then(
    async function(){
        console.log("connected to db")
       app.listen(process.env.PORT,()=>{
       console.log("listening at port no. :"+process.env.PORT)
       })
    }
)
.catch(err=> console.log("error occured"+err))
