// const { default: mongoose } = require("mongoose")
// import mongoose from "mongoose"

// import { DB_NAME } from "./constants"
// import express from "express"



// Database Connection


// Database Connection krte waqat     //ya toh try catc use kro ya phr resolve use kro
//never connect database only in with one line always use better approach

//first method

// function connectDB(){

// }
// connectDB()


//Second and best method
//iffi

// require ('dotenv').config({path:'./env'})
import dotenv from "dotenv"





import connectDB from "./db/index.js"


 dotenv.config({

path: './env'                  //in first file we try to load our env variable

})                          
connectDB()




/* This is first approach  2ND Approach ma ma ne DB folder ma 1 file bnai us ma database connect kia aur idhr akr use import kia 

import mongoose from "mongoose"

import { DB_NAME } from "./constants"

import express from "express"
const app = express()

( async ()=>{
    try{
 await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
 app.on("error",(error)=>{
console.log("ERR:",error)
throw error
 })

app.listen(process.env.PORT,()=>{
    console.log(`App is listem=ning on port ${prooces.env.PORT}`);
})

    }
    catch (error){
        console.log("ERROR",error)
        throw error
    }
})()*/
