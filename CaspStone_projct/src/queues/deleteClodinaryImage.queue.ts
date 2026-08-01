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
        removeOnComplete: true, //Completed -> redis se delete
        removeOnFail: false // Matlab -> Failed jobs Redis me rahengi. Baad me inspect kar sakte ho.
    })


}


//                    Express API
//                         │
//                         ▼
//                 Queue.add(job)
//                         │
//                         ▼
//                  BullMQ Producer
//                         │
//                         ▼
//                  ioredis Client
//                         │
//                         ▼
//                   Redis (6379)
//         ┌───────────────┴───────────────┐
//         │                               │
//       WAIT Queue                    Job Metadata
//         │
//         ▼
//                BullMQ Worker
//                     │
//              Fetch next job
//                     │
//                     ▼
//       deleteBannerImageFromCloudinary()
//                     │
//          ┌──────────┴──────────┐
//          │                     │
//      Success               Failure
//          │                     │
//          ▼                     ▼
//  Completed Event        Retry (Backoff)
//          │                     │
//          ▼                     ▼
// Remove Job (optional)     Failed Queue