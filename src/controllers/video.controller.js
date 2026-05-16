import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pipeline = [];

    // Filter by query (title or description)
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ],
            },
        });
    }

    // Filter by userId
    if (userId) {
        if (!isValidObjectId(userId)) {
            return errorResponse(res, "Invalid User ID", 400);
        }
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        });
    }

    // SECURITY CHECK: Handle Publication Status
    // If we are looking at someone else's videos (or just browsing the feed),
    // we should only see published videos.
    // If userId matches the logged-in user, we can see both.
    if (userId?.toString() !== req.user?._id.toString()) {
        pipeline.push({
            $match: {
                isPublished: true,
            },
        });
    }

    // Sort
    const sortDir = sortType === "asc" ? 1 : -1;
    pipeline.push({
        $sort: {
            [sortBy || "createdAt"]: sortDir,
        },
    });


    // Map _id to id and remove _id for professional response
    pipeline.push({
        $addFields: {
            id: "$_id"
        }
    }, {
        $project: {
            _id: 0,
            __v: 0
        }
    });

    const videoAggregate = Video.aggregate(pipeline);



    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const videos = await Video.aggregatePaginate(videoAggregate, options);

    return successResponse(res, "Videos fetched successfully", videos);
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if ([title, description].some((field) => field?.trim() === "")) {
        return errorResponse(res, "Title and description are required", 400);
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath) {
        return errorResponse(res, "Video file is required", 400);
    }

    if (!thumbnailLocalPath) {
        return errorResponse(res, "Thumbnail is required", 400);
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        return errorResponse(res, "Video upload failed", 500);
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail?.url || "",
        title,
        description,
        duration: videoFile.duration,
        owner: req.user?._id,
        isPublished: true,
    });

    return successResponse(res, "Video published successfully", video, 201);
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        return errorResponse(res, "Invalid Video ID", 400);
    }

    const video = await Video.findById(videoId).populate("owner", "fullName username avatar");

    if (!video) {
        return errorResponse(res, "Video not found", 404);
    }

    return successResponse(res, "Video fetched successfully", video);
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;

    if (!isValidObjectId(videoId)) {
        return errorResponse(res, "Invalid Video ID", 400);
    }

    if (!title && !description && !thumbnailLocalPath) {
        return errorResponse(res, "At least one field is required for update", 400);
    }

    const video = await Video.findById(videoId);

    if (!video) {
        return errorResponse(res, "Video not found", 404);
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        return errorResponse(res, "Unauthorized request", 403);
    }

    let thumbnail;
    if (thumbnailLocalPath) {
        const uploadResponse = await uploadOnCloudinary(thumbnailLocalPath);
        if (uploadResponse) {
            thumbnail = uploadResponse.url;
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description,
                thumbnail: thumbnail || video.thumbnail,
            },
        },
        { new: true }
    );

    return successResponse(res, "Video updated successfully", updatedVideo);
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        return errorResponse(res, "Invalid Video ID", 400);
    }

    const video = await Video.findById(videoId);

    if (!video) {
        return errorResponse(res, "Video not found", 404);
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        return errorResponse(res, "Unauthorized request", 403);
    }

    await Video.findByIdAndDelete(videoId);

    // Note: Ideally, we should also delete the video/thumbnail from Cloudinary here

    return successResponse(res, "Video deleted successfully", {});
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        return errorResponse(res, "Invalid Video ID", 400);
    }

    const video = await Video.findById(videoId);

    if (!video) {
        return errorResponse(res, "Video not found", 404);
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        return errorResponse(res, "Unauthorized request", 403);
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished,
            },
        },
        { new: true }
    );

    return successResponse(res, "Publish status toggled successfully", {
        isPublished: updatedVideo.isPublished,
    });
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
