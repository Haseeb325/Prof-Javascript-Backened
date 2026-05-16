import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const healthcheck = asyncHandler(async (req, res) => {
    return successResponse(res, "Server is healthy", { status: "OK" });
});

export { healthcheck };
