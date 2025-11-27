import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

// the upper code is the resolution beacuse the jobWorker.js was not able to load .env file 
// hence i have to manually provide the path of it.

import { Worker } from "bullmq";
import pgClient from "../db/pg.js";
import { redisConnection } from "../db/redis.js";
import { io as ClientIO } from "socket.io-client";
console.log("PGHOST from worker:", process.env.PGHOST);

const socket = ClientIO("http://localhost:3000");

socket.on("connect", () => {
  console.log("Worker connected to Socket.IO server with id:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Socket.IO connection error in worker:", err.message);
});

const delays = {
  1: [15000, 25000], // Low: 15–25 sec
  2: [8000, 12000],  // Medium: 8–12 sec
  3: [3000, 5000],   // High: 3–5 sec
};

const jobWorker = new Worker(
  "job-processing",
  async (job) => {
    const { jobId, priority } = job.data;

    // Update status to processing in DB
    await pgClient.query(
      "UPDATE jobs SET status = 'processing' WHERE id = $1",
      [jobId]
    );

    // Emit status change to all connected clients
    socket.emit("jobStatusUpdated", {
      jobId,
      status: "processing",
    });

    const [min, max] = delays[priority] || delays[1];
    const duration = Math.floor(Math.random() * (max - min) + min);

    console.log(`Processing job ${jobId} for ${duration}ms...`);

    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, duration));

    return `Completed in ${duration}ms`;
  },
  { connection: redisConnection }
);

jobWorker.on("completed", async (job, result) => {
  const { jobId } = job.data;

  const updateResult = await pgClient.query(
    `UPDATE jobs 
     SET status = 'completed', completed_at = NOW() 
     WHERE id = $1
     RETURNING completed_at`,
    [jobId]
  );

  const completedAt = updateResult.rows[0]?.completed_at || null;

  socket.emit("jobStatusUpdated", {
    jobId,
    status: "completed",
    completedAt,
  });

  console.log(`Job ${jobId} finished:`, result);
});

console.log("Worker started: Listening for jobs...");
jobWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});