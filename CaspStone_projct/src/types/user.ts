
export type User = {
    id: string,
    email: string,
    role: string,
    created_at: Date
}

export type DBUserRow = {
    id: string,
    email: string,
    role: string,
    created_at: Date
}

export type DBUserWithRowPassword = DBUserRow & {
    password_hash: string | null
}