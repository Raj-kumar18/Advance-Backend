import { Router } from "express";
import { loginUser, loginWithGoogle, registerUser, startGoogleLogin } from "../services/auth.services";
import { authentication } from "../middlewares/auth.middleware";
import { AppError } from "../error/AppError";

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


authRouter.post("/login", async (req, res, next) => {

    try {
        const { email, password } = req.body

        const { accessToken } = await loginUser(email, password)

        res.status(200).json({
            success: true,
            message: "Login successfully",
            data: {
                accessToken
            }
        })
    } catch (error) {
        next(error)
    }
})


//get my current user

authRouter.get("/me", authentication, (req, res, next) => {
    try {

        res.status(200).json({
            success: true,
            message: "Current user data",
            data: req.user
        })

    } catch (error) {
        next(error)
    }

})


authRouter.get("/google", async (req, res, next) => {
    try {
        const googleAuthUrl = startGoogleLogin()
        res.redirect(googleAuthUrl)
    } catch (error) {
        next(error)
    }
})

authRouter.get("/google/callback", async (req, res, next) => {
    try {
        const code = req.query.code as string | undefined

        if (!code) {
            throw new AppError(400, "Authorization code is missing")
        }

        const { accessToken } = await loginWithGoogle(code)

        res.status(200).json({
            success: true,
            message: "Google login successful",
            data: {
                accessToken
            }
        })
    } catch (error) {
        next(error)
    }
})