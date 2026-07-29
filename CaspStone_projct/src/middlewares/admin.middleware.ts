import { NextFunction, Request, Response } from "express";
import { AppError } from "../error/AppError";


export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {

    if (!req.user) {
        next(new AppError(401, "Unauthorized"))
        return
    }

    if (req.user.role != "ADMIN") {
        next(new AppError(403, "Forbidden"))
        return
    }
    next()

}