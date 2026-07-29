import { pool } from "../lib/db"
import { Task } from "../types/task"


type TaskRow = Task

type AdminTaskListFilter = {
    search?: string,
    status?: string
}
export async function findAllTasks(
    filters: AdminTaskListFilter
): Promise<Task[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    let paramIndex = 1;

    if (filters.search) {
        conditions.push(`title ILIKE $${paramIndex}`);
        values.push(`%${filters.search}%`);
        paramIndex++;
    }

    if (filters.status) {
        conditions.push(`status = $${paramIndex}`);
        values.push(filters.status);
        paramIndex++;
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const result = await pool.query<TaskRow>(
        `
    SELECT
      id,
      title,
      status,
      user_id,
      created_at,
      updated_at
    FROM support_tasks
    ${whereClause}
    ORDER BY created_at DESC
    `,
        values
    );

    console.log("Filters:", filters);
    console.log("Values:", values);
    console.log("Where Clause:", whereClause);

    return result.rows;
}


export async function updateTaskStatus(taskId: string, status: string): Promise<Task | null> {
    const result = await pool.query<TaskRow>(
        `UPDATE support_tasks SET status = $1,updated_at = NOW() WHERE id = $2  RETURNING id,user_id,title,status,created_at,updated_at`,
        [status, taskId]
    )

    if (result.rows.length === 0) {
        return null
    }
    return result.rows[0]
}