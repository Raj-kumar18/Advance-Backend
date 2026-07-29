import { Router } from "express";


export const healthRoute = Router()


healthRoute.get("/", async (_req, res) => {
    res.status(200).json({
        success: true,
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});