import pg from "pg";
import dotenv from "dotenv";


dotenv.config();


const { Pool } = pg;
const pool = new Pool({
  user: process.env.PG_USER || "postgres",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "starX",
  password: process.env.PG_PASSWORD || "123456",
  port: process.env.PG_PORT || 1234,
});

const pgClient = pool;

export default pgClient;