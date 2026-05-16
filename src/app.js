
//REAL
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app = express()

// app.use()  means configrations

// app.use(cors())  // ye akela b chl jay ga lekin ham ziada explore production grade likhen gay
// app.use(cors({s
//     origin: process.env.CORS-ORIGIN,
//     credentials:true
// }))


// app.use middleware routes ya configration k liay use hota ha
  app.use(express.json({limit: "16kb"}))        //jb apne form bhra tb data aya       //accept json                           //preparation of coming data in databae

//  app.use(express.urlencoded())   itne se b kam ho jay ga lekin ham aur ziada kre ge niche        //jb url se data aya    

app.use(express.urlencoded({extended: true, limit:"16kb"}))        //jb url se data aya        //objects k andr objects nesting 


app.use(express.static("public"))   //store folder files in server store images 


//  cookie parser is configration ma browser cookies access krena unma crud operation perform krna
app.use(cookieParser())



// routes imports
import userRouter from "./routes/user.routes.js"



// routes declaration

  // agar routes aur middleware akathe likhne hain to app.get() use krna ha agr routes aur middlewares separate likhe hon to ohr app.use()  istemal kre ge idhr ham app.use() istemal kre ge ku ki routes aur middlewares separate separate likkhe hain
// app.use("/users",userRouter)  //ye kuch is trah kam kre ga k jb koi b / users hit kre ga to ye jay ga /register pe  
//     aur url kuch is trah bne ga  http://localhost:8000/users/register  its a best practice


app.use("/api/v1/users",userRouter)  //agar export defaut ho rha ho to name jo mrzi rkh lo//http://localhost:8000/api/v1/users/register user.routes ma b dekhen
// app.get se ham routes aur controllers idhr akathe he likte hain 
// app.use middleware routes ya configration k liay use hota ha

export { app }


// CHATGPT
// import express from "express";
// import cookieParser from "cookie-parser";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // import connectDB from "./db/index.js";
// import userRouter from "./routes/user.routes.js";

// // dotenv.config({
// //     path: './env'
// // });

// const app = express();

// // Middleware setup
// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static("public"));
// app.use(cookieParser());

// // CORS setup (uncomment if needed)
// // app.use(cors());
// // app.use(cors({
// //     origin: process.env.CORS_ORIGIN,
// //     credentials: true
// // }));

// // Routes setup
// app.use("/api/v1/users", userRouter);