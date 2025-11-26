import pgClient from '../db/pg.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';

const auth = {
    register: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            const userCheck = await pgClient.query("SELECT * FROM users WHERE email = $1", [email]);
            if (userCheck.rows.length > 0) {
                return res.status(400).send({ success: false, message: "User already exists" });
            }
             
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pgClient.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id", [email, hashedPassword]);
            const userId = result.rows[0].id;
            console.log("User registered with ID:", userId);

            res.status(201).send({ success: true, message: "User registered successfully" });
        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).send({ success: false, message: "Server error" });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log("Logging in user:", email);
            const userResult = await pgClient.query("SELECT * FROM users WHERE email = $1", [email]);
            if (userResult.rows.length === 0) {
                return res.status(400).send({ success: false, message: "Invalid email or password" });
            }

            const user = userResult.rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
                return res.status(400).send({ success: false, message: "Invalid email or password" });
            }
    
            const token = generateToken({userId: user.id, email: user.email});
            res.status(200).send({ success: true, token: `Bearer ${token}` });
        } catch (error) {
            console.error("Error logging in user:", error);
            res.status(500).send({ success: false, message: "Server error" });
        }
    }
}

export default auth;
