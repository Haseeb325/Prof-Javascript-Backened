import mongoose from "mongoose";
import {DB_NAME } from "../constants.js"

//DB is another continent 

const connectDB = async()=>{
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`\nMongodb connected!! DB Host :${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection failed",error)
        process.exit(1)     //koi b application 1 na 1 process pe chlti ha ye process. node ka method ha ye us ka referrence ha ham process ko exit b krwa skte ahin
    }
}
export default connectDB