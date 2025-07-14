import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clerkClient } from "@clerk/express";
export const updateRoleToEducator = asyncHandler(async (req, res) => {
    const {userId} = req.auth();
    await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
            role: "educator",
        },
    });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "You can publish a course now"));
});
