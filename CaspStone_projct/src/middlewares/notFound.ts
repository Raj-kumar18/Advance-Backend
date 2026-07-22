import { Response,Request } from "express";


export const notFound =(_req:Request,res:Response):void=>{
    res.status(400).json({
        success:false,
        message:"Not Found"
    })
}