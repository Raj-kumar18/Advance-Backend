import { passwordLength, genSalt } from "../constants";
import { AppError } from "../error/AppError";
import { signAccessToken } from "../lib/jwt";
import { createUser, findUserByEmail, findUserByEmailWithPassword } from "../repositories/user.repository";
import bcrypt from "bcryptjs"

export async function registerUser(email: string, password: string): Promise<void> {
    if (!email || !password) {
        throw new AppError(400, "Email and password are required")
    }

    if (password.length < passwordLength) {
        throw new AppError(400, `Password must be at least ${passwordLength} characters long`)
    }

    const normalizeEmail = email.toLocaleLowerCase().trim()

    const existingUser = await findUserByEmail(normalizeEmail)

    if (existingUser) {
        throw new AppError(400, "Email already exists")
    }
    const passwordHash = await bcrypt.hash(password, genSalt)

    await createUser(normalizeEmail, passwordHash)


}


export async function loginUser(email: string, password: string): Promise<{ accessToken: string }> {
    if (!email || !password) {
        throw new AppError(400, "Email and password are required")
    }

    if (password.length < passwordLength) {
        throw new AppError(400, `Password must be at least ${passwordLength} characters long`)
    }

    const normalizeEmail = email.toLocaleLowerCase().trim()
    const user = await findUserByEmailWithPassword(normalizeEmail)

    if (!user?.password_hash) {
        throw new AppError(400, "Invalid email or password")
    }

    const isPasswordValid = await bcrypt.compare(password, user?.password_hash)

    if (!isPasswordValid) {
        throw new AppError(400, "password is wrong")
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })

    return { accessToken }
}