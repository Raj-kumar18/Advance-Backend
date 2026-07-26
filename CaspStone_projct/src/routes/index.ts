//combine all your route of application
//plugging all routes in one place 
import { Router } from "express";
import { healthRoute } from "./health.routes";
import { authRouter } from "./auth.routes";


export const apiRouter = Router()


apiRouter.use("/api/auth", authRouter)
apiRouter.use("/health", healthRoute)