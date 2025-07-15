import express from "express";
import {
    addUserRating,
    getUserCourseProgress,
    getUserData,
    purchaseCourse,
    updateUserCourseProgress,
    userEnrolledCourses,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/data", getUserData);
router.get("/enrolled-courses", userEnrolledCourses);
router.post("/purchase", purchaseCourse);
router.post("/update-course-progress", updateUserCourseProgress);
router.post("/get-course-progress", getUserCourseProgress);
router.post("/add-rating", addUserRating);

export default router;
