import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";
import { Purchase } from "../models/purchase.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Stripe } from "stripe";
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

export const purchaseCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const { userId } = req.auth();
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);
    if (!userData || !courseData) throw new ApiError(400, "Data not found");
    const purchaseData = {
        courseId: courseData._id,
        userId,
        amount: (
            courseData.coursePrice -
            (courseData.discount * courseData.coursePrice) / 100
        ).toFixed(2),
    };
    const newPurchase = await Purchase.create(purchaseData);
    if (!newPurchase) throw new ApiError(500, "Error while purchasing course");
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toLowerCase();
    const line_items = [
        {
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle,
                },
                unit_amount: Math.floor(newPurchase.amount) * 100,
            },
            quantity: 1,
        },
    ];
    const session = await stripeInstance.checkout.sessions.create({
        success_url: `${origin}/loading/my-enrollments`,
        cancel_url: `${origin}/`,
        line_items: line_items,
        mode: "payment",
        metadata: {
            purchaseId: newPurchase._id.toString(),
        },
    });
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { session_url: session.url },
                "Purchased successfully"
            )
        );
});

export const updateUserCourseProgress = asyncHandler(async (req, res) => {
    const { userId } = req.auth();
    const { courseId, lectureId } = req.body;
    const progressData = await CourseProgress.findOne({ userId, courseId });
    if (progressData) {
        if (progressData.lectureCompleted.includes(lectureId)) {
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "Lecture already completed."));
        }
        progressData.lectureCompleted.push(lectureId);
        await progressData.save();
    } else {
        await CourseProgress.create({
            userId,
            courseId,
            lectureCompleted: [lectureId],
        });
    }
    return res.status(200).json(new ApiResponse(200, {}, "Progress updated"));
});

export const getUserCourseProgress = asyncHandler(async (req, res) => {
    const { userId } = req.auth();
    const { courseId } = req.body;
    const progressData = await CourseProgress.findOne({ userId, courseId });
    return res
        .status(200)
        .json(
            new ApiResponse(200, progressData, "Fetched course progress data")
        );
});

export const addUserRating = asyncHandler(async (req, res) => {
    const { userId } = req.auth();
    const { courseId, rating } = req.body;
    if (!userId || !courseId || rating || rating < 1 || rating > 5) {
        throw new ApiError(
            400,
            "UserId , CourseId and valid rating are required"
        );
    }
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, "Course Not Found");
    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
        throw new ApiError(404, "User has not purchased course");
    }
    const existingRatingIndex = course.courseRatings.findIndex(
        (r) => r.userId === userId
    );
    if (existingRatingIndex > -1) {
        course.courseRatings[existingRatingIndex].rating = rating;
    } else {
        course.courseRatings.push({
            userId,
            rating,
        });
    }
    await course.save();
    return res.status(200).json(new ApiResponse(200, {}, "Rating added"));
});
