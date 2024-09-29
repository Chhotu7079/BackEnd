const mongoose = require("mongoose");

//kisi bhi chij ka object yaa data
const todoSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            maxLength:50,
        },
        description: {
            type:String,
            required:true,
            maxLength:50,
        },
        createdAt:{
            type:Date,
            required:true,
            default:Date.now(),
        },
        updatedAt:{
            type:Date,
            required:true,
            default:Date.now(),
        }
    }
);

//todo ke naam se export kr diya agar koi bhi isse use krega to todo ke naam se use kr sakta hai
module.exports = mongoose.model("Todo", todoSchema);