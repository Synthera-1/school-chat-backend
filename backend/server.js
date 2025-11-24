import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from "socket.io";
import http from "http";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import Message from "./models/Message.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

// Socket.io chat
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("sendMessage", async (data) => {
    const msg = await Message.create(data);
    io.emit("newMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to DB");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log("Server running on " + PORT));
  })
  .catch(err => console.log(err));
