import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { AppError } from "../error/AppError";
import { createUserTask, deleteUserTask, getUserTaskById, getUserTasks, updateUserTask } from "../services/user.task.service";

export const userTaskRoute = Router()

userTaskRoute.use(authentication)
userTaskRoute.post("/", async (req, res, next) => {
    try {
        const task = await createUserTask(req.user!.userId, req.body.title)
        if (!task) {
            throw new AppError(400, "Task not created")
        }

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task
        })

    } catch (error) {
        next(error)
    }
})


userTaskRoute.get("/", async (req, res, next) => {
    try {
        const tasks = await getUserTasks(req.user!.userId)
        return res.status(200).json({
            success: true,
            message: "Tasks fetched successfully",
            data: tasks
        })

    } catch (error) {
        next(error)
    }
})


userTaskRoute.get("/:taskId", async (req, res, next) => {
    try {
        const { taskId } = req.params
        const task = await getUserTaskById(taskId, req.user!.userId)

        return res.status(200).json({
            success: true,
            message: "Task fetched successfully",
            data: { task }
        })
    } catch (error) {
        next(error)
    }
})

userTaskRoute.patch("/:taskId", async (req, res, next) => {
    try {
        const { taskId } = req.params
        const task = await updateUserTask(taskId, req.user!.userId, req.body.title)

        if (!task) {
            throw new AppError(404, "Task not found")
        }
        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: task
        })
    } catch (error) {
        next(error)
    }
})



userTaskRoute.delete("/:taskId", async (req, res, next) => {
    try {
        const { taskId } = req.params
        await deleteUserTask(taskId, req.user!.userId)

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        })
    } catch (error) {
        next(error)
    }
})