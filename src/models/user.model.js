import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"    //ye tokens bnate hain that are not easily human readable
import bcrypt from "bcrypt"   // for hasing password encrypt decrypt
                          
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
avatar:{
    type:String,   //  cloudinary URL
    required:true
},
coverImage:{
type:String,  //cloudinary URL
},
watchHistory:[
    {
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
],
password:{
    type:String,
    required:[true,'password is required']
},
refreshToken:{
    type:String
}


    },{timestamps:true}
)

userSchema.pre ('save', async function (next){     // ye  hook ha jo password save hone se just pehle kuch krwa lo is trah aur b bre hooks hote hain
    // if(this.isModified("pasword")){ }
    if(!this.isModified('password')) return next();  // we can also handle it in tr catch

this.password = await bcrypt.hash(this.password, 10)
next()
})                  

userSchema.methods.isPasswordCorrect = async function
(password){                                     //method for checking and comparing password
 return  await bcrypt.compare(password, this.password)
}

// ACCESSTOKEN AUR REFRESHTOKEN KI KAHANI
// basically in ka maqsad ha k user ko bar bar login na krna pre
// jb tk ap k pass access token ha ap tb tk access kr skte ho authrntication ko ya resource ko
//  ye security rasons k liay use hitaa ha means sirf usey photo upload krne di jay server pe jo loggrd in ha ho skta ha ma ne logged in session expire kr dia ho aur 15 mint bAad dubara krna pre loged in
// refresh token user ko b dete hain ur database ma b save rkhtr hain user ko validate to access token se he krte hain lekin har baar ham kehte hain apko password dalne ki zrorst ni ha agr ap k pass refreshtoken ha na to ap endpoint hit kr do aur aagr whan se akp pass refresh token jo ha aur mere pass jo ha same ha to ham apko naya refresh token de den ge
//ACCESSTOKEN IS LONG LIVED AND REFRESH TOKEN IS SHORT
// more 
// access token user k pass hota ha 15 mint adha ghnta lekin hm 1 or token rkh len ge session storage ise refresh token b kehte hain ye data base ma savee rkhteh hain agr user ka access token expire hogya ha to us k pass 401 request aye gi to idhr frontened wala bnda kya kr skta ha agr 401 request agai to wo user ko ye kehne ki bajaye k login kro wo thora sa aur code likh skta ha k 1 endpoint hit krwao aur apna access token refresh krwa lo yani k new token mil jaye ga naya token is trah mile ga knap us request k sath apna refresh token bhejo ge sath to hoga is trah k jo apne refresh token bheja aur jo hamare pass database ma save ha agr match kr gaya to chle dubara se session start kr lete hain ye 1 hisab ka login he to ha  to user ko access token b new mil jaye ga aur refresh token b new mil jaye ga aur save hojaye ga yahi ha kahani

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,                       //ye sb database se access hoga aur generate hoga
            email: this.email,
            username :this.username,         
            fullName :this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function(){     
    return jwt.sign(
        {
            _id: this._id,                       //ye sb database se access hoga aur generate hoga
          
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)