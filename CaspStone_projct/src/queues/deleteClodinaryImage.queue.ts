import { Queue } from "bullmq"
import { bullmqConnection } from "../lib/redis";


const QUEUE_NAME = 'cloudinary-jobs'
const DELETE_CLOUDINARY_IMAGE_JOB = "delete-cloudinary-image"

type DeleteCloduinaryImageJobData = {
    publicId: string
}

export const DeleteCloduinaryImagQueue = new Queue<DeleteCloduinaryImageJobData>(QUEUE_NAME, { connection: bullmqConnection });

export async function addDeleteCloudinaryImageJob(
    publicId: string
): Promise<void> {

    const jobData: DeleteCloduinaryImageJobData = {
        publicId
    }

    await DeleteCloduinaryImagQueue.add(DELETE_CLOUDINARY_IMAGE_JOB, jobData, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 3000
        },
        removeOnComplete: true,
        removeOnFail: false
    })


}