import { passwordLength, genSalt } from "../constants";
import { AppError } from "../error/AppError";
import { createUser, findUserByEmail } from "../repositories/user.repository";
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