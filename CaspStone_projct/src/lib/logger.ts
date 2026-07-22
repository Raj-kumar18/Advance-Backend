import { env } from "../config/env"
import pino from "pino"

export  const logger = pino({
    level:env.loglevel,
    transport:env.isProduction ?
    undefined : {
        target:"pino-pretty",
        options:{
            colorize:true,
            translateTime:'SYS:standard'
        }
    }
})