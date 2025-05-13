import { CreateRoom } from "@repo/common/types";
import express, { Router } from "express";
import { middleware } from "../middleware";
import { prisma } from "@repo/DB/client";

const router: Router = express.Router();

router.post("/room", middleware, async (req, res) => {
  const parsedData = CreateRoom.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid inputs",
    });
    return;
  }

  // @ts-ignore
  const userId = req.userId;

  try {
    const newRoom = await prisma.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });

    res.status(201).json({
      message: "Room created successfully",
      room: newRoom,
    });
    return;
  } catch (error) {
    console.error("room creation error:", error);
    res.status(500).json({
      message: "room id exists",
    });
    return;
  }
});

router.get("/room/:id", async (req, res) => {
  const roomId = Number(req.params.id);
  try {
    const messages = await prisma.chat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        id: "asc",
      },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.log("error fetching messages", error);
    res.status(500).json({
      message: "Failed to fetch chats",
    });
  }
});

router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;

  try {
    const room = await prisma.room.findFirst({
      where: {
        slug,
      },
    });
    res.status(200).json({
      room,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "something went worng",
    });
  }
});
export default router;
