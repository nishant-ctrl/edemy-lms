import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { clerkWebhooks } from "./controllers/webhooks.js"
import educatorRouter from "./routes/educator.route.js"
import { clerkMiddleware } from "@clerk/express"
import { errorHandler } from "./middlewares/error.middleware.js"

dotenv.config({
    path:"./.env"
})
const port=process.env.PORT || 5000
const app=express()

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(clerkMiddleware())
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.send("Working");
})
app.post("/clerk",clerkWebhooks)
app.use("/api/educator",educatorRouter)
app.use(errorHandler);
connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERR: ", error);
            throw error;
        });
        app.listen(port, () => {
            console.log(`Server is running at port: ${port}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connecton failed : ", err);
    });