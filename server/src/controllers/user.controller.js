import { Course } from "../models/course.model.js";
import { Purchase } from "../models/purchase.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Stripe} from "stripe"
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
    if(!newPurchase) throw new ApiError(500,"Error while purchasing course");
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency=process.env.CURRENCY.toLowerCase();
    const line_items = [
        {
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle,
                },
                unit_amount: Math.floor(newPurchase.amount)*100,
            },
            quantity:1
        },
    ];
    const session=await stripeInstance.checkout.sessions.create({
        success_url:`${origin}/loading/my-enrollments`,
        cancel_url:`${origin}/`,
        line_items:line_items,
        mode:"payment",
        metadata:{
            purchaseId:newPurchase._id.toString()
        }
    })
    return res.status(200).json(new ApiResponse(200,{session_url:session.url},"Purchased successfully"))
});
