
//string
//hash
//list
//set
//sorted set
//ttl

// | Data Type                | Description                                              | Example Use Case               |
// | ------------------------ | -------------------------------------------------------- | ------------------------------ |
// | **1. String**            | Simple string, number, JSON, binary data store karta hai | User session, OTP, Counter     |
// | **2. List**              | Ordered collection, duplicates allowed                   | Chat messages, Queue           |
// | **3. Set**               | Unique values, unordered                                 | Unique tags, Online users      |
// | **4. Hash**              | Key-value pairs ek object ke andar                       | User profile                   |
// | **5. Sorted Set (ZSet)** | Unique values with score                                 | Leaderboard, Rankings          |
// | **6. Stream**            | Append-only log of events                                | Event streaming, Notifications |
// | **7. Bitmap**            | Bits (0/1) store karta hai efficiently                   | Daily user activity            |
// | **8. HyperLogLog**       | Approximate unique count                                 | Count unique visitors          |





//string - stores one value under one key
//plain text,numbers stored as text,counter
//key - page_views
//values:"100"

import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config()

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"


const redis = createClient({ url: redisUrl })

async function run() {

    //open connection with redis

    await redis.connect()

    console.log("connected to redis")
    console.log("ping", await redis.ping())

    //string
    const stringKey = "demo:page_views"

    await redis.set(stringKey, "100")

    //redis string can also work like counters
    const newViews = await redis.incr(stringKey) //increment 101
    const afterDecr = await redis.decr(stringKey) //decrement 100

    // console.log(newViews)
    // console.log(afterDecr)

    const pageViews = await redis.get(stringKey)
    console.log(pageViews)


    //hash 
    //stores many small fields under one key - samll object or map inside redis

    //key : keyname
    //fields:
    //name->"rajkumar"
    //email->"email"

    const hashKey = "demo:user:profile" // iska matlab demo folder ke andar user folder ke andar profile ko store kar rha hu

    await redis.hSet(hashKey, { name: "rajkumar", email: "[EMAIL_ADDRESS]" })
    await redis.hSet(hashKey, { age: "20" })

    //retrieve single field
    const userName = await redis.hGet(hashKey, "name")
    //retrive all field
    const userProfile = await redis.hGetAll(hashKey)

    console.log(userName)
    console.log(userProfile)


    //list 
    //Redis mein List ka matlab hai ordered collection of elements.
    //List = items ki ek sequence jisme order maintain rehta hai aur duplicate values bhi allowed hoti hain.
    //Perfect use-case: Chat messages, notifications queue, activity feed.

    const listKey = "demo:message"

    //LPUSH aur RPUSH isliye use karte hain kyunki hume decide karna hota hai ki element list ke kis side add hoga.

    // | Command | Add kahan hota hai? | Common Use                            |
    // | ------- | ------------------- | ------------------------------------- |
    // | `LPUSH` | Beginning (left)    | Latest notifications, latest activity |
    // | `RPUSH` | End (right)         | Chat messages, queue, logs            |



    await redis.lPush(listKey, "hi message") //lpush se left side add hoga left (shuru) mein add karta hai.
    await redis.lPush(listKey, "hello message") //hello message
    await redis.lPush(listKey, "how are you message")//how are you message

    //retrieve all list elements
    //0 se -1 ka matlab hai first element se last element tak
    const messages = await redis.lRange(listKey, 0, -1)
    console.log(messages)

    //ltrim - keep only part if the list

    //0 se 2 -> first 3 elements


    //SET
    //Redis mein Set ek aisa data type hai jo unique values store karta hai.
    //Set = Unordered collection of unique elements.
    //Duplicate values allow nahi hoti.
    //Order guarantee nahi hota.

    const setKey = "demo:unique:tags" //demo folder ke andar unique folder ke andar tag ko store kar rha hu



    await redis.sAdd(setKey, "technology") //technology
    await redis.sAdd(setKey, "programming")//programming
    await redis.sAdd(setKey, "technology") //duplicate hai - ignore ho jayega

    const tags = await redis.sMembers(setKey)
    const tagsCount = await redis.sCard(setKey)
    console.log(tags)
    console.log(tagsCount)

    // | Feature | List | Set |
    // | ----------------------- | ----------- | ------------------------------ |
    // | Order maintain hota hai | ✅ Yes       | ❌ No                           |
    // | Duplicate allowed       | ✅ Yes       | ❌ No                           |
    // | Unique values           | ❌ No        | ✅ Yes                          |
    // | Use case                | Chat, Queue | Tags, Online Users, Unique IDs |


    //SORTED SET

    //Sorted Set = Unique elements + har element ke saath ek score.

    //Redis score ke basis par automatically sort karta hai.

    //Matlab:

    // ✅ Values unique hoti hain (Set ki tarah).
    // ✅ Har value ka ek score hota hai.
    // ✅ Score ke according order maintain hota hai.

    const rankKey = "demo:leaderboard"
    await redis.zAdd(rankKey, { score: 100, value: "payer_a" })
    await redis.zAdd(rankKey, { score: 200, value: "payer_b" })

    const newScore = await redis.zIncrBy(rankKey, 50, "payer_a")
    console.log("updated score", newScore)

    const rank = await redis.zRevRank(rankKey, "payer_b") //give rank according to highest score to lowest score
    console.log("rank", rank) //rank 0 matlab higherst score


    // TTL
    // TTL (Time To Live) Redis ka feature hai jo batata hai ki ek key kitni der tak Redis mein zinda rahegi.
    // Jab TTL khatam ho jata hai, Redis us key ko automatically delete kar deta hai.

    const otpKey = "demo:otp"
    await redis.set(otpKey, "123456")
    await redis.expire(otpKey, 60)

    const ttl = await redis.ttl(otpKey)
    console.log("ttl", ttl) //60 seconds

    // SETEX
    // SETEX = SET + EXPIRE - ek sath set and expire
    // await redis.setEx(otpKey, 60, "123456")


    await redis.quit()

}

run().catch((error) => {
    console.log(error)
    process.exit(1) //process.exit(1) ka matlab hai error ko log karo and server ko stop kar do
})