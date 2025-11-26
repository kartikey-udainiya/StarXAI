import express from "express";
import dotenv from "dotenv";
import router from "./src/router/auth.js";
import pgClient from "./src/db/pg.js";

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile("home.html", { root: "." });
});
app.use("/api", router);

pgClient.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Error connecting to PostgreSQL database:", err));  

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
