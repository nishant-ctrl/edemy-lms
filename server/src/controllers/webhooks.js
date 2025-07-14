import { Webhook } from "svix";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const clerkWebhooks = asyncHandler(async (req, res) => {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
    });
    const { data, type } = req.body;
    switch (type) {
        case "user.created": {
            const userData = {
                _id: data.id,
                email: data.email_address[0].email_address,
                name: data.firstName + " " + data.lastName,
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
                name: data.firstName + " " + data.lastName,
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
