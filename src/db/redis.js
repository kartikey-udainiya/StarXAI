import { Redis } from "ioredis";
import dotenv from "dotenv";
    
dotenv.config();

export const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const redisClient = new Redis(redisConnection);
