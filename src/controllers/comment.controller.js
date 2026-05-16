import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) {
        return errorResponse(res, "Invalid Video ID", 400);
    }

    const commentAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            },
        },
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
                            id: "$_id",
                            _id: 0
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
        {
            $addFields: {
                id: "$_id"
            }
        },
        {
            $project: {
                _id: 0,
                __v: 0
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const comments = await Comment.aggregatePaginate(commentAggregate, options);

    return successResponse(res, "Comments fetched successfully", comments);
});

const getTweetComments = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(tweetId)) {
        return errorResponse(res, "Invalid Tweet ID", 400);
    }

    const commentAggregate = Comment.aggregate([
        {
            $match: {
                tweet: new mongoose.Types.ObjectId(tweetId),
            },
        },
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
                            id: "$_id",
                            _id: 0
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
        {
            $addFields: {
                id: "$_id"
            }
        },
        {
            $project: {
                _id: 0,
                __v: 0
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const comments = await Comment.aggregatePaginate(commentAggregate, options);

    return successResponse(res, "Comments fetched successfully", comments);
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
        return errorResponse(res, "Invalid Video ID", 400);
    }

    if (!content) {
        return errorResponse(res, "Comment content is required", 400);
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id,
    });

    if (!comment) {
        return errorResponse(res, "Failed to add comment", 500);
    }

    return successResponse(res, "Comment added successfully", comment, 201);
});

const addTweetComment = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        return errorResponse(res, "Invalid Tweet ID", 400);
    }

    if (!content) {
        return errorResponse(res, "Comment content is required", 400);
    }

    const comment = await Comment.create({
        content,
        tweet: tweetId,
        owner: req.user?._id,
    });

    if (!comment) {
        return errorResponse(res, "Failed to add comment", 500);
    }

    return successResponse(res, "Comment added successfully", comment, 201);
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        return errorResponse(res, "Invalid Comment ID", 400);
    }

    if (!content) {
        return errorResponse(res, "Comment content is required", 400);
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return errorResponse(res, "Comment not found", 404);
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        return errorResponse(res, "Unauthorized request", 403);
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: { content },
        },
        { new: true }
    );

    return successResponse(res, "Comment updated successfully", updatedComment);
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        return errorResponse(res, "Invalid Comment ID", 400);
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return errorResponse(res, "Comment not found", 404);
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        return errorResponse(res, "Unauthorized request", 403);
    }

    await Comment.findByIdAndDelete(commentId);

    return successResponse(res, "Comment deleted successfully", {});
});

export { 
    getVideoComments, 
    getTweetComments,
    addComment, 
    addTweetComment,
    updateComment, 
    deleteComment 
};

