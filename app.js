import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./src/router/auth.js";
import jobsRouter from "./src/router/jobs.js";
import authLimiter from "./src/middleware/rateLimiter.js";
import pgClient from "./src/db/pg.js";
import { initializeDB } from "./src/db/initDB.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});
export { io };

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "src/public")));

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "src/public/home.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "src/public/dashboard.html"));
});

app.use("/", authLimiter, authRouter);
app.use("/api/v1/jobs", jobsRouter);


io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("jobStatusUpdated", (data) => {
    io.emit("jobStatusUpdated", data);
  });
});

pgClient.connect()
  .then(async () => {
    console.log("Connected to PostgreSQL");
    await initializeDB();
  })
  .catch(err => console.error("PostgreSQL connection error:", err));

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
