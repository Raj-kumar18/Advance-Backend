import { pool } from "../lib/db";
import { Task } from "../types/task";

type TaskRow = Task

export async function createTask(
    userId: string,
    title: string
): Promise<Task> {
    const result = await pool.query<TaskRow>(
        `INSERT INTO support_tasks (user_id,title) VALUES ($1,$2) RETURNING id,user_id,title,status,created_at,updated_at`,
        [userId, title]
    )

    if (result.rows.length === 0) {
        throw new Error("Failed to create task")
    }

    return result.rows[0]
}

export async function getAllTasks(userId: string): Promise<Task[]> {
    const result = await pool.query<TaskRow>(
        `SELECT id,user_id,title,status,created_at,updated_at FROM support_tasks WHERE user_id = $1`,
        [userId]
    )
    if (result.rows.length === 0) {
        throw new Error("Failed to get tasks")
    }

    return result.rows
}


export async function findTaskByIdAndUserId(taskId: string, userId: string): Promise<Task> {
    const result = await pool.query<TaskRow>(
        `SELECT id,user_id,title,status,created_at,updated_at FROM support_tasks WHERE id = $1 AND user_id = $2`,
        [taskId, userId]
    )
    if (result.rows.length === 0) {
        throw new Error("Failed to get task")
    }

    return result.rows[0]
}

export async function updateTaskTitle(taskId: string, userId: string, title: string): Promise<Task | null> {
    const result = await pool.query<TaskRow>(
        `UPDATE support_tasks SET title = $1,updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING id,user_id,title,status,created_at,updated_at`,
        [title, taskId, userId]
    )

    if (result.rows.length === 0) {
        return null
    }
    return result.rows[0]
}