import dotenv from 'dotenv'

dotenv.config()


export const env= {
    port:Number(process.env.PORT ?? 3000),
    isProduction:(process.env.NODE_ENV ?? "development") === "production",
    nodeEnv:process.env.NODE_ENV ?? "development",
    loglevel:process.env.LOG_LEVEL ?? "info",
} as const

// as const ka matlab hai: "TypeScript, is value ko exactly isi form me treat karo aur ise readonly bana do."