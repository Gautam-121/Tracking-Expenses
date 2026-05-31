import express from "express";
import sequelize from "../config/database.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import HttpStatusCode from "../utils/HttpStatusCode.js";

const router = express.Router();

// GET /api/health
router.get("/", async (req, res, next) => {
  const start = Date.now();
  try {
    await sequelize.authenticate();
    res.status(HttpStatusCode.OK).json(
      new ApiResponse(HttpStatusCode.OK, {
        db: "connected",
        uptime: process.uptime(),
        responseTime: `${Date.now() - start}ms`,
        timestamp: new Date().toISOString(),
      }, "Service is healthy")
    );
  } catch (error) {
    next(
      new ApiError(
        HttpStatusCode.SERVICE_UNAVAILABLE,
        "Database connection failed",
        [error.message]
      )
    );
  }
});





export default router;