import mongoose,{Schema} from "mongoose";

const tweetSchema = new Schema(
    {
        content:{
            type:String,
            required: true
        },
        owner:{
          type:Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            }
        },
        toObject: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            }
        }
    }
)


export const Tweet = mongoose.model("Tweet",tweetSchema)