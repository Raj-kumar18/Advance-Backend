import { Router } from "express";
import { loginUser, registerUser } from "../services/auth.services";
import { authentication } from "../middlewares/auth.middleware";

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