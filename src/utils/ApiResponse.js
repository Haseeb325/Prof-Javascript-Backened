/**
 * @description Standardized success response helper
 */
export const successResponse = (res, message, data = null, status = 200) => {
    return res.status(status).json({
        status: "success",
        statusCode: status,
        message,
        data,
    });
};

/**
 * @description Standardized error response helper
 */
export const errorResponse = (res, message, status = 400) => {
    const err = new Error(message);
    err.status = status;
    return res.status(status).json({
        status: "error",
        statusCode: status,
        message,
        data: null,
    });
};
