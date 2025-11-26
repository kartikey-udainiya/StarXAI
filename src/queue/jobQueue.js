import { Queue } from "bullmq";
import { redisConnection } from "../db/redis.js";  

export const jobQueue = new Queue("job-processing", {
  connection: redisConnection,
});
