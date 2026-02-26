import { NextRequest, NextResponse } from "next/server";
import { processIncomingMessage, updateMessageStatus, addMessage, createOrUpdateConversation } from "@/lib/actions/chat";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Helper to download media from Evolution API
async function downloadMediaFromEvolution(messageData: any, mediaType: string): Promise<string | null> {
    try {
        const config = await prisma.chatConfig.findUnique({ where: { id: "chat-config" } });
        if (!config?.evolutionUrl || !config?.evolutionApiKey || !config?.evolutionInstance) {
            console.log("Evolution API not configured for media download");
            return null;
        }

        const baseUrl = config.evolutionUrl.replace(/\/$/, "");

        // Use getBase64FromMediaMessage endpoint
        const response = await fetch(`${baseUrl}/chat/getBase64FromMediaMessage/${config.evolutionInstance}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": config.evolutionApiKey,
            },
            body: JSON.stringify({
                message: messageData,
                convertToMp4: mediaType === "audio" || mediaType === "video",
            }),
        });

        if (!response.ok) {
            console.error("Failed to download media:", response.status, await response.text());
            return null;
        }

        const result = await response.json();
        const base64 = result.base64;

        if (!base64) {
            console.log("No base64 in response");
            return null;
        }

        // Determine file extension
        let ext = "jpg";
        if (mediaType === "audio") ext = "mp3";
        else if (mediaType === "video") ext = "mp4";
        else if (mediaType === "document") {
            const fileName = messageData.message?.documentMessage?.fileName || "";
            ext = fileName.split(".").pop() || "pdf";
        }

        // Generate filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "chat");

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Decode and save
        const buffer = Buffer.from(base64, "base64");
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        return `/uploads/chat/${filename}`;
    } catch (error) {
        console.error("Error downloading media:", error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        console.log("Webhook recebido:", data.event, JSON.stringify(data).substring(0, 500));

        // Handle message status updates (READ receipts, DELIVERY_ACK, etc.)
        if (data.event === "messages.update") {
            const updates = Array.isArray(data.data) ? data.data : [data.data];

            for (const update of updates) {
                const msgId = update.key?.id || update.keyId || update.id;
                const status = update.status || update.update?.status;

                if (msgId && status) {
                    await updateMessageStatus(msgId, status.toLowerCase());
                }
            }

            return NextResponse.json({ status: "ok", tracked: updates.length });
        }

        // Handle incoming messages
        if (data.event === "messages.upsert" && data.data?.message) {
            const message = data.data.message;
            const remoteJid = data.data.key?.remoteJid;
            const fromMe = data.data.key?.fromMe;

            // Ignore our own messages
            if (fromMe) {
                return NextResponse.json({ status: "ignored", reason: "own_message" });
            }

            // Extract phone number
            const phoneNumber = remoteJid
                ?.replace("@s.whatsapp.net", "")
                ?.replace("@lid", "");

            if (!phoneNumber) {
                return NextResponse.json({ status: "ignored", reason: "no_phone" });
            }

            // Validate phone number format
            const cleanNumber = phoneNumber.replace(/\D/g, "");
            let isValidPhone = false;

            if (cleanNumber.startsWith("55")) {
                // Brazilian: 55 + DDD(2) + number(8-9) = 12-13 digits
                const localPart = cleanNumber.substring(2);
                isValidPhone = localPart.length === 10 || localPart.length === 11;
            } else {
                // International: 10-13 digits
                isValidPhone = cleanNumber.length >= 10 && cleanNumber.length <= 13;
            }

            if (!isValidPhone) {
                console.log("[Webhook] Ignorando número inválido:", phoneNumber, `(${cleanNumber.length} dígitos)`);
                return NextResponse.json({ status: "ignored", reason: "invalid_phone" });
            }

            // Get contact name if available
            const contactName = data.data.pushName || null;

            // Update or create conversation with contact name
            if (contactName) {
                await createOrUpdateConversation(phoneNumber, contactName);
            }

            // Check for media messages
            const imageMessage = message.imageMessage;
            const audioMessage = message.audioMessage;
            const videoMessage = message.videoMessage;
            const documentMessage = message.documentMessage;

            // Handle image message
            if (imageMessage) {
                const caption = imageMessage.caption || "";

                // Download image and save locally
                let mediaUrl = await downloadMediaFromEvolution(data.data, "image");

                // Save image message
                await addMessage(phoneNumber, caption || "[Imagem]", "in", {
                    messageId: data.data.key?.id,
                    mediaType: "image",
                    mediaUrl: mediaUrl,
                });

                // Process with bot if has caption
                if (caption) {
                    const result = await processIncomingMessage(phoneNumber, caption, data.data);
                    return NextResponse.json({ status: "processed", type: "image", ...result });
                }

                return NextResponse.json({ status: "saved", type: "image", hasMedia: !!mediaUrl });
            }

            // Handle audio message
            if (audioMessage) {
                let mediaUrl = await downloadMediaFromEvolution(data.data, "audio");

                await addMessage(phoneNumber, "[Áudio]", "in", {
                    messageId: data.data.key?.id,
                    mediaType: "audio",
                    mediaUrl: mediaUrl,
                });
                return NextResponse.json({ status: "saved", type: "audio", hasMedia: !!mediaUrl });
            }

            // Handle video message
            if (videoMessage) {
                const caption = videoMessage.caption || "";
                let mediaUrl = await downloadMediaFromEvolution(data.data, "video");

                await addMessage(phoneNumber, caption || "[Vídeo]", "in", {
                    messageId: data.data.key?.id,
                    mediaType: "video",
                    mediaUrl: mediaUrl,
                });
                return NextResponse.json({ status: "saved", type: "video", hasMedia: !!mediaUrl });
            }

            // Handle document message
            if (documentMessage) {
                const fileName = documentMessage.fileName || "Documento";
                let mediaUrl = await downloadMediaFromEvolution(data.data, "document");

                await addMessage(phoneNumber, `[Documento: ${fileName}]`, "in", {
                    messageId: data.data.key?.id,
                    mediaType: "document",
                    mediaUrl: mediaUrl,
                });
                return NextResponse.json({ status: "saved", type: "document", hasMedia: !!mediaUrl });
            }

            // Handle text message
            const text =
                message.conversation ||
                message.extendedTextMessage?.text ||
                "";

            if (phoneNumber && text) {
                const result = await processIncomingMessage(phoneNumber, text, data.data);
                return NextResponse.json({ status: "processed", ...result });
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: any) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Also accept GET for webhook verification
export async function GET(request: NextRequest) {
    return NextResponse.json({
        status: "ok",
        message: "WhatsApp Chat Webhook Endpoint",
        timestamp: new Date().toISOString(),
    });
}
