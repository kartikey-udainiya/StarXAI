import express from "express";
import auth from "../controller/auth.js";

const authRouter = express.Router();

authRouter.post("/register", auth.register);
authRouter.post("/login", auth.login);

export default authRouter;
