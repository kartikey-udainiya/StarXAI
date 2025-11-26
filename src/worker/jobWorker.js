import { Worker } from "bullmq";
import pgClient from "../db/pg.js";
import { redisConnection } from "../db/redis.js";


const delays = {
  1: [15000, 25000], // Low: 15–25 sec
  2: [8000, 12000], // Medium: 8–12 sec
  3: [3000, 5000], // High: 3–5 sec
};

const jobWorker = new Worker(
  "job-processing",
  async (job) => {
    const { jobId, priority } = job.data;

    // Update status to processing
    console.log(jobId, priority);
    await pgClient.query(

      "UPDATE jobs SET status = 'processing' WHERE id = $1",
      [jobId]
    );

    const [min, max] = delays[priority] || delays[1];
    const duration = Math.floor(Math.random() * (max - min) + min);

    console.log(`Processing job ${jobId} for ${duration}ms...`);
    
    await new Promise((resolve) => setTimeout(resolve, duration));
    
    return `Completed in ${duration}ms`;
  },
  { connection: redisConnection }
);

jobWorker.on("completed", async (job, result) => {
  const { jobId } = job.data;

  await pgClient.query(
    `UPDATE jobs 
     SET status = 'completed', completed_at = NOW() 
     WHERE id = $1`,
    [jobId]
  );

  console.log(`Job ${jobId} finished:`, result);
});

console.log("Worker started: Listening for jobs...");
