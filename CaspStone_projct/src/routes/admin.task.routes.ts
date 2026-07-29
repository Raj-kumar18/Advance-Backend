import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { getAdmintask, updateAdminTaskStatus } from "../services/admin.task.service";


export const adminTaskRouter = Router()

adminTaskRouter.use(authentication, requireAdmin)
adminTaskRouter.get("/", async (req, res, next) => {
    try {
        const data = await getAdmintask(req.query)

        res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        next(error)
    }
})


adminTaskRouter.patch("/:taskId/status", async (req, res, next) => {
    try {
        const { taskId } = req.params
        const task = await updateAdminTaskStatus(taskId, req.body.status)

        res.status(200).json({
            success: true,
            data: { task }
        })
    } catch (error) {
        next(error)
    }
})


