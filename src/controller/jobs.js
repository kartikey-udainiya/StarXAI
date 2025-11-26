const jobs = {
    getAllJobs: async (req, res) => {
        try {
            const jobsList = await pgClient.query("SELECT * FROM jobs");
            res.status(200).send({ success: true, jobs: jobsList.rows });
        } catch (error) {
            console.error("Error fetching jobs:", error);
            res.status(500).send({ success: false, message: "Server error" });
        }
    } ,
    getJobById: async (req, res) => {
        try {
            const jobId = req.params.id;
            const job = { id: jobId, title: "Software Engineer", company: "Tech Corp", description: "Job description here" };
            res.status(200).send({ success: true, job });
        } catch (error) {
            console.error("Error fetching job:", error);
            res.status(500).send({ success: false, message: "Server error" });
        }
    }
}