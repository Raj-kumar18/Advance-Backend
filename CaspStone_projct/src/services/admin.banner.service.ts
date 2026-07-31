import { AppError } from "../error/AppError";
import { clearBannersCache, getBannersFromCache, setBannersToCache } from "../lib/bannerCache";
import { uploadBannerImageToCloudinary } from "../lib/cloudinary";
import { addDeleteCloudinaryImageJob } from "../queues/deleteClodinaryImage.queue";
import { createAdminBannerDB, deleteAdminBannerById, fetchAllAdminBannersDB } from "../repositories/admin.banner.repositor";
import { Banner } from "../types/banners";


export async function createAdminBannerService(
    file: Express.Multer.File | undefined
): Promise<Banner> {

    if (!file) {
        throw new AppError(400, "Banner image is required");
    }
    //Call cloudinary upload function 

    if (!file.buffer) {
        throw new AppError(400, "Image type is invalid")
    }

    const { secureUrl, publicId } = await uploadBannerImageToCloudinary(
        file.buffer,
        {
            folder: "nodejs-capstone-project"
        }
    )
    if (!secureUrl || !publicId) {
        throw new AppError(500, "Failed to upload image to cloudinary")
    }


    const banner = await createAdminBannerDB(secureUrl, publicId)
    //invalidate the cache
    await clearBannersCache()

    return banner
}


export async function fetchAdminBanners(): Promise<Banner[]> {
    const getCahedBanners = await getBannersFromCache()

    if (getCahedBanners) {
        return getCahedBanners
    }


    const banners = await fetchAllAdminBannersDB()

    //set the data to cache

    await setBannersToCache(banners)
    return banners
}


export async function deleteAdminBannerService(bannerId: string): Promise<void> {
    //delte from our db and get the public id

    const publicId = await deleteAdminBannerById(bannerId)

    if (!publicId) {
        throw new AppError(404, "Banner not found")
    }

    await clearBannersCache()

    //add bullmq job

    await addDeleteCloudinaryImageJob(publicId)

}