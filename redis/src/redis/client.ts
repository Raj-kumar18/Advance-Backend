import { createClient } from "redis"


const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

const client = createClient({ url: redisUrl })

client.on("connect", () => console.log("Connected to Redis"))
client.on("ready", () => console.log("Redis is ready"))
client.on("error", (err) => console.log("Error: Redis Client ", err))
client.on("end", () => console.log("Disconnected from Redis"))


export async function conneectRedis(): Promise<void> {
    try {
        if (!client.isOpen) {
            await client.connect()
        }
    } catch (error) {
        console.log("Error: Redis Client ", error)
        process.exit(1)
    }
}

export async function disconnectRedis() {
    try {
        if (client.isOpen) {
            await client.quit()
        }
    } catch (error) {
        console.log("Error: Redis Client ", error)
        process.exit(1)
    }
}

export default client