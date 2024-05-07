import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

// IMPORT ROUTES
import userRoute from "./routes/user.route.js";

// USING ROUTES
app.use("/api/v1/users",userRoute);

app.use(errorMiddleware);