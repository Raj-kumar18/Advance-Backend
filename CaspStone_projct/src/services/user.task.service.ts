import { Task } from "../types/task"
import { AppError } from "../error/AppError"
import { createTask, getAllTasks } from "../repositories/user.task.repositor"

function validateTaskInput(title: unknown): string {
    if (typeof title !== "string") {
        throw new AppError(400, "Title must be a string")
    }

    if (title.trim().length === 0) {
        throw new AppError(400, "Title cannot be empty")
    }

    return title.trim()
}

export async function createUserTask(userId: string, title: unknown): Promise<Task> {
    try {
        const validTitle = validateTaskInput(title)
        return createTask(userId, validTitle)
    } catch (error) {
        throw new AppError(400, "Failed to create task")
    }
}

export async function getUserTasks(userId: string): Promise<Task[]> {
    try {
        const tasks = await getAllTasks(userId)

        if (!tasks || tasks.length === 0) {
            throw new AppError(404, "No tasks found")
        }

        return tasks
    } catch (error) {
        throw new AppError(400, "Failed to get user tasks")
    }
}