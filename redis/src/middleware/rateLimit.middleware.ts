import client from "../redis/client";
import { Request, Response, NextFunction } from "express";
const RATE_LIMIT_WINDOW_SECONDS = 60
const RATE_LIMIT_MAX_REQUEST = 5

export async function productRateLimit(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {

        const ip = req.ip || "unknown_ip"
        const rateLimiterKey = `rate_limit:product:${ip}`

        const currentRequests = await client.incr(rateLimiterKey)

        if (currentRequests > RATE_LIMIT_MAX_REQUEST) {
            res.status(429).json({ error: "too many request try again later" })
            return
        }

        //after 60 second redis will deleter this key and start counting from fresh
        // Agar ye nayi window ki pehli request hai, tabhi 60 second ka timer start karo.
        if (currentRequests === 1) {
            await client.expire(rateLimiterKey, RATE_LIMIT_WINDOW_SECONDS)
        }

        const remainingRequests = Math.max(0, RATE_LIMIT_MAX_REQUEST - currentRequests)
        res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUEST)
        res.setHeader("X-RateLimit-Remaining", remainingRequests)

        const ttl = await client.ttl(rateLimiterKey)
        res.setHeader("X-RateLimit-Reset", ttl)

        next()

    } catch (error) {
        console.log("rate limit middleware", error)
        next(error)
    }
}