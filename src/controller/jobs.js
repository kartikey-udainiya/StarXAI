import pgClient from "../db/pg.js";
import { jobQueue } from "../queue/jobQueue.js";
import { io } from "../../app.js";
import { createJobSchema } from "../validation/jobsValidations.js";
import {redisClient} from "../db/redis.js";
import { CACHE_TTL, redisKeys } from "../db/redisKeys.js";

const jobs = {
  getAllJobs: async (req, res) => {
    try {
      const userId = req.token.userId;

      // check if jobs list is cached in redis
      const cachedJobs = await redisClient.get(redisKeys.listJobs(userId));
      if (cachedJobs) {
        return res
          .status(200)
          .send({ success: true, jobs: JSON.parse(cachedJobs) });
      }

      const result = await pgClient.query(
        "SELECT id, title, priority, status FROM jobs WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      result.rows.forEach((row) => {
        if (row.priority === 1) {
          row.priority = "low";
        } else if (row.priority === 2) {
          row.priority = "medium";
        } else if (row.priority === 3) {
          row.priority = "high";
        }
      });
      await redisClient.setex(redisKeys.listJobs(userId), CACHE_TTL.JOB_LIST, JSON.stringify(result.rows));

      return res.status(200).send({ success: true, jobs: result.rows || [] });
    } catch (error) {
      res.status(500).send({ success: false, message: "Server error" });
    }
  },

  getJobById: async (req, res) => {
    try {
      const userId = req.token.userId;
      const jobId = req.params.id;

      if (!jobId) {
        return res
          .status(400)
          .send({ success: false, message: "Job ID is required" });
      }

      const cachedJob = await redisClient.get(redisKeys.JobById(userId, jobId));
      if (cachedJob) {
        return res
          .status(200)
          .send({ success: true, job: JSON.parse(cachedJob) });
      }

      const result = await pgClient.query(
        "SELECT * FROM jobs WHERE id = $1 AND user_id = $2",
        [jobId, userId]
      );

      result.rows.forEach((row) => {
        if (row.priority === 1) {
          row.priority = "Low";
        } else if (row.priority === 2) {
          row.priority = "Medium";
        } else if (row.priority === 3) {
          row.priority = "High";
        }
      });

      await redisClient.setex(redisKeys.JobById(userId, jobId), CACHE_TTL.JOB_DETAILS, JSON.stringify(result.rows[0]));

      if (result.rows.length === 0)
        return res
          .status(404)
          .send({ success: false, message: "Job not found" });

      res.status(200).send({ success: true, job: result.rows[0] });
    } catch (error) {
      res.status(500).send({ success: false, message: "Server error" });
    }
  },

  createJob: async (req, res) => {
    try {
      const { title, description, priority } = req.body;
      const userId = req.token.userId;

      const { error } = createJobSchema.validate({ title, description, priority });
      if (error) {
        return res.status(400).send({ success: false, message: error.details[0].message });
      }

      //delete cached jobs list for the user
      await redisClient.del(redisKeys.listJobs(userId));

      const result = await pgClient.query(
        `INSERT INTO jobs (user_id, title, description, priority, status)
                 VALUES ($1, $2, $3, $4, 'pending')
                 RETURNING *`,
        [userId, title, description || "", priority || 1]
      );

      const newJob = result.rows[0];
      io.emit("jobStatusUpdated", {
        jobId: newJob.id,
        status: newJob.status,
      });

      await jobQueue.add(
        "job-processing",
        { jobId: newJob.id, priority: newJob.priority },
        {
          priority: newJob.priority === 3 ? 0 : newJob.priority === 2 ? 5 : 10,
        }
      );

      res.status(201).send({ success: true, job: newJob });
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).send({ success: false, message: "Server error" });
    }
  },
};

export default jobs;
