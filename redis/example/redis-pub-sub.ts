// Pub = Publisher
// Sub = Subscriber

// Ek sender (Publisher) message bhejta hai aur jo log us channel ko sun rahe hote hain (Subscribers), un sabko woh message turant mil jata hai

//             Publisher

//                 │

//     PUBLISH "Hello"

//                 │

//         Redis Channel (chat)

//         /         |          \

//     /          |           \

// Subscriber1  Subscriber2  Subscriber3

//                  │            │

//     Hello      Hello       Hello

//chanels is the topic name both sides use

import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config()

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"


const channel = "demo:notifications"

async function run() {
    //needs two clients
    //one clients will be to publish and second one to subscribe

    const publisher = createClient({ url: redisUrl })
    const subscriber = createClient({ url: redisUrl })

    await publisher.connect()
    await subscriber.connect()

    console.log('publisher connected')
    console.log('subscriber connected')

    // subscriber must be active before publish

    //subscribe to the channel
    await subscriber.subscribe(channel, (message) => {
        const data = JSON.parse(message)

        console.log("Real-time Notification:", data)
        //update UI without refresh
        //show Toast
        //real-time Dashboard update
        //gaming leaderboard
        //live chat

        //if this is stock market app then server send notification when stock price goes up or down
        //this kind of notification can be sent using redis pub sub
    })

    //publish messages
    const messages = [
        { id: 1, message: "Welcome to Redis Pub Sub!" },
        { id: 2, message: "Notifications are now real-time 🚀" },
        { id: 3, message: "Live updates without refresh!" },
    ]

    for (const msg of messages) {
        await publisher.publish(channel, JSON.stringify(msg))
        //little delay for realistic demo
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    //after some time stop
    await subscriber.unsubscribe(channel) //stop listening
    await publisher.quit() //close the connection
    await subscriber.quit() //close the connection
}
run().catch(console.error)