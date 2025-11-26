import pgClient from "../db/pg.js";

const jobs = {
    getAllJobs: async (req, res) => {
        try {
            const userId = req.token.userId;
            const result = await pgClient.query(
                "SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC",
                [userId]
            );
            if (result.rows.length === 0) {
                return res.status(200).send({ success: true, jobs: [] });
            }
            res.status(200).send({ success: true, jobs: result.rows });
        } catch (error) {
            console.error("Error fetching jobs:", error);
            res.status(500).send({ success: false, message: "Server error" });
        }
    },

    getJobById: async (req, res) => {
        try {
            const jobId = req.params.id;
            const userId = req.token.userId
            const result = await pgClient.query(
                "SELECT * FROM jobs WHERE id = $1 AND user_id = $2",
                [jobId, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).send({ success: false, message: "Job not found" });
            }

            res.status(200).send({ success: true, job: result.rows[0] });

        } catch (error) {
            console.error("Error fetching job:", error);
            res.status(500).send({ success: false, message: "Server error" });
        }
    },

    createJob: async (req, res) => {
        try {
            const { title, description, priority, status } = req.body;
            const userId = req.token.userId;

            if (!title) {
                return res.status(400).send({ success: false, message: "Title is required" });
            }

            const result = await pgClient.query(
                `INSERT INTO jobs (user_id, title, description, priority, status)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [userId, title, description || "", priority || 1, status || "pending"]
            );

            res.status(201).send({ success: true, job: result.rows[0] });

        } catch (error) {
            console.error("Error creating job:", error);
            res.status(500).send({ success: false, message: "Server error" });
        }
    },
};

export default jobs;
