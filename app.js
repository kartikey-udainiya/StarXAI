import express from "express";
import http from "http"; 
import { Server } from "socket.io";
import dotenv from "dotenv";
import authRouter from "./src/router/auth.js";
import jobsRouter from "./src/router/jobs.js";
import cors from "cors";
import authLimiter from "./src/middleware/rateLimiter.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

export { io };

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());


// app.use("/api/auth", authLimiter, authRouter);
app.use("/api", authRouter);
app.use("/api/v1/jobs", jobsRouter);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("jobStatusUpdated", (data) => {
    io.emit("jobStatusUpdated", data); 
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
