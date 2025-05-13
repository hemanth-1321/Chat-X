import dotenv from "dotenv";
dotenv.config();
import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis(process.env.REDIS_URL || "", {
  maxRetriesPerRequest: null,
});

export const chatQueue = new Queue("chat-messages", {
  connection,
});
