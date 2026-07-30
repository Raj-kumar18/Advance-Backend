import { Request, Response, NextFunction } from "express";
import { NotificationsPayload, publishNotification } from "../subscribers/notification.subscriber";

export async function publishNotificationController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { title, message } = req.body

        if (!title || !message) {
            return res.status(400).json({ message: "title and message are required" })
        }

        const notification: NotificationsPayload = {
            id: crypto.randomUUID(),
            title,
            message,
            created_at: new Date().toISOString()
        }
        //publisher is going to publish

        await publishNotification(notification)
        return res.status(201).json({ message: "Notification sent successfully", notification })
    } catch (error) {
        next(error)
        return res.status(500).json({ message: "Error publishing notification", error })
    }
}