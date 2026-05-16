import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return errorResponse(res, "Content is required", 400);
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id,
    });

    if (!tweet) {
        return errorResponse(res, "Failed to create tweet", 500);
    }

    return successResponse(res, "Tweet created successfully", tweet, 201);
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        return errorResponse(res, "Invalid User ID", 400);
    }

    const tweets = await Tweet.find({ owner: userId }).sort("-createdAt");

    return successResponse(res, "Tweets fetched successfully", tweets);
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        return errorResponse(res, "Invalid Tweet ID", 400);
    }

    if (!content) {
        return errorResponse(res, "Content is required", 400);
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        return errorResponse(res, "Tweet not found", 404);
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        return errorResponse(res, "Unauthorized request", 403);
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: { content },
        },
        { new: true }
    );

    return successResponse(res, "Tweet updated successfully", updatedTweet);
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        return errorResponse(res, "Invalid Tweet ID", 400);
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        return errorResponse(res, "Tweet not found", 404);
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        return errorResponse(res, "Unauthorized request", 403);
    }

    await Tweet.findByIdAndDelete(tweetId);

    return successResponse(res, "Tweet deleted successfully", {});
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
