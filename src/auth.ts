import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
    // Fetch latest config from DB
    const storeConfig = await prisma.storeConfig.findUnique({
        where: { id: "store-config" }
    }) as any;

    return {
        adapter: PrismaAdapter(prisma),
        providers: [
            Google({
                clientId: storeConfig?.googleClientId || process.env.GOOGLE_CLIENT_ID || "",
                clientSecret: storeConfig?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || "",
                allowDangerousEmailAccountLinking: true,
            }),
            Apple({
                clientId: storeConfig?.appleClientId || process.env.APPLE_CLIENT_ID || "",
                clientSecret: {
                    appleId: storeConfig?.appleClientId || process.env.APPLE_CLIENT_ID || "",
                    teamId: storeConfig?.appleTeamId || process.env.APPLE_TEAM_ID || "",
                    privateKey: storeConfig?.applePrivateKey || process.env.APPLE_PRIVATE_KEY || "",
                    keyId: storeConfig?.appleKeyId || process.env.APPLE_KEY_ID || "",
                } as any,
                allowDangerousEmailAccountLinking: true,
            })
        ],
        callbacks: {
            async session({ session, user }) {
                // Attach user ID to session
                if (session.user) {
                    session.user.id = user.id;
                    // @ts-ignore
                    session.user.role = user.role || "USER";
                }
                return session;
            }
        },
        pages: {
            signIn: '/checkout', // Redirect to checkout if auth needed
            error: '/checkout?error=AuthError'
        }
    }
})
