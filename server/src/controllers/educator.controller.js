import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { clerkClient } from "@clerk/express";
import { Course } from "../models/course.medel.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Purchase } from "../models/purchase.model.js";
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
        throw new ApiError(502, "Error while uploading on course thumbnail");
    const parsedCourseData = await JSON.parse(courseData);
    parsedCourseData.educator = educatorId;
    parsedCourseData.courseThumbnail = courseThumbnail.secure_url;
    const newCourse = await Course.create(parsedCourseData);
    if (!newCourse) throw new ApiError(500, "Error while creating course");
    return res
        .status(201)
        .json(new ApiResponse(201, newCourse, "Course added"));
});

export const getEducatorCourses = asyncHandler(async (req, res) => {
    const educatorId = req.auth().userId;
    const courses = await Course.find({ educator: educatorId });
    return res
        .status(200)
        .json(new ApiResponse(200, courses, "Fetched all courses"));
});

export const educatorDashboardData = asyncHandler(async (req, res) => {
    const educatorId = req.auth().userId;
    const courses = await Course.find({ educator: educatorId });
    const totalCourses = courses.length;
    const courseIds = courses.map((course) => course._id);
    const purchases = await Purchase.find({
        courseId: {
            $in: courseIds,
        },
        status: "completed",
    });
    const totalEarnings = purchases.reduce(
        (sum, purchase) => sum + purchase.amount,
        0
    );
    const enrolledStudentsData = [];
    for (const course of courses) {
        const students = await User.find(
            {
                _id: { $in: course.enrolledStudents },
            },
            "name imageUrl"
        );
        students.forEach((student) => {
            enrolledStudentsData.push({
                courseTitle: course.courseTitle,
                student,
            });
        });
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                dashboardData: {
                    totalEarnings,
                    enrolledStudentsData,
                    totalCourses,
                },
            },
            "Fetched enrolled students data"
        )
    );
});

export const getEnrolledStudentsData = asyncHandler(async (req, res) => {
    const educatorId = req.auth().userId;
    const courses = await Course.find({ educator: educatorId });
    const courseIds = courses.map((course) => course._id);
    const purchases = await Purchase.find({
        courseId: { $in: courseIds },
        status: "completed",
    })
        .populate("userId", "name", "imageUrl")
        .populate("courseId", "courseTitle");
    const enrolledStudents = purchases.map((purchase) => ({
        student: purchase.userId,
        courseTitle: purchase.courseId.courseTitle,
        purchaseDate: purchase.createdAt,
    }));
    return res
        .status(200)
        .json(200, enrolledStudents, "Fetched enrolled students");
});
