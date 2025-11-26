import express from "express";
import jobs from "../controller/jobs.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authenticateUser, jobs.createJob);
router.get("/list", authenticateUser, jobs.getAllJobs);
router.get("/:id", authenticateUser, jobs.getJobById);

export default router;