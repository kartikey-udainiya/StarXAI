import pg from "pg";
import dotenv from "dotenv";

//clea

dotenv.config();


const { Pool } = pg;
const pool = new Pool({
  user: process.env.PG_USER, // Must match pgAdmin user
  host: process.env.PG_HOST, // Must match pgAdmin host
  database: process.env.PG_DATABASE, // Must match pgAdmin database
  password: process.env.PG_PASSWORD, // Must match pgAdmin password
  port: process.env.PG_PORT, // Must match pgAdmin port
});

const pgClient = pool;

export default pgClient;