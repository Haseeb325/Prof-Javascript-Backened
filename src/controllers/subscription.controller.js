import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        return errorResponse(res, "Invalid Channel ID", 400);
    }

    if (channelId.toString() === req.user?._id.toString()) {
        return errorResponse(res, "You cannot subscribe to your own channel", 400);
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });

    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed._id);
        return successResponse(res, "Unsubscribed successfully", { isSubscribed: false });
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    });

    return successResponse(res, "Subscribed successfully", { isSubscribed: true });
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        return errorResponse(res, "Invalid Channel ID", 400);
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            id: "$_id",
                            _id: 0
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                subscriber: { $first: "$subscriber" },
            },
        },
        {
            $addFields: {
                id: "$_id"
            }
        }
    ]);

    return successResponse(res, "Subscribers fetched successfully", subscribers);
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        return errorResponse(res, "Invalid Subscriber ID", 400);
    }

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            id: "$_id",
                            _id: 0
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                subscribedChannel: { $first: "$subscribedChannel" },
            },
        },
        {
            $addFields: {
                id: "$_id"
            }
        }
    ]);

    return successResponse(res, "Subscribed channels fetched successfully", channels);
});


export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
