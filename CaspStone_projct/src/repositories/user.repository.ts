
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


export async function findUserByGoogleId(googleId: string): Promise<User | null> {


    const result = await pool.query<DBUserRow>("SELECT id, email, role, created_at FROM users WHERE google_id = $1", [googleId])

    return result.rows[0] ?? null
}

export async function linkGoogleIdToUser(
    userId: string,
    googleId: string
): Promise<User> {
    const result = await pool.query<DBUserRow>(
        `
    UPDATE users
    SET google_id = $2,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, email, role, created_at
    `,
        [userId, googleId]
    );

    return result.rows[0];
}

export async function createGoogleUser(email: string, googleId: string): Promise<User> {
    const result = await pool.query<DBUserRow>(
        "INSERT INTO users (email, google_id) VALUES ($1, $2) RETURNING id, email, role, created_at",
        [email, googleId]
    )

    return result.rows[0]
}