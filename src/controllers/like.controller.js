import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/likes.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        return errorResponse(res, "Invalid Video ID", 400);
    }

    const likedAlready = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id);
        return successResponse(res, "Like removed successfully", { isLiked: false });
    }

    await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    });

    return successResponse(res, "Liked successfully", { isLiked: true });
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        return errorResponse(res, "Invalid Comment ID", 400);
    }

    const likedAlready = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id);
        return successResponse(res, "Like removed successfully", { isLiked: false });
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });

    return successResponse(res, "Liked successfully", { isLiked: true });
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        return errorResponse(res, "Invalid Tweet ID", 400);
    }

    const likedAlready = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id);
        return successResponse(res, "Like removed successfully", { isLiked: false });
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    return successResponse(res, "Liked successfully", { isLiked: true });
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: { $exists: true },
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                video: { $first: "$video" },
            },
        },
    ]);

    return successResponse(res, "Liked videos fetched successfully", likedVideos);
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
