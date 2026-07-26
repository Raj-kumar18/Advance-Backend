
//find user by emial

import { pool } from "../lib/db";
import { DBUserRow, User } from "../types/user";

export async function findUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query<DBUserRow>(
        "SELECT id, email, role, created_at FROM users WHERE email = $1",
        [email]
    )


    return result.rows[0] ?? null
}

//create new user by email

export async function createUser(email: string, passwordHash: string): Promise<User> {
    await pool.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
        [email, passwordHash]
    )


}