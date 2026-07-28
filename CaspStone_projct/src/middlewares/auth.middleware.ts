import { NextFunction, Request, Response } from "express";
import { AppError } from "../error/AppError";
import { verifyAccessToken } from "../lib/jwt";
export function authentication(
    req: Request,
    _res: Response,
    next: NextFunction
): void {

    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        next(new AppError(401, "No token provided"))
        return
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
        next(new AppError(401, "No token provided"))
        return
    }

    try {
        req.user = verifyAccessToken(token)
    } catch (error) {
        next(error)
        return
    }

    next()

}