import express from "express";
import { login, register, verifyEmail } from "../controllers/user.controller.js";
const router = express.Router();


router.route("/register").post(register);
router.route("/:id/verify/:token").post(verifyEmail);
router.route("/login").post(login);


export default router;