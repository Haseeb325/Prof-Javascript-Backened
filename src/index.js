// const { default: mongoose } = require("mongoose")
// import mongoose from "mongoose"

// import { DB_NAME } from "./constants"
// import express from "express"



// Database Connection


// Database Connection krte waqat     //ya toh try catch use kro ya phr resolve use kro
//never connect database only in with one line always use better approach

//first method

// function connectDB(){

// }
// connectDB()




// require ('dotenv').config({path:'./env'})
import dotenv from "dotenv"


import connectDB from "./db/index.js"
import { app } from "./app.js"


dotenv.config({

    path: './env'                  //in first file we try to load our env variable

})


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("Mongo db connection failed", err)
    })




/* This is first approach  2ND Approach ma ma ne DB folder ma 1 file bnai us ma database connect kia aur idhr akr use import kia 


//Second  is ma ham ne express ki app b idhr he bna di jo k standrd practice nhi ha
//iffi
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
    console.log(`App is listening on port ${prooces.env.PORT}`);
})

    }
    catch (error){
        console.log("ERROR",error)
        throw error
    }
})()*/





// chatgpt wala

// import dotenv from "dotenv"


// import connectDB from "./db/index.js"
// import { app } from "./app.js"


// dotenv.config({

//     path: './env'                  //in first file we try to load our env variable

// })


// connectDB()
//     .then(() => {
//         app.listen(process.env.PORT || 8000, () => {
//             console.log(`Server is running at port : ${process.env.PORT}`);
//         });
//     })
//     .catch((err) => {
//         console.log("Mongo db connection failed", err);
//     });