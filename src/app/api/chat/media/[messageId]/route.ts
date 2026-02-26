import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ messageId: string }> }
) {
    try {
        const { messageId } = await params;

        // Buscar configuração
        const config = await prisma.chatConfig.findUnique({
            where: { id: "chat-config" },
        });

        if (!config?.evolutionUrl || !config?.evolutionApiKey || !config?.evolutionInstance) {
            return NextResponse.json({ error: "Evolution API not configured" }, { status: 500 });
        }

        // Buscar a mensagem
        const message = await prisma.chatMessage.findFirst({
            where: { messageId },
            include: { conversation: true },
        });

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        const baseUrl = config.evolutionUrl.replace(/\/$/, "");

        // Baixar mídia da Evolution API
        const response = await fetch(
            `${baseUrl}/chat/getBase64FromMediaMessage/${config.evolutionInstance}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: config.evolutionApiKey,
                },
                body: JSON.stringify({
                    message: {
                        key: {
                            remoteJid: `${message.conversation.phoneNumber}@s.whatsapp.net`,
                            fromMe: message.direction === "out",
                            id: messageId,
                        },
                    },
                    convertToMp4: false,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("Evolution API error:", error);
            return NextResponse.json({ error: "Failed to get media" }, { status: 500 });
        }

        const data = await response.json();

        if (data.base64) {
            // Determinar o mimetype
            let mimetype = "audio/ogg";
            if (message.mediaType === "image") mimetype = "image/jpeg";
            if (message.mediaType === "video") mimetype = "video/mp4";
            if (message.mediaType === "document") mimetype = "application/octet-stream";

            // Se a API retornar o mimetype, usar ele
            if (data.mimetype) {
                mimetype = data.mimetype;
            }

            // Converter base64 para buffer
            const buffer = Buffer.from(data.base64, "base64");

            return new NextResponse(buffer, {
                headers: {
                    "Content-Type": mimetype,
                    "Content-Length": buffer.length.toString(),
                    "Cache-Control": "public, max-age=31536000",
                },
            });
        }

        return NextResponse.json({ error: "No media data" }, { status: 404 });
    } catch (error: any) {
        console.error("Media fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
