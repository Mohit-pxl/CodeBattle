const mongoose=require('mongoose')
const {Schema}=mongoose

const UserSchema=new Schema({
    firstName:{
        type:String,
        require:true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20,

    },
    emailId:{
        type:string,
        require:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:string,
        enum:["user","admin"],
        default:"user"

    },
    problemSolved:{
        type:[string]

    }
},{
    timestamps:true
})

const User=mongoose.model("User",UserSchema)

module.exports=User;