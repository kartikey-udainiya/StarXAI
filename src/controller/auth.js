import pgClient from '../db/pg.js';
const auth = {
    register: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log("Registering user:", email);
            // Here you would normally add code to save the user to the database
            const result = await pgClient.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id", [email, password]);
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
            res.status(200).send({ success: true, message: "User logged in successfully" });
        } catch (error) {
            console.error("Error logging in user:", error);
            res.status(500).send({ success: false, message: "Server error" });
        }
    }
}

export default auth;
