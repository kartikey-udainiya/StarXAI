import fs from "fs";
import path from "path";
import pgClient from "./pg.js";

const schemaPath = path.resolve("src/db/schema.sql");

export const initializeDB = async () => {
  try {
    const schema = fs.readFileSync(schemaPath, "utf8");
    await pgClient.query(schema);
    console.log("Database tables ensured.");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};