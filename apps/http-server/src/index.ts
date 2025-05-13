import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import RoomRoute from "./routes/room";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/chat", RoomRoute);
app.listen(3001, () => {
  console.log("server is running on port 3001");
});
