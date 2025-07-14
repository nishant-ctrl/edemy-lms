import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUserData = asyncHandler(async (req, res) => {
    const { userId } = req.auth();
    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, "User not found");
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched succesfully"));
});

export const userEnrolledCourses = asyncHandler(async (req, res) => {
    const { userId } = req.auth();
    const userData = await User.findById(userId).populate("enrolledCourses");
    if (!userData) throw new ApiError(400, "User not found");
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { enrolledCourses: userData.enrolledCourses },
                "Fetched user enrolled courses"
            )
        );
});
