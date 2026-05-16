import mongoose from "mongoose";
import {DB_NAME } from "../constants.js"

//DB is another continent 

// MONGODB_URI=mongodb+srv://username:password@cluster0.tnvsrw1.mongodb.net/<dbname>?retryWrites=true&w=majority
const connectDB = async()=>{   // async jb b execute hoti ha 1 promise b return krt ha ye common cheeze ha
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`\nMongodb connected!! DB Host :${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection failed",error)
        process.exit(1)     //koi b application 1 na 1 process pe chlti ha ye process. node ka method ha ye us ka referrence ha ham process ko exit b krwa skte ahin
    }
}
export default connectDB

// haseeb4780767
// CmGhVGXoH68ANqKg
// 116.71.185.5/32
// # MONGODB_URI="mongodb+srv://haseebbaig6594325:haseeb654325@cluster0.tnvsrw1.mongodb.net "

// # MONGODB_URI="mongodb+srv://haseeb4780767:CmGhVGXoH68ANqKg@cluster0.tnvsrw1.mongodb.net "
// mongodb+srv://haseeb4780767:CmGhVGXoH68ANqKg@cluster0.vx6iong.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
