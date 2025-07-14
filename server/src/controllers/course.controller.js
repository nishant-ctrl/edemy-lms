import { Course } from "../models/course.medel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({ isPublished: true })
        .select(["-courseContent", "-enrolledStudents"])
        .populate({ path: "educator" });
    return res
        .status(200)
        .json(new ApiResponse(200, courses, "Fetched all courses"));
});

export const getCourseById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, "Course Id is required");
    const courseData = await Course.findById(id).populate({ path: "educator" });
    courseData.courseContent.forEach((chapter) => {
        chapter.chapterContent.forEach((lecture) => {
            if (!lecture.isPreviewFree) {
                lecture.lectureUrl = "";
            }
        });
    });
    return res
        .status(200)
        .json(new ApiResponse(200, courseData, "Fetched course data"));
});
