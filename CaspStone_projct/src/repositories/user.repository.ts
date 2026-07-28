
//find user by emial

import { pool } from "../lib/db";
import { DBUserRow, DBUserWithRowPassword, User } from "../types/user";

export async function findUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query<DBUserRow>(
        "SELECT id, email, role, created_at FROM users WHERE email = $1",
        [email]
    )


    return result.rows[0] ?? null
}

//create new user by email

export async function createUser(email: string, passwordHash: string): Promise<User> {
    const result = await pool.query<DBUserRow>(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role, created_at",
        [email, passwordHash]
    )

    return result.rows[0]


}

export async function findUserByEmailWithPassword(email: string): Promise<DBUserWithRowPassword | null> {
    const result = await pool.query<DBUserWithRowPassword>(`
        SELECT id,email,password_hash,role,created_at
        FROM users WHERE email=$1
        `, [email])



    return result.rows[0] ?? null
}