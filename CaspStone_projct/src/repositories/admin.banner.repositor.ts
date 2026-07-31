import { AppError } from "../error/AppError";
import { pool } from "../lib/db";
import { Banner } from "../types/banners";

type BannerRow = Banner


export async function createAdminBannerDB(
    imageUrl: string,
    cloudinaryPublicId: string
): Promise<Banner> {

    const result = await pool.query<BannerRow>(
        `INSERT INTO banners(image_url,cloudinary_public_id) VALUES($1,$2) RETURNING id,image_url,cloudinary_public_id,created_at,updated_at`,
        [imageUrl, cloudinaryPublicId]
    )

    if (!result) {
        throw new AppError(500, "Failed to create banner")
    }

    return result.rows[0]
}


export async function fetchAllAdminBannersDB(): Promise<Banner[]> {

    const result = await pool.query<BannerRow>(
        `SELECT * FROM banners ORDER BY id DESC`
    )

    if (!result) {
        throw new AppError(500, "Failed to fetch banners")
    }

    return result.rows
}