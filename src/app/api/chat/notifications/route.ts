import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Get messages from the last 10 seconds that are incoming
        const tenSecondsAgo = new Date(Date.now() - 10000);

        const newMessages = await prisma.chatMessage.findMany({
            where: {
                direction: "in",
                createdAt: { gte: tenSecondsAgo },
            },
            include: {
                conversation: true,
            },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        // Format response
        const formatted = newMessages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            phoneNumber: msg.conversation.phoneNumber,
            name: msg.conversation.name,
            createdAt: msg.createdAt.toISOString(),
        }));

        return NextResponse.json({
            newMessages: formatted,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("Notifications error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
