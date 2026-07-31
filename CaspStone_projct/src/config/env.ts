import dotenv from 'dotenv'

dotenv.config()

function checkRequiredEnvVariable(key: string): string {
    const value = process.env[key]

    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`)
    }
    return value;
}

export const env = {
    port: Number(process.env.PORT ?? 3000),
    isProduction: (process.env.NODE_ENV ?? "development") === "production",
    nodeEnv: process.env.NODE_ENV ?? "development",
    loglevel: process.env.LOG_LEVEL ?? "info",
    dbConnectionString: checkRequiredEnvVariable("DATABSE_URL"),
    jwtSecret: checkRequiredEnvVariable("JWT_SECRET"),
    jwtAccessExpiresIn: checkRequiredEnvVariable("JWT_ACESS_EXPIRES_IN"),

    //Cloudinary Config
    cloudinaryCloudName: checkRequiredEnvVariable("CLOUDINARY_CLOUD_NAME"),
    cloudinaryApiKey: checkRequiredEnvVariable("CLOUDINARY_API_KEY"),
    cloudinaryApiSecret: checkRequiredEnvVariable("CLOUDINARY_API_SECRET"),
    redisUrl: checkRequiredEnvVariable("REDIS_URL"),

    // google oauth
    googleClientId: checkRequiredEnvVariable("GOOGLE_CLIENT_ID"),
    googleClientSecret: checkRequiredEnvVariable("GOOGLE_CLIEN_SECRET"),
    googleCallbackUrl: checkRequiredEnvVariable("GOOGLE_CALLBACK_URL"),
} as const

// as const ka matlab hai: "TypeScript, is value ko exactly isi form me treat karo aur ise readonly bana do."