import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { env } from "../config/env";
import { AppError } from "../error/AppError";

type UploadUrl = {
    secureUrl: string,
    publicId: string
}

export async function uploadBannerImageToCloudinary(fileBuffer: Buffer, options?: { folder?: string }): Promise<UploadUrl> {

    const cloudName = env.cloudinaryCloudName
    const apiKey = env.cloudinaryApiKey
    const apiSecret = env.cloudinaryApiSecret

    if (!cloudName || !apiKey || !apiSecret) {
        throw new AppError(400, "cloudinary Configurtion Missing")
    }

    //configure cloudinary

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true // HTTPS Protocol Use hoga
    })

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                folder: options?.folder
            },
            (error, result) => {
                if (error) {
                    return reject(error)
                }
                resolve({
                    secureUrl: result?.secure_url ?? "",
                    publicId: result?.public_id ?? ""
                })
            }
        )
        //sending raw image bytes to cloudinary
        uploadStream.end(fileBuffer)
    })


}