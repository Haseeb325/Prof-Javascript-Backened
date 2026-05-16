import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/likes.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    // Total Views and Total Videos
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalVideos: { $count: {} },
            },
        },
    ]);

    // Total Subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId,
    });

    // Total Likes (on all videos of the channel)
    const totalLikes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoInfo",
            },
        },
        {
            $unwind: "$videoInfo",
        },
        {
            $match: {
                "videoInfo.owner": new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $count: "totalLikes",
        },
    ]);

    const stats = {
        totalViews: videoStats[0]?.totalViews || 0,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalSubscribers: totalSubscribers || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0,
    };

    return successResponse(res, "Channel stats fetched successfully", stats);
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const videos = await Video.find({ owner: userId }).sort("-createdAt");

    return successResponse(res, "Channel videos fetched successfully", videos);
});

export { getChannelStats, getChannelVideos };
