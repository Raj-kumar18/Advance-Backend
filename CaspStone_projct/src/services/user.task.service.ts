import { Task } from "../types/task"
import { AppError } from "../error/AppError"
import { createTask, deleteUserTaskById, findTaskByIdAndUserId, getAllTasks, updateTaskTitle } from "../repositories/user.task.repositor"

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

export async function getUserTaskById(taskId: string, userId: string): Promise<Task> {
    try {
        const task = await findTaskByIdAndUserId(taskId, userId)
        if (!task) {
            throw new AppError(404, "Task not found")
        }
        return task
    } catch (error) {
        throw new AppError(400, "Failed to get task")
    }
}

export async function updateUserTask(taskId: string, userId: string, title: string): Promise<Task> {
    try {
        const validTitle = validateTaskInput(title)
        const task = await updateTaskTitle(taskId, userId, validTitle)

        if (!task) {
            throw new AppError(404, "Task not found")
        }
        return task
    } catch (error) {
        throw new AppError(400, "Failed to update task")
    }
}

export async function deleteUserTask(taskId: string, userId: string): Promise<void> {
    try {
        const task = await deleteUserTaskById(taskId, userId)

        if (!task) {
            throw new AppError(404, "Task not found")
        }

    } catch (error) {
        throw new AppError(400, "Failed to delete task")
    }
}