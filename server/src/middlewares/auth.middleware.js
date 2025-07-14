import { clerkClient } from "@clerk/express";
import { ApiError } from "../utils/ApiError.js";

export const protectEducator = async (req,_,next) => {
    try {
        const {userId} = req.auth()
        const response = await clerkClient.users.getUser(userId);
        if(!response) throw new ApiError(404,"No user found");
        if(response.publicMetadata?.role!=="educator"){
            throw new ApiError(400,"Unauthorized Access");
        }
        next()
    } catch (error) {
        
    }
}