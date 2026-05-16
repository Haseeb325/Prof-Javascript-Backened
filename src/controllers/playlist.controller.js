import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return errorResponse(res, "Name and description are required", 400);
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
        videos: [],
    });

    if (!playlist) {
        return errorResponse(res, "Failed to create playlist", 500);
    }

    return successResponse(res, "Playlist created successfully", playlist, 201);
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        return errorResponse(res, "Invalid User ID", 400);
    }

    const playlists = await Playlist.find({ owner: userId });

    return successResponse(res, "User playlists fetched successfully", playlists);
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        return errorResponse(res, "Invalid Playlist ID", 400);
    }

    const playlist = await Playlist.findById(playlistId).populate("videos");

    if (!playlist) {
        return errorResponse(res, "Playlist not found", 404);
    }

    return successResponse(res, "Playlist fetched successfully", playlist);
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        return errorResponse(res, "Invalid Playlist or Video ID", 400);
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        return errorResponse(res, "Playlist not found", 404);
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        return errorResponse(res, "Unauthorized request", 403);
    }

    if (playlist.videos.includes(videoId)) {
        return errorResponse(res, "Video already in playlist", 400);
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return successResponse(res, "Video added to playlist successfully", playlist);
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        return errorResponse(res, "Invalid Playlist or Video ID", 400);
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        return errorResponse(res, "Playlist not found", 404);
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        return errorResponse(res, "Unauthorized request", 403);
    }

    playlist.videos = playlist.videos.filter((v) => v.toString() !== videoId);
    await playlist.save();

    return successResponse(res, "Video removed from playlist successfully", playlist);
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        return errorResponse(res, "Invalid Playlist ID", 400);
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        return errorResponse(res, "Playlist not found", 404);
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        return errorResponse(res, "Unauthorized request", 403);
    }

    await Playlist.findByIdAndDelete(playlistId);

    return successResponse(res, "Playlist deleted successfully", {});
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        return errorResponse(res, "Invalid Playlist ID", 400);
    }

    if (!name || !description) {
        return errorResponse(res, "Name and description are required", 400);
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        return errorResponse(res, "Playlist not found", 404);
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        return errorResponse(res, "Unauthorized request", 403);
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: { name, description },
        },
        { new: true }
    );

    return successResponse(res, "Playlist updated successfully", updatedPlaylist);
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
