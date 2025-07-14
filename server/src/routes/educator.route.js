import express from "express";
import {
    addCourse,
    educatorDashboardData,
    getEducatorCourses,
    getEnrolledStudentsData,
    updateRoleToEducator,
} from "../controllers/educator.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { protectEducator } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/update-role", updateRoleToEducator);
router.post("/add-course", protectEducator, upload.single("image"), addCourse);
router.get("/courses", protectEducator, getEducatorCourses);
router.get("/dashboard", protectEducator, educatorDashboardData);
router.get("/enrolled-students", protectEducator, getEnrolledStudentsData);
export default router;
