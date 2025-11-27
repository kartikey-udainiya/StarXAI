import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { Worker } from "bullmq";
import pgClient from "../db/pg.js";
import { redisClient, redisConnection } from "../db/redis.js";
import { io as ClientIO } from "socket.io-client";
import { redisKeys } from "../db/redisKeys.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

const socket = ClientIO(SERVER_URL, {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Worker connected → Socket.IO ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Socket.IO Worker Error:", err.message);
});

const delays = {
  1: [15000, 25000],
  2: [8000, 12000],
  3: [3000, 5000],
};

const jobWorker = new Worker(
  "job-processing",
  async (job) => {
    const { jobId, priority, userId } = job.data;

    await pgClient.query(
      "UPDATE jobs SET status = 'processing' WHERE id = $1",
      [jobId]
    );

    await redisClient.del(redisKeys.listJobs(userId));
    await redisClient.del(redisKeys.JobById(userId, jobId));

    socket.emit("jobStatusUpdateFromWorker", {
      jobId,
      status: "processing",
    });

    const [min, max] = delays[priority] || delays[1];
    const duration = Math.floor(Math.random() * (max - min) + min);

    console.log(`Processing ${jobId} (${priority}) in ${duration}ms`);

    await new Promise((resolve) => setTimeout(resolve, duration));

    return `Completed in ${duration}ms`;
  },
  { connection: redisConnection }
);

jobWorker.on("completed", async (job, result) => {
  const { jobId, userId } = job.data;

  const completedData = await pgClient.query(
    `UPDATE jobs SET status='completed', completed_at=NOW()
     WHERE id=$1 RETURNING completed_at`,
    [jobId]
  );

  const completedAt = completedData.rows[0]?.completed_at || null;

  await redisClient.del(redisKeys.listJobs(userId));
  await redisClient.del(redisKeys.JobById(userId, jobId));

  socket.emit("jobStatusUpdateFromWorker", {
    jobId,
    status: "completed",
    completedAt,
  });

  console.log(`Job ${jobId} completed `, result);
});

jobWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log("Worker running & queue listening…");
