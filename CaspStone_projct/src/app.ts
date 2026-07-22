import express from "express"
import { errorHandler } from "./middlewares/errorHandler."
import { notFound } from "./middlewares/notFound"
import cors from "cors"
import { apiRouter } from "./routes"
export function createApp (){
    const app = express()

    //middlewares
    app.use(express.urlencoded({extended:true}))
    app.use(cors())
    app.use(express.json())

    app.use("/api",apiRouter)

    app.use(errorHandler)
    app.use(notFound)
    

    return app
}