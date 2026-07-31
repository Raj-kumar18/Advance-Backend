import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { uploadSingleBannerImage } from "../middlewares/banner.middleware";
import { createAdminBannerService, deleteAdminBannerService, fetchAdminBanners } from "../services/admin.banner.service";

export const adminBannerRouter = Router()

//Apply Auth & Role Middleware
adminBannerRouter.use(authentication, requireAdmin)

adminBannerRouter.post("/", uploadSingleBannerImage, async (req, res, next) => {
    try {
        const banner = await createAdminBannerService(req.file)

        res.status(200).json({
            success: true,
            message: "Banner uplaoded successfully",
            data: banner
        })
    } catch (error) {
        next(error)
    }
})

adminBannerRouter.get("/", async (req, res, next) => {
    try {
        const banners = await fetchAdminBanners()
        res.status(200).json({
            success: true,
            message: "Banner fetched successfully",
            data: banners
        })
    } catch (error) {
        next(error)
    }
})

adminBannerRouter.delete("/:bannerId", async (req, res, next) => {
    try {
        const bannerId = req.params.bannerId
        const banner = await deleteAdminBannerService(bannerId)
        res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
            data: banner
        })
    } catch (error) {
        next(error)
    }
})