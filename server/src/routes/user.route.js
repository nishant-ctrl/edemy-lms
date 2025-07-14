import express from "express";
import { getUserData, purchaseCourse, userEnrolledCourses } from "../controllers/user.controller.js";


const router = express.Router();

router.get("/data",getUserData)
router.get("/enrolled-courses",userEnrolledCourses)
router.post("/purchase", purchaseCourse);

export default router;
