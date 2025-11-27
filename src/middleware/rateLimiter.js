import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: {
    success: false,
    message: "Too many attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
export default authLimiter;