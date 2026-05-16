// //REAL
// import express from "express"
// import cookieParser from "cookie-parser"
// import cors from "cors"

// const app = express()

// // app.use()  means configrations

// // app.use(cors())  // ye akela b chl jay ga lekin ham ziada explore production grade likhen gay
// // app.use(cors({s
// //     origin: process.env.CORS-ORIGIN,
// //     credentials:true
// // }))

// // FIX 1: CORS properly applied
// app.use(cors({
//     origin: process.env.CORS_ORIGIN || "*",
//     credentials: true
// }))

// // app.use middleware routes ya configration k liay use hota ha
//   app.use(express.json({limit: "16kb"}))        //jb apne form bhra tb data aya       //accept json                           //preparation of coming data in databae

// //  app.use(express.urlencoded())   itne se b kam ho jay ga lekin ham aur ziada kre ge niche        //jb url se data aya

// app.use(express.urlencoded({extended: true, limit:"16kb"}))        //jb url se data aya        //objects k andr objects nesting

// app.use(express.static("public"))   //store folder files in server store images

// //  cookie parser is configration ma browser cookies access krena unma crud operation perform krna
// app.use(cookieParser())

// import userRouter from "./routes/user.routes.js"
// import healthcheckRouter from "./routes/healthcheck.routes.js"
// import tweetRouter from "./routes/tweet.routes.js"
// import subscriptionRouter from "./routes/subscription.routes.js"
// import videoRouter from "./routes/video.routes.js"
// import commentRouter from "./routes/comment.routes.js"
// import likeRouter from "./routes/like.routes.js"
// import playlistRouter from "./routes/playlist.routes.js"
// import dashboardRouter from "./routes/dashboard.routes.js"

// // routes declaration
// app.use("/api/v1/healthcheck", healthcheckRouter)
// app.use("/api/v1/users", userRouter)
// app.use("/api/v1/tweets", tweetRouter)
// app.use("/api/v1/subscriptions", subscriptionRouter)
// app.use("/api/v1/videos", videoRouter)
// app.use("/api/v1/comments", commentRouter)
// app.use("/api/v1/likes", likeRouter)
// app.use("/api/v1/playlist", playlistRouter)
// app.use("/api/v1/dashboard", dashboardRouter)

// // Global Error Handler
// import { errorResponse } from "./utils/apiResponse.js";
// app.use((err, req, res, next) => {
//     return errorResponse(res, err.message || "Internal Server Error", err.status || 500);
// });

// export { app };

// // CHATGPT
// // import express from "express";
// // import cookieParser from "cookie-parser";
// // // import cors from "cors";
// // // import dotenv from "dotenv";
// // // import connectDB from "./db/index.js";
// // import userRouter from "./routes/user.routes.js";

// // // dotenv.config({
// // //     path: './env'
// // // });

// // const app = express();

// // // Middleware setup
// // app.use(express.json({ limit: "16kb" }));
// // app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// // app.use(express.static("public"));
// // app.use(cookieParser());

// // // CORS setup (uncomment if needed)
// // // app.use(cors());
// // // app.use(cors({
// // //     origin: process.env.CORS_ORIGIN,
// // //     credentials: true
// // // }));

// // // Routes setup
// // app.use("/api/v1/users", userRouter);

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// CORS: Allow requests from any origin (supports credentials like cookies)
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// Global Error Handler
import { errorResponse } from "./utils/apiResponse.js";
app.use((err, req, res, next) => {
  return errorResponse(
    res,
    err.message || "Internal Server Error",
    err.status || 500
  );
});

export { app };
