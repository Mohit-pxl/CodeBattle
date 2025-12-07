const mongoose=require('mongoose')
const {Schema}=mongoose

const UserSchema=new Schema({
    firstName:{

    }
})

const User=mongoose.model("User",UserSchema)

module.exports=User;