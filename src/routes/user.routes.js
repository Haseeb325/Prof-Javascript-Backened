
//REAL
// import { Router } from "express";
// import {registerUser} from "../controllers/user.controller.js"  // agr export defailt na ho to is trahse import{} krte hain

// const router = Router()

// router.route("/register").post(registerUser);  //http://localhost:8000/api/v1/users/register

// export default Router;


// catgpt wala
import { upload } from "../middlewares/multer.middelware.js";
import { Router } from "express";
import { LogoutUser, registerUser, loginUser, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUsercoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {                            // ye multer ki waja se hua ha
            name: "avatar",                       //upload.fields ye baad ma likha gya ha setup k baad
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);  // use here middleware mtlb jate huay mujh se mil k jana

    router.route("/login").post(loginUser)


// secured Route
router.route("/logout").post(
   verifyJWT    // ye m iddleware inject kia ha jitne marzi middleware inject kr skte han jitni marzi functionality add krte jao
    ,LogoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,
    changeCurrentPassword
)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT, updateAccountDetails) // post se sari details update hojayn gi but patch se specific details he update hongi

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"),updateUsercoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)

export default router;
