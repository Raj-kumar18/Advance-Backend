import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";


// Ye sirf ek naming convention hai.

// Underscore (_) ka matlab hota hai:

// "Mujhe ye parameter receive karna zaroori hai, lekin main is function ke andar ise use nahi kar raha."

//agar req or next aise likhoge or use nhi korge to 
// TypeScript ya ESLint bolega:

// 'req' is declared but its value is never read.
// 'next' is declared but its value is never read.

// Ye warning hoti hai ki variable banaya hai par use nahi kiya.


export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    logger.error({ err }, "Unhandled error")

    res.status(500).json({
        success:false,
        message:"internal server error"
    })
}