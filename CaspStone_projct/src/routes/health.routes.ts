import { Router } from "express";


export const healthRoute = Router()


healthRoute.get("/health",(_req,res)=>{
    res.status(200).json({
        success:true,
        message:"Health route is working"
    })
})
