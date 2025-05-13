import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/DB/client";
import { chatQueue } from "./chatQueue";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

const users: User[] = [];

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Invalid token, please log in again.",
      })
    );
    ws.close();
    return;
  }

  const userId = decoded.userId;
  if (!userId) {
    ws.close();
    return;
  }

  const user: User = { userId, rooms: [], ws };
  users.push(user);

  ws.on("error", console.error);

  ws.on("message", async function message(data) {
    console.log("received: %s", data);
    const parsedData = JSON.parse(data as unknown as string);

    if (parsedData.type === "join_room") {
      user.rooms.push(parsedData.roomId);
      console.log(`${userId} joined room ${parsedData.roomId}`);
    }

    if (parsedData.type === "leave_room") {
      user.rooms = user.rooms.filter((x) => x !== parsedData.room);
      console.log(`${userId} left room ${parsedData.room}`);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      if (!message || message.trim() === "") {
        return;
      }

      try {
        console.log("Adding job to queue...");
        await chatQueue.add("chat-messages", {
          roomId,
          message,
          userId,
        });
        console.log("Job added to queue");

        const userData = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });

        const userName = userData?.name || "Unknown";

        users.forEach((u) => {
          if (
            u.rooms.includes(roomId) &&
            u.userId !== userId &&
            u.ws.readyState === WebSocket.OPEN
          ) {
            u.ws.send(
              JSON.stringify({
                type: "chat",
                message,
                roomId,
                userId,
                userName,
              })
            );
          }
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  });

  ws.on("close", () => {
    const userIndex = users.findIndex((user) => user.ws === ws);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
    }
    console.log(`${userId} disconnected`);
  });

  ws.send(
    JSON.stringify({
      type: "connection_ack",
      success: "Connected successfully",
    })
  );
});
