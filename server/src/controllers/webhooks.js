import { Webhook } from "svix";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Stripe from "stripe";
import { Purchase } from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";

export const clerkWebhooks = asyncHandler(async (req, res) => {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const event=await whook.verify(req.body, {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
    });
    const { data, type } = event;
    switch (type) {
        case "user.created": {
            const userData = {
                _id: data.id,
                email: data.email_addresses[0].email_address,
                name: data.first_name + " " + data.last_name,
                imageUrl: data.image_url,
            };
            await User.create(userData);
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "User added."));
        }
        case "user.updated": {
            const userData = {
                email: data.email_address[0].email_address,
                name: data.first_name + " " + data.last_name,
                imageUrl: data.image_url,
            };
            await User.findByIdAndUpdate(data.id, userData);
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "User updated."));
        }
        case "user-deleted": {
            await User.findByIdAndDelete(data.id);
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "User deleted."));
        }
        default:
            break;
    }
});

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = asyncHandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = Stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });
            const { purchaseId } = session.data[0].metadata;
            const purchaseData = await Purchase.findById(purchaseId);
            const userData = await User.findById(purchaseData.userId);
            const courseData = await Course.findById(
                purchaseData.courseId.toString()
            );
            courseData.enrolledStudents.push(userData);
            await courseData.save();
            userData.enrolledCourses.push(courseData._id);
            await userData.save();
            purchaseData.status = "completed";
            await purchaseData.save();
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });
            const { purchaseId } = session.data[0].metadata;
            const purchaseData = await Purchase.findById(purchaseId);
            purchaseData.status = "failed";
            await purchaseData.save();
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    return res.status(200).json(new ApiResponse(200, { recieved: true }));
});
