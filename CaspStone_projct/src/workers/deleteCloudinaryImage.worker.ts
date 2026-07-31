import { Worker } from "bullmq"
import { deleteBannerImageFromCloudinary } from "../lib/cloudinary"
import { bullmqConnection } from "../lib/redis"
import { logger } from "../lib/logger"





const QUEUE_NAME = 'cloudinary-jobs'
const DELETE_CLOUDINARY_IMAGE_JOB = "delete-cloudinary-image"
type DeleteCloduinaryImageJobData = {
    publicId: string
}


export const deleteCloudinaryImageWorker = new Worker<DeleteCloduinaryImageJobData>(
    QUEUE_NAME,
    async (job) => {
        if (job.name !== DELETE_CLOUDINARY_IMAGE_JOB) {
            throw new Error(`Invalid job name: ${job.name}`)
        }

        const data = job.data as DeleteCloduinaryImageJobData
        console.log(`Processing job ${job.id} to delete image ${data.publicId}`)

        await deleteBannerImageFromCloudinary(data.publicId)

        console.log(`Successfully deleted image ${data.publicId}`)
    },
    {
        connection: bullmqConnection
    }
)

deleteCloudinaryImageWorker.on("completed", (job) => {
    logger.info(`cloudinary delete job completed for assets ${job.data.publicId}`)
    console.log(`Job ${job?.id} completed`)
})

deleteCloudinaryImageWorker.on("failed", (job, error) => {
    logger.error({ err: error, jobId: job?.id }, `cloudinary delete job failed for assets`)
    console.log(`Job ${job?.id} failed:`, error)
})
logger.info("Delete cloudinary image worker started")