import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { clerkClient } from "@clerk/express";
import { Course } from "../models/course.medel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
export const updateRoleToEducator = asyncHandler(async (req, res) => {
    const { userId } = req.auth();
    await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
            role: "educator",
        },
    });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "You can publish a course now"));
});

export const addCourse = asyncHandler(async (req, res) => {
    const { courseData } = req.body;
    if (!courseData) throw new ApiError(400, "Course Data is required");
    const imageFilePath = req.file?.path;
    if (!imageFilePath) throw new ApiError(400, "Thumbnail Image is required");
    const educatorId = req.auth().userId;
    const courseThumbnail = await uploadOnCloudinary(imageFilePath);
    if (!courseThumbnail)
        throw new ApiError(
            502,
            "Error while uploading on course thumbnail"
        );
    const parsedCourseData = await JSON.parse(courseData);
    parsedCourseData.educator = educatorId;
    parsedCourseData.courseThumbnail = courseThumbnail.secure_url;
    const newCourse = await Course.create(parsedCourseData);
    if (!newCourse) throw new ApiError(500, "Error while creating course");
    return res
        .status(201)
        .json(new ApiResponse(201, newCourse, "Course added"));
});

