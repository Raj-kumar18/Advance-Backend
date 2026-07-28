//combine all your route of application
//plugging all routes in one place 
import { Router } from "express";
import { healthRoute } from "./health.routes";
import { authRouter } from "./auth.routes";
import { userTaskRoute } from "./user.task.routes";


export const apiRouter = Router()


apiRouter.use("/health", healthRoute)
apiRouter.use("/api/auth", authRouter)
apiRouter.use("/api/task", userTaskRoute)