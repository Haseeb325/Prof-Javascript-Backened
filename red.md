sb se pehle 
email aur username set krna --globsal se
<!-- mongodb+srv://haseebbaig6594325:<password>@cluster0.tnvsrw1.mongodb.net/ -->


middleware ka basic kam ye ha k user ne url hit kia like  /instagrsm aur middleware ne usay (req,res) k zriayres.send response send kr dia lekin ye baic ha is ma advance level pe b cheezen hoti hain functionality b add hoti ha checking  hot ha means "if user is logged in ha k ni"  


//cloudinary api secret
OFtBNgrR2j_sxYKzMqIir-lUJM4

import { v2 as cloudinary } from 'cloudinary';

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: 'dibifnrfx', 
        api_key: '949155732713241', 
        api_secret: '<your_api_secret>' // Click 'View Credentials' below to copy your API secret
    });
    
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();

//  upload through multer 
import multer from "multer";

const storage = multer.diskStorage({
    destination:function(req,file,cb/*means callback*/){
        cb(null,'.tmp/my-uploads')

    },
    filename:function(req,file,cb){
        const uniqueSuffix =Date.now() + '-' +Math.round
        (Math.random() *1E9)
        cb(null,file.fieldname + '-' +uniqueSuffix)
    }
})
const upload = multer ({storage:storage})
           _________________________________
           |-------------------------------|      
           /-------------------------------\
          / ________________________________\ 
         /* FLOW IN WHICH I HAVE WROTE CODE *\
         \-----------------------------------/
          \_________________________________/
          |_________________________________|

//sb se pehle folder files bnai 

sb se pehle mongodb connect kia pehle akela kia tha phr sath express app b bnai aur mongodb k sath manage kia 
phr models bnai
phr utilities bnai 
phr 1 utility bnai cloudinary
cloudinary k baad is k sath phr 1 multer middleware likha 
phr user.routes ma 3 line ka code likha aur export kr dia 
is k baad app.js ma code likha app.use(cor())
is trah aur b likhta gya app.js ma phr app.js ma user.routes ko import kia aur is ka 1 line ka code likha jo k user.routes ma gai phr user.routes ma route bnaya jo k kuch is trah chle ga 
                       --> sb se pehle app.use("/api/v1/users",userRouter) 
                       --> phr user.routes ma control jay ga import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js"  // agr export defailt na ho to is trahse import{} krte hain

const router = Router()

router.route("/register").post(registerUser)  //http://localhost:8000/api/v1/users/register

export default Router
                    --> phr control registerUser yani k user.controller ma jay ga import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js"  // agr export defailt na ho to is trahse import{} krte hain

const router = Router()

router.route("/register").post(registerUser)  //http://localhost:8000/api/v1/users/register

export default Router 
                  --> user.controller ma se phr 1 aur method call hoga asyncHandler jo check kre ga

ye sb krne k baad 
register methid likha files recieve krne se pehle tk jis ma sara data database ma jay ga 
is k baad     upload.fields user.routes ma likhen ge jo k as  middleware use hoga registerUser se just pehle jo k files upload krwane ma help kre ga
is k baad 
const avatarLocalPath = req.files?.avatar[0]?.path;        // getting and checking path
const coverImageLocalPath =  req.files?.coverImage[0]?.path;
 Is k baad phr baqi registerUser wala method complete kia

 Is k baad LogedIn user likhna start kia jo k password wrong ha tb tk likha 
 is k baad 1 aur external method banaya jo k refresh token aur access token generate krta ha 
 is k baad  wapis LoggedInUser k andr aye aur cookies ma send kr diay tokens agr password thk ha phr response send kr dia


Is k baad logoutUser likhna start kia  pehle 1 middleware likha for accessing  accesstoken is k baad logout user ma sab kuch likha

is k baad refreshAccessToken method likha complete

is k baad 1 model banaya subscription ka

 is k baad changeCurrentPassword,

 is k baad getCurrentUser,

   is k baad  updateAccountDetails,

   is k baad  updateUserAvatar,

   is k baad  updateUsercoverImage

is k baad ye getUserChannelProfile controller likha  is ma aggreation pipeline b likhin 












// setup explain of uploading files 
// multer.middleware.js

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });




// cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        console.log("File uploaded to Cloudinary:", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the local file if upload fails
        console.error("Error uploading file to Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary };


// cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        console.log("File uploaded to Cloudinary:", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the local file if upload fails
        console.error("Error uploading file to Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary };

// user.routes.js

import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            // Assuming you have the paths to uploaded files in req.files
            const avatarLocalFilePath = req.files['avatar'][0].path;
            const coverImageLocalFilePath = req.files['coverImage'][0].path;

            // Upload files to Cloudinary
            const avatarUploadResponse = await uploadOnCloudinary(avatarLocalFilePath);
            const coverImageUploadResponse = await uploadOnCloudinary(coverImageLocalFilePath);

            // Here you can handle the responses from Cloudinary as needed
            console.log("Avatar upload response:", avatarUploadResponse);
            console.log("Cover image upload response






new cluster password TbxJNJFqWfCdIXj7
username haseebbaig6594325_db_user
mongodb+srv://haseebbaig6594325_db_user:TbxJNJFqWfCdIXj7@cluster0.vyvy0pj.mongodb.net/?appName=Cluster0