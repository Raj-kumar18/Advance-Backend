import { Router } from "express";
import { registerUser } from "../services/auth.services";

export const authRouter = Router()

authRouter.post("/register", async (req, res, next) => {
    try {
        const { email, password } = req.body

        //not writing logic here 
        //service login - service file

        await registerUser(email, password);

        res.status(201).json({
            success: true,
            message: "Registeratin successfully, Please login to continue"
        })
    } catch (error) {
        next(error)
    }
})


// authRouter.post("/login", async (req, res, next) => {
//     const { email, password } = req.body

// })