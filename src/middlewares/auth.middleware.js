import { errorResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  // ku k jb coookies send ho gai hain req.body k pass ab udhr se len ge

  try {
    // token lo
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", ""); // Bearer space converted into empty string
    console.log(token);
    if (!token) {
      return errorResponse(res, "Unauthorized Request", 401);
    }

    // agar token ha

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // token ko verify kro aur decode kro lekin decode whi kr paye ga jis k pass secret ha
    console.log(decodedToken);
    const user = await User.findById(decodedToken?._id).select(
      // agr token ha mil gya ha to user mil jay ga  // ye _id models se araha
      " -password -refreshToken"
    );
    console.log(user);
    // agr usr ni ha

    if (!user) {
      // Next Video Todo discuss about frontened

      return errorResponse(res, "Invalid Access Token", 401);
    }

    // Agar user ha he ha

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, error?.message || "Invalid Access Token", 401);
  }
});
