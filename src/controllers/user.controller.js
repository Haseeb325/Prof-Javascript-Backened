
//REAl
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


// ye code login ka ha generateAccessAndrefreshToken
// ye koi web request ni ha is liay asynchandler use ni kr rhe ye wese he internal method ha

// userId ka access User se aye ga very easy ha
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // user ko find kia id ki base pe
        const user = await User.findById(userId)
        // ab access and refresh token generate kro

        // access aur refresh token hamare pass agai
        // ye dono models se aye hain
        const accessToken = user.generateAccessToken()    // ye methods hain is liay paranthesis lazmi ayen ge  wese har methods ma ate hain
        const refreshToken = user.generateRefreshToken()


        // ye token to user ko to de dete hain lekin refresh token database ma b save krte hain

        // refresh token ko db ma dalo very easy ku k user k andr sb kuch aya ha like password username email is trah refresh token b aya ha jo k model ma define kia hua  ye user object wala ha jis ma ye sb kuch aya ha

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })  // without validtion ye jo save hua ha ye encoded ha

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while enerating access and refresh token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // return res.status(200).json({
    //     message: "ok hogya bro"
    // })
    //     // get user detail from frontened
    //     // Validation Not be empty shoulb be correct
    //     // check if user already exist : username, email
    //     // check for images, check for avatar
    //     // upload them to cloudinary
    //     // create user object - create entry in db
    //     // remove password and refresh token field from response
    //     // check for user creation
    //     // return res


    // jb user ne form bhra
    const { fullName, email, username, password } = req.body         // req.body me sara data askta ha sirf url se jo data ata ha us k 1 alag method ha
    console.log("email", email)
    console.log(req.files)


    //  Basic method of validation
    // if(fullName === ""){
    //     throw new ApiError(400,"fullname is required")
    // }
    // if(username === ""){
    //     throw new ApiError(400,"username is required")
    // }



    //  Advance method

    if (
        //OPTIONAL CHAINING METHOD
        [fullName, email, username, password].some((field) => // it returns true or false mtlb k some()functioncheck kre ga trim()mtlb removes whitespaces fro start and end of chracter  ?Qmark ye chain krta h k agr if any field null y undefined ha to some() true hog aur error ajaye ga 
            field?.trim() === "") // agr field ha to trim kr do agr trim krne k baad bhi wo empty ha to true hoga agr 1 b true mtlb 1 b field khali ha to automatically true return hoga 
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // User.findOne({username})     ye dono b use ho skte
    // User.findOne({email})

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist")
    }


    // jb user ne text bhr dia lekin file upload na ki user ki galti

    const avatarLocalPath = req.files?.avatar[0]?.path;      //ye multer se aye ga multer files checkkrne ki sahulat deta ha aur ye path wo ha jo k file.originalname ha  // getting and checking path 
    // chahe ye uprwala method use kr lo ye is liay k ye avatar to lazmi ana he ana ha is k liay niche wali condition

    // const coverImageLocalPath =  req.files?.coverImage[0]?.path; // yhan error askta ku k ise ham ne check nhi kia k coverimage aya k ni aya is trah ki optional chaiin ho skta is liay dusra method use krne lga hu
    // is upar wale coverImage ale ma agr na upload ho to undefined aye ga jo k eror ha aagr optional ho koi cheeze to ye na use kro

    let coverImageLocalPath;  // this is classic method of checking ye ham avatar k liay check kr skte isi trh se but wo b thk ha
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) // is ma aesa ha k agr upload hogai to  thk ha agr na jui to 1 empty string de de ga
    {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar files are required")
    }


    // idhr check kre ge cloudinary pe upload hui k ni agr na hui kisi b wja se for example internet issue se to ye error aye ga

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "avatar files are required")
    }


    // ab ham user create kre ge db ma entry hogi User se se jo k models se aye ga
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    console.log(user)


    // ab check kre ge k user create hua ha k ni user ko find kre
    // jb b database ma entry ho k data enter ho ga sath ma 1 id b ajati ha database ki trf se jis se find kre ge

    // const createdUser = await User.findById(user._id)  //is se b check ho sakta 

    // ye kuch additional functionality deta ha
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"  //mtlb ye nhi ayen ge // is ka mtlb jb user create hoga database ma to jae ga lekin idhr se hat jay ga baqi aur is pe research krni ha is ka si ni pta
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    // agr user bn gya to return kr de ge
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )





})


const loginUser = asyncHandler(async (req, res) => {

    //get data from request body
    //username aur email ya jis pe check krna ho ha k ni
    // find the user  user h k ni
    // agr user ha password check kro
    // agr password wrong ha bol do password is wrong
    // agr password thk ha  to accesstoken aur refresh token generate kro jo k models ma kia hua 
    // in tokens ko send kr do jese mrzi chlo secure cookies ma he kr do send mostly cookis ma he send krte hain aur response b bhej do successfully  

    // 1st step is step pe frontened b soch lete hain k kis se login kre ge 
    const { email, username, password } = req.body
    console.log(email)

    // in cheezon k liay logic socha kro k kya krna chahte ho
    if (!(username || email)) {
        throw new ApiError(400, "username or  emailis required")
    }

    // if(!username || !email)  ye b thk ha
    // {throw new ApiError(400 , "Username or email is required")
    //     if(!username && !email){

    //     }}


    // find user

    // for only one
    // User.findOne({email})
    // User.findOne({username})

    // for Optional

    // ku k database dusre continent ma hota ha is liay lazmi aye ga socho jhan b waiting wala kam ha whan await laga do
    // ye or find kre ga chahe username ki base pe mil jaye chahe email ki base pe mil jaye
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    // agr user Na Mile

    if (!user) {
        throw new ApiError(400, "user does not exist")
    }

    // cpital {User} ye mongodb wala ha ye use hota mongodb queries k liay aur small {user} ye hamara bnaya hua jhan se check kre ge match kia k ni 
    //idr ham password check kre ge jo k this.password se mile ga bcrypt wala i think {password} jo ha ye user wala ha jo function ma pass hua hua lekin jo saved user ka password ha wo this.password se mile ga 

    const isPasswordValid = await user.isPasswordCorrect(password) // ye body wala nikala jo user ne enter kia
    if (!isPasswordValid) { 
        throw new ApiError(401, " Invalid User Credentials Wrong password")
    }

    // if password thk h
    // access aur refresh token le lo dono mil gay user jo create hua us ki id ki base pe yhi to mang rha tha
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // ku k jb pehle to user emty ha mtlb k  idr const user = await User.findOne({
    // $or: [{username},{email}]
    // })us k pass refresh token ni ha ku k access aur refresh token to ham ne niche lia baad ma idr const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id) token mile isi liay 1 aur db query lgani prni 2 tarike hain ya to user ko update kr do ya  aur db query lga do jo b best ha cookies ma send kne k liay


    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")     //.select optionl cheeze ha
    console.log(loggedInUser)
    // send in cookies  ye cookies app.cookies ma recieve ho gi  app.js k andr 

    const options = {
        httpOnly: true,       // in li waja se ab frontened se modify ni hoskti only can be modified by server
        secure: true
    }

    return res
        .status(200) // key     // value
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken     // ye is liay behja k hoskta user apni localstorage ma save krna chahta ho

                },
                "User Logged In seccessfully"
            )
        )


})


// Logout Method

const LogoutUser = asyncHandler(async (req, res) => {
    // removes the cookies
    //jo ham ne middleware likha udr us ki waj ase req.user ki access mil gai
    // req.user._id

    await User.findByIdAndUpdate(
        req.user._id,          // is se find kro
        {
            // kya update krna ha db ma 
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User LoggedOut Successfully")
        )

})



// For refreshing token
// access token user k pass hota ha 15 mint adha ghnta lekin hm 1 or token rkh len ge session storage ise refresh token b kehte hain ye data base ma savee rkhteh hain agr user ka access token expire hogya ha to us k pass 401 request aye gi to idhr frontened wala bnda kya kr skta ha agr 401 request agai to wo user ko ye kehne ki bajaye k login kro wo thora sa aur code likh skta ha k 1 endpoint hit krwao aur apna access token refresh krwa lo yani k new token mil jaye ga naya token is trah mile ga k ap us request k sath apna refresh token bhejo ge sath to phr hoga is trah k jo apne refresh token bheja aur jo hamare pass database ma save ha agr match kr gaya to chle dubara se session start kr lete hain ye 1 hisab ka login he to ha  to user ko access token b new mil jaye ga aur refresh token b new mil jaye ga aur save hojaye ga yahi ha kahani

const refreshAccessToken = asyncHandler(async (req, res) => {
    // for refreshing 
    // pehle refresh token lbo from cookies

    // req.cookies.refreshToken  ye b chle ga 
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken    //  agr koi mobile pe b acces krna chahe  

    // agr refresh token na mile
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    // agr mil gya ha to 
    // verify incoming
    // decoded token chaye hota

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,   // ise token ko verify kro
            process.env.REFRESH_TOKEN_SECRET   // ye secret ha
        )

        // ab is token ki base pe user find kro
        const user = await User.findById(decodedToken?._id)    // User mujhe find krna kon sa user find krna ha wo mere pass decoded token ma rakha hua ha us ma se _id  nikal lete hain
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        // ab agr user mil gya ha ku ki ham ne idhr const user =await User.findById(decodedToken?._id) find kia ha user ko 2 conditions ho skti hain ya to user na mile yo ham error show krwai ge agr is query se mil jay to phr next proceed kre ge

        // Ab hamare pass token 2 trah se aya ha incoming token jo k full token ha aur 1 decoded token decode token mtlb payload alag kr do aur baqi aur alag pehle ham ne 1 token save krwaya tha jb login kia wo refresh token wo complete tha encoded ab ham match kre ge  incoming token jo user hame bhej rha ha aur is token ko decode kr k decoded token jis se user find kia agr ye dono match kre ge agr match kr gya to mamla thk ha

        // agr match ho gya to kam agy brhe ga warna ye error ajay ga
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired")
        }

        // agr match kr gya to conditio ki zrorat ni ha ham next kam krte hain

        // upr wla error aye ga agr na match kia agr jo user wala aur db wala match kr gya to login ho jaye ga aur new generate krk de deb ge

        // ab new generate kro and again send in cookies

        // token chahe options se pehle le lo chahe baad ma no problem
        const options = {
            httpOnly: true,
            secure: true
        }
        // ab upr 1 method bnaya tha jo k accesstoken and refreshtoken generate krta ha use use kre ge
        // ziada tr ham values ko ya method ko sirf 1 variable ma store krte hain lekin idhr hame 2 ki zrorat ha is liay 2 bnaye ge
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id) // generate ho chuka aur user mil chuka to pass kr do _id
        return res
            .status(200)
            .cookies("accessToken", accessToken, options)
            .cookies("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )


    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }




})



// 

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // is ma ham yha pe check ni kre ge k user loggedIn ha k ni balke route se pehle jwt verifykre ge jb route bnayen ge

    const { oldPassword, newPassword } = req.body

    /*
    // agr confirm password b check krna ho
    // const {oldPassword , newPassword, confPassword} = req.body
    // if(!(newPassword === confPassword)){
    //     throw new ApiError(401, "password must bw same")
    // }
    */

    // User lbo agr user find kre ge to is ka mtlb user loggedIn ha aur ye ham multer se kr len ge agr to multer se user find kia ha to udr se id nikal len ge

    const user = await User.findById(req.user?._id)         // req.user agr hoga udr to id nikal lo
    // ab agr user agya ha toh is user k pass method b hoga isPasswordCorrect

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)    // ye yah true dega ya false  ku ki ispaswrdCrct async method ha model ma to await kr lete hain

    // ab check kr lo
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid Old password")
    }

    // agr wrong hoga to upr error ajaye ga agr password match kr jata ha to agay chlte hain

    // ab new set krte hain // user.password ye {user} ye user jo create hu tha aur {password} model wala ha
    user.password = newPassword // ab jese he yay trigger hoga to ham jayn ge models k andaraur model hame kya bole ga k password set kr rhe ho to save ho rha ha ab save hone se just pehle ye pre ye pre wala hook chle ga ab dekhe agr modified ha to password return kr do agr modified nhi ha phr to thk ha lekin ham modification kr rhe hain to bcrypt hash kr k jaye ga to hash b apna ap ho rha mujhe chinta nhi ku ki is trah code lika gya ha ku ki yhan hoga ye k pehle to this.!isModified ha agr ye wala field ha e ni to koi dikat nahi mtlb not modified koi chinta nhi si chl rha ha
    // ab save kre ge jb phr wo pre wala hook call ho ga

    await user.save({ validateBeforeSave: false }) // vlidate false ka mtlb jb password set ho k user save hoga to baqi ki validation run n kre gi

    // kam hogya upar tk ab bs 1 msg show krwa dete hain
    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password Changed successfully")
        )

})


// ab current user get kro wo alag situaion hogi k wo kese krte lekin 1 endPoint hame banaan pre ga jis se current user get kre ge

// agr user loggedIn ha to 2 mint ma current user get kr len ge
const getCurrentUser = asyncHandler(async (req, res) => {
    // sidha return kr do
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully")) // hamari is request pe middleware run ho chuka ha aur user mil chuka
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    // if (!fullName || !email) {
    //     throw new ApiError(400, "All fields are required")
    // }
    if (
        //OPTIONAL CHAINING METHOD
        [fullName, email,].some((field) => // it returns true or false mtlb k some()functioncheck kre ga trim()mtlb removes whitespaces fro start and end of chracter  ?Qmark ye chain krta h k agr if any field null y undefined ha to some() true hog aur error ajaye ga 
            field?.trim() === "") // agr field ha to trim kr do agr trim krne k baad bhi wo empty ha to true hoga agr 1 b true mtlb 1 b field khali ha to automatically true return hoga 
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // user find kro

    // req.user?._id // req.user optionally unchain kr k id nikal li   ye current user ha  think ya na id ki base pe user find hua
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,            // ya is trah likh lo
                email
                //  email :email        // ya is trah ust syntax ha
            }
        },
        { new: true }    // is ka mtlb update hone k baad jo info hoti ha wo return hoti h

    ).select("-password") // is ka mtlb user dubara save hoga jb user ne send kia means update kia to user ma se ye sb hita do ye ham 1 aur query mar k b kr skte the lekin chle ye b thk h query is trah user ko dubara find kr k _id se us ma se ye fields hita dete .select() laga k but ye database cost increase krta ha ku ki udr kam ho rha aktha ok kro

    // ab return kr do

    return res
        .status(200)
        .json(
            new ApiResponse(200, { user }, "Account Details updated successfully")
        )

})

// ab ham files update kre ge files update krte waqat do cheezon ka dehan rkhen ge
// middlewares ki chinta krni pre gi 
// 1st multer lagana pare ga taake files accept kr pao
// 2nd sirf wohi user update kr paye ge jo loggedIn hon ge 
// Routing krte waqat ye 2 middleware use krne pre ge routing krte waqat in ka dehan rakhen ge 
// abhi idhr sirf controllers likhte hain 

// ASSIGNMENT PLEASE DELETE OLD IMAGE AFTER UPLOADING NEW IMAGE  NEW UPLOAD HONE SE PEHLE B OLD DELETE HO SKTI HA LEKIN ZIADA BETTER AUR ZIADA SENSSE YHI HA K NEW UPLOAD HONE K BAAD OLD DELETE KI JAY
// Delete kuch aese hoga k new upload hone k baad old image ka url le k cloudinary wala use variable ma hold kr k delete kr de 1 utility bna lejiye 

const updateUserAvatar = asyncHandler(async (req, res) => {
    // pehle req.files ye hame kha se mila ye mila multer mddleware ki through ku ki jb bhi multer middleware inject krna ha hame hame waha file waha option mil jay ge
    // vip ku k jb pehle ham ne register krte waqat lia tha waha files likha tha ku multiples tha ku ki array lia tha yaha aesa ni ha idhr file likhe ge

    // req.file?.path   // agr file present ha to optionally path le lete hain bs

    const avatarLocalPath = req.file?.path     // acha ye ham aese sidha b upload kr skte db ma cloudinary k begair to isi ko as it is save krwa skte db ma

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //Now upload kr do cloudinary pe

    // uploadOnCloudinary(avatarLocalPath) // ye method ha jis ma sirf path dena hota
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    // agar upload hogya ha lekin url ni mila 
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")

    }

    // ab update kr do
    const user = await User.findByIdAndUpdate(
        req.user?._id,      // ise update kr do
        {
            $set: {             // ye update kr do
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")   // password hta do bhai

    return res
        .status(200)
        .json(
            new ApiResponse(200, { user }, "Avatar Image updated successfully")
        )

})


// coverimage

const updateUsercoverImage = asyncHandler(async (req, res) => {
    // pehle req.files ye hame kha se mila ye mila multer mddleware ki through ku ki jb bhi multer middleware inject krna ha hame hame waha file waha option mil jay ge
    // vip ku k jb pehle ham ne register krte waqat lia tha waha files likha tha ku multiples tha ku ki array lia tha yaha aesa ni ha idhr file likhe ge

    // req.file?.path   // agr file present ha to optionally path le lete hain bs

    const coverImageLocalPath = req.file?.path     // acha ye ham aese sidha b upload kr skte db ma cloudinary k begair to isi ko as it is save krwa skte db ma

    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage file is missing")
    }

    //Now upload kr do cloudinary pe

    // uploadOnCloudinary(coverImageLocalPath) // ye method ha jis ma sirf path dena hota
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // agar upload hogya ha lekin url ni mila 
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on image")

    }

    // ab update kr do
    const user = await User.findByIdAndUpdate(      // const user ye ham ne refrece ma le lia ye response ma bhejne k liay agr response ni bhejna hota to variable ma store krne ki zarorat ni
        req.user?._id,      // ise update kr do
        {
            $set: {             // ye update kr do
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")   // password hta do bhai

    return res
        .status(200)
        .json(
            new ApiResponse(200, { user }, "Cover Image updated successfully")
        )

})



// MONGODB AGGREGATION 
// USED FOR JOINING  
// 1 document ko dusre document se join krta ha on the bases of id that are same on both documents . And also documents can be joined by any other thing
// AGGREATION IS A PIPELINE CONSIST OF ONE OR MORE STAGES THAT PROCESS DOCUMENTS
// EACH STAGE PERFORMS AN OPERATION ON THE INPUT DOCUMENTS .FOR EXAMPLE A STAGE CAN FILTER DOCUMENTS , GROUP DOCUMENTS , AND CALCULATE VALUES
// THE DOCUMENTS THAT ARE OUTPUT FROM A STAGE PASSED O THE NEXT STAGE
// IN OTHER WORDS AGR KAHI 100 DOCUMENTS HAIN AUR HAM KEHTE HAIN K 50 SELECT KRO IN 100 KO 50 KR DO TO NEXT STAGE MA 50 HE KEHLAYEN GE 

// Example 
//db.orders.aggregate([
// stage 1: filter piza order documents by pizza size
// {
//     $match{size: "medium"}

// },
// stage 2:

// {
// // group remaining documents by pizza name and calculate total quantity
// $group:{
//     _id:"$name", totalQuantity: {$sum: "$quantity"}
// }
// }

//])

// Ham in pipelines ko array mai b rakh skte hain aur kisi variable mai b rakh sakte


// more pipelines

// [
//     {  // 1st pipeline
//         $lookup: {               // This is for joining
//             from: "authors",
//             localField: "author_id",
//             foreignField: "_id",
//             as: "author_details",
//             // test
//         }
//     },
//     // 2nd pipeline
//     {
//     $addFields: {     // Adding additional fields
// // newField: expression
// author_details:{
//     $first: "$author_details"   // mtlb mujhe first field chaye first value chaye author-details se 
//     ArrayElemAt:["$author_details" , 0] // mtlb mujhe first field chaye first value chaye author-details se
// }
//     }
//     }
// ]

// 1 project pipeline b hota jis ka mtlb ha jo jo fields apne select kiay sirf wohi return honge


const getUserChannelProfile = asyncHandler(async (req, res) => {
    // jb b user ya chnnel ki profile pe jana hota to ap channel k url pe jate @chaiaurcode jo b un ka tarika hota lejane ka
    // to isi trah hame b mile ga
    //  req.params  se mile ga user mtlb url se

    const { username } = req.params
    // ab ham ne koshish k user ko lene ki params se lene ki ho sakta ha empty ho to ab condition lagao

    if (!username?.trim()) {   // agr nhi ha to error agr ha to trim 
        throw new ApiError(400, "username is missing")
    }
    // ab yhan tk ma agya hun to expect krta hun k username hoga
    // ab username se user find krte

    // ab ham aggregation lagane lge hain 
    // 1st tarika pehle username lo ge user lo ge phr id ki base pe aggregation lagayn ge User.find({username})
    // 2nd tarika dono kam akathe kr lo

    // 1 match  aggregation hota jo k khud he sare documents se find kr leta jise b krna ho

    //    User.find({username})

    // aggregation ka result arrays ma ata ha use handle krna b agay sikhen ge

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()        // ye hamare pass $ match wala 1 document bn gya ab hm lookup kre ge 
            }
        },


        // KUCH IS TRAH SE MILEN GI FIELDS
        // channel se subscribers milen ge
        // subscrbers se channel milen ge


        // ab find kre ge channel k through mtlb user k subscriber kitne hain kon se hain
        {
            $lookup: {
                from: "subscriptions",      // model se aya   
                localField: "_id",      // is ki base pe
                foreignField: "channel",   // mtlb kha pe present hoga
                as: "subscribers"        // mtlb is k andr sb kuch ajaye ga ye ha last pe jo dena ha mrzi dedijiye     Ab is pipeline mai hame channel k subscriber mil gay sirf finding hui
            }
        },
        // 2nd pupeline
        // ab ham ye pta kre ge k currnt user ne mtlb k mane kitne channel subscribe kiay
        // channels find kiay subscribers k through
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",  // ye model wala ha
                as: "subscribedTo"     // ye just name ha mtlb k mane kin kin ko subscribe kr rakha hai
            }
        },

        // ab in dono fields ko add kro ya in se jo information leni ha lelo bhai 
        // mtlb k agr ham user ma kuch add kr rhe pehle wala data to aye ga hi kuch additional b aye ga
        // mtlb original user ma kuch aur fields add kr din
        {
            $addFields: {    // mtlb k ye wale sare fields add krne hain
                subscribersCount: {
                    $size: "$subscribers"    // sare subscribers ka count mil jaye ga  ye channel wale pipeline se use hua  as   wala
                },

                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },


                // Ab ham subscribe button ko handle kre ga agr subscribe ha to true warna false

                isSubscribed: {
                    $cond: {      // ab ham dekhe ge k jo ham ne subscribers count kiay un ma me mai hun k ni
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },  // agr user login ha to req k pas user hoga to user check kro id ki base pe aur field $subscribers ma se check kro .subscriber ku ki model ma yahi to ha  ab ye field he to ha us ma dekh lo ma hun k ni hu
                        then: true,
                        else: false


                    }
                }



            }
        },

        {
            // project ka mtlb k mai sara kuch nhi dun ga balke kuch selected cheezen dun ga
            $project: {
                fullName: 1,      // 1 aik flag ha mtlb k username ka flag on kr do to ye chla jay ga   
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                emai: 1,
            }
        }

    ])

    // aagr channel he nhi ha mtlb array jo milta ha wo ha he ni to ye error de do
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exist")
    }

    // Aur agar length ha to ham array b return kr skte hain pr array ki waja se frontened wala roye ga  wo roye na to ham response return kr dete hain achi trah se

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")  // chsnnel[0] ka mtlb ha k first object agya us ma se data pick pick kr k laga de ga frontened wala
        )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    // req.user._id   is se hame string milti ha agr hame exact id chaye to puri objectId paranthesis m chaye behind the scene mongoose khud manage krta ha
    // id k liay convert krna prta

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)  // aggregation ma id lene k liay convert krna prti string ko id ma
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",                     // ab idr akr hame boht sare documents means videos mil gay aur owner mtlb current user ki history k liay aur pipelines lagayn ge
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner", // ab is ma user ka sb kuch agya fullname username password everything isay reduce krne k liay aur pipeline lagayn ge
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]

                        }
                    },
                    {
                        $addFields: {       // ye additional kam ha wese upr tk to array mile ga saray ka sara lekin frontened ko aur easy krne k liay ham ne array se pehla field mtlb data wala separate le lia
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, user[0].watchHistory,
                "watch history fetched successfully"
            )
        )

})


export {
    registerUser,
    loginUser,
    LogoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory

}




// chatgpt wala
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { User } from "../models/user.model.js";

// const registerUser = asyncHandler(async (req, res) => {
//     // Perform registration logic here
//     // For now, just sending a basic response
//     return res.status(200).json({
//         message: "ok yar"
//     });
// });

// export { registerUser };


// const registerUser = asyncHandler(async (req, res) => {

//     // get user detail from frontened
//     // Validation Not be empty shoulb be correct
//     // check if user already exist : username, email
//     // check for images, check for avatar
//     // upload them to cloudinary
//     // create user object - create entry in db
//     // remove password and refresh token field from response
//     // check for user creation
//     // return res

//      const {fullName, email, username, password } = req.body         // req.body me sara data askta ha sirf url se jo data ata ha us k 1 alag method ha
//      console.log("email",email)

// })

// export { registerUser }