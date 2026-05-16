import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
subscriber:{
    type: Schema.Types.ObjectId,  // one who is subscribing
    ref:"User"
},
channel:{
     type: Schema.Types.ObjectId,  // one to whom subscriber is subscribing
    ref:"User"
}
},
{timestamps:true}
)



export const Subscription =mongoose.model("Subscription", subscriptionSchema)


// ham channel aur user find kre ge k agr 1 chnnel ha 1 subscriber hain to dono he user ye wese name diay hauay
// user: a,b,c,d
//channel:CAC,HCH,FCC
 
// jb b koi user kisi channel ko subscribe kre ga to 1 document bne ga 2nd user agr usi channel ko subscribe kre ga yo phr 1 aur document bne ga har bar naya document bne ga is se ye hoga k ham ye b find kr sakte hain k kis user ne kon kon sa channel subscribe kia aur ye b find kr sakte k kon kon sa channel kis user se subscribed hua ha
// Means  multiple or single user can subscribe one aor ore channels
//And one or multiple hannels can be subscribed by one or more user

// channel se subscribers milen ge
// subscrbers se channel milen ge