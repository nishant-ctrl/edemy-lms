import express from "express"
import { updateRoleToEducator } from "../controllers/educator.controller.js";


const router=express.Router()

router.get("/update-role",updateRoleToEducator);

export default router