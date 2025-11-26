import express from "express";
import dotenv from "dotenv";
import authRouter from "./src/router/auth.js";
import jobsRouter from "./src/router/jobs.js";
import pgClient from "./src/db/pg.js";
import cors from "cors";

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api", authRouter);
app.use("/api/v1/jobs", jobsRouter);

pgClient.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Error connecting to PostgreSQL database:", err));  

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
