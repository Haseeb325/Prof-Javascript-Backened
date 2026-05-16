import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
content:{
    type: String,
    required: true
},
video:{
    type: Schema.Types.ObjectId,
    ref: "Video"
},
owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
}
    }, 
    {
timestamps:true
    }
)



commentSchema.plugin(mongooseAggregatePaginate)  // iska mtlb ha k kon c cheeze kitni deni ha mtlb agr ham videos he khi dete hain to hamare pass control hoga k kitne dene hain kese kitna manage krna ha


export const Comment = mongoose.model("Comment", commentSchema)