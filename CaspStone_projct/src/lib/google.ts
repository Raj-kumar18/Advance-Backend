import { OAuth2Client } from "google-auth-library"
import { env } from "../config/env"
import { AppError } from "../error/AppError";


export type GoogleUserProfile = {
    googleId: string;
    email: string;
}

const googleOauthClient = new OAuth2Client(
    env.googleClientId,
    env.googleClientSecret,
    env.googleCallbackUrl
)



export function getGoogleAuthUrl(): string {
    const url = googleOauthClient.generateAuthUrl({
        scope: ["openid", "email", "profile"],
        access_type: "online",
        prompt: "select_account"
    })

    return url
}


export async function getGoogleUserFromAuthCode(code: string): Promise<GoogleUserProfile> {
    if (!code) {
        throw new AppError(400, "Authorization code is missing")
    }


    const { tokens } = await googleOauthClient.getToken(code)
    if (!tokens.id_token) {
        throw new AppError(401, "Failed to get ID token from Google")
    }

    const ticketInfo = await googleOauthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.googleClientId,
    })

    const payload = ticketInfo?.getPayload()

    const email = payload?.email?.toLocaleLowerCase().trim()
    const googleId = payload?.sub

    if (!email || !googleId) {
        throw new AppError(401, "Invalid payload")
    }


    return {
        googleId,
        email
    }

}