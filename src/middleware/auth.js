import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.token = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).send({ success: false, message: "Invalid or expired token" });
    }
};
