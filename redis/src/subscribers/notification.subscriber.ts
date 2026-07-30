import { createClient } from "redis";
import client from "../redis/client";

const notification_channel = "notifications"

export interface NotificationsPayload {
    id: string,
    title: string,
    message: string,
    created_at: string
}

async function publishNotification(notification: NotificationsPayload): Promise<void> {
    await client.publish(notification_channel, JSON.stringify(notification))

}

const subscriberClient = createClient({
    url: process.env.REDIS_URL
})

subscriberClient.on("error", (err) => console.log("Subscriber Error", err))
subscriberClient.on("error", (err) => console.log("Subscriber Connected", err))


async function subscribeToNotifications(): Promise<void> {
    await subscriberClient.connect()
    await subscriberClient.subscribe(notification_channel, (message) => {

        try {
            const notification = JSON.parse(message) as NotificationsPayload

            console.log('New notification received')
            console.log("title", notification.title)
            console.log("message", notification.message)
            console.log("Created at", notification.created_at)


        } catch (error) {
            console.log("Error parsing notification", error)

        }
    })
}

subscribeToNotifications().then(() => console.log("Subscribed to notifications")).catch((error) => console.log("Error subscribing", error))

export { subscriberClient, publishNotification, subscribeToNotifications }