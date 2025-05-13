import { Worker } from "bullmq";
import { connection } from "./chatQueue";
import { prisma } from "@repo/DB/client";

const worker = new Worker(
  "chat-messages",
  async (job) => {
    console.log("Processing job:", job.id);
    const { roomId, message, userId } = job.data;
    console.log("inside room", roomId, message, userId);
    await prisma.chat.create({
      data: {
        roomId,
        message,
        userId,
      },
    });
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Saved message job ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
