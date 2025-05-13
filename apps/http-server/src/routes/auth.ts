import express, { Request, Router } from "express";
import { CreateUserSchema } from "@repo/common/types";
import { prisma } from "@repo/DB/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "../middleware";

const router: Router = express.Router();

router.post("/signup", async (req, res) => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid inputs" });
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parsed.data.password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "User created", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Missing credentials" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Signin successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/profile", middleware, async (req: Request, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(404).json({
      message: "Unauthorized",
    });
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    res.status(201).json({
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Could not fetch the profile",
    });
  }
});

router.put("/profile/update", middleware, async (req, res) => {
  const userId = req.userId;
  const { avatar, bio, email, id, location, name, website } = req.body;

  if (!userId) {
    res.status(404).json({
      message: "Unauthorized",
    });
  }
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        bio,
        name,
        portfolio: website,
        location,
        avatar,
        email,
      },
    });
    res.status(201).json({
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
    });
  }
});

export default router;
