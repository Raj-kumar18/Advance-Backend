//combine all your route of application
//plugging all routes in one place 
import { Router } from "express";
import { healthRoute } from "./health.routes";
import { authRouter } from "./auth.routes";
import { userTaskRoute } from "./user.task.routes";
import { adminTaskRouter } from "./admin.task.routes";
import { adminBannerRouter } from "./admin.banner.routes";


export const apiRouter = Router()


apiRouter.use("/health", healthRoute)
apiRouter.use("/auth", authRouter)
apiRouter.use("/task", userTaskRoute)
apiRouter.use("/adminTask", adminTaskRouter)
apiRouter.use("/admin/banners", adminBannerRouter)