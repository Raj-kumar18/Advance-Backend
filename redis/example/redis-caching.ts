import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config()

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"


const redis = createClient({ url: redisUrl })

//cache key
const cacheKey = "demo:products"
const cacheTTL = 60  // expire in 60 seconds

const products = [
    { id: 1, name: "laptop", price: 1000 },
    { id: 2, name: "mouse", price: 100 },
    { id: 3, name: "keyboard", price: 100 },
    { id: 4, name: "monitor", price: 100 },
    { id: 5, name: "phone", price: 100 },
    { id: 6, name: "watch", price: 100 },
    { id: 7, name: "bag", price: 100 },
    { id: 8, name: "shoes", price: 100 },
    { id: 9, name: "hat", price: 100 },
    { id: 10, name: "gloves", price: 100 },
]

async function run() {
    //open connection with redis

    await redis.connect()

    console.log("connected to redis")
    console.log("ping", await redis.ping())

    //first request

    //Check Cache
    let cachedData: string | null = await redis.get(cacheKey)

    if (cachedData) {
        console.log("Cache hit! ✅");
        console.log(JSON.parse(cachedData)); //cached data ko directly parse karke use kar lo
    } else {
        //Cache miss
        console.log("Cache miss ❌ -Fetching from DB")

        //read from db
        //save in cache
        await redis.set(cacheKey, JSON.stringify(products), { EX: cacheTTL })

        console.log("Data cached for 60 seconds ✅")
        console.log(products)
    }


    //stale cache problem -> jab user fresh data chahe par cache mein old data ho

    //solution -> 1) Manual delete
    //jab data update ho tab redis se hata do
    //await redis.del(cacheKey)

    //2) Time based evict
    //set TTL short (5-10min)

    //cache invalidation strategys for write operations

    //1. Write through cache 
    //Read -> from cache
    //write -> cache + db

    //2. Write back cache
    //write -> cache only
    //cache to db ->後に (background)
    //advantage -> fast write
    //disadvantage -> data loss on crash

    //3. Write around cache
    //Read -> cache miss -> db -> cache
    //Write -> cache miss -> db only

    // const updateProduct = { id: 2, name: "mouse", price: 200 }

    // console.log(updateProduct)
    // console.log(products)


    //cached invalidation  
    // when DB changes - delete ur old cache manually

    //when i add,update,delete any data in db
    //then delete the cache
    const dbProduct = [{ id: 1, name: "laptop", price: 1000 },
    { id: 2, name: "mouse", price: 100 },
    { id: 3, name: "keyboard", price: 100 },
    { id: 4, name: "monitor", price: 100 },
    { id: 5, name: "phone", price: 100 },
    { id: 6, name: "watch", price: 100 },
    { id: 7, name: "bag", price: 100 },
    { id: 8, name: "shoes", price: 100 },
    { id: 9, name: "hat", price: 100 },
    { id: 10, name: "gloves", price: 100 },
    { id: 11, name: "ganja", price: 151515115 },


    ]


    await redis.del(cacheKey)
    console.log("Cache cleared ✅")

    if (!cachedData) {
        console.log("cache data after delete")
        const freshProducts = dbProduct
        await redis.set(cacheKey, JSON.stringify(freshProducts), { EX: cacheTTL })
        console.log("Data cached for 60 seconds ✅")
        console.log(freshProducts)
    }

    await redis.quit()

}

run().catch((error) => {
    console.log(error)
    process.exit(1) //process.exit(1) ka matlab hai error ko log karo and server ko stop kar do
})