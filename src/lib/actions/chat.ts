"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// =============================================================================
// CHAT CONFIG ACTIONS
// =============================================================================

export async function getChatConfig() {
    const config = await prisma.chatConfig.findUnique({
        where: { id: "chat-config" },
    });

    if (!config) {
        // Create default config if not exists
        return await prisma.chatConfig.create({
            data: { id: "chat-config" },
        });
    }

    return {
        ...config,
        temperature: Number(config.temperature),
    };
}

export async function updateChatConfig(data: {
    evolutionUrl?: string;
    evolutionApiKey?: string;
    evolutionInstance?: string;
    aiProvider?: string;
    geminiApiKey?: string;
    openaiApiKey?: string;
    openaiModel?: string;
    temperature?: number;
    maxTokens?: number;
    companyName?: string;
    companyPhone?: string;
    companyEmail?: string;
    botEnabled?: boolean;
    systemPrompt?: string;
    instructions?: string;
    knowledgeBase?: string;
    welcomeMessage?: string;
    offHoursMessage?: string;
    transferMessage?: string;
    fallbackMessage?: string;
    errorMessage?: string;
    goodbyeMessage?: string;
    hoursEnabled?: boolean;
    hoursStart?: string;
    hoursEnd?: string;
    workingDays?: string[];
    messagesPerMinute?: number;
    conversationTimeout?: number;
    maxAiMessages?: number;
}) {
    const config = await prisma.chatConfig.upsert({
        where: { id: "chat-config" },
        update: {
            ...data,
            workingDays: data.workingDays ? JSON.stringify(data.workingDays) : undefined,
        },
        create: {
            id: "chat-config",
            ...data,
            workingDays: data.workingDays ? JSON.stringify(data.workingDays) : undefined,
        },
    });

    revalidatePath("/admin/chat");
    return {
        ...config,
        temperature: Number(config.temperature),
    };
}

export async function toggleBot() {
    const current = await getChatConfig();
    const updated = await prisma.chatConfig.update({
        where: { id: "chat-config" },
        data: { botEnabled: !current.botEnabled },
    });

    revalidatePath("/admin/chat");
    return updated.botEnabled;
}

// =============================================================================
// CONVERSATION ACTIONS
// =============================================================================

export async function getConversations(limit = 50) {
    const conversations = await prisma.chatConversation.findMany({
        orderBy: { updatedAt: "desc" },
        take: limit,
        include: {
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    return conversations.map((conv) => ({
        ...conv,
        lastMessage: conv.messages[0]?.content || null,
    }));
}

export async function getConversation(phoneNumber: string) {
    const conversation = await prisma.chatConversation.findUnique({
        where: { phoneNumber },
        include: {
            messages: {
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!conversation) return null;

    // Serialize dates for client components
    return {
        ...conversation,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        messages: conversation.messages.map((msg) => ({
            ...msg,
            createdAt: msg.createdAt.toISOString(),
        })),
    };
}

export async function createOrUpdateConversation(phoneNumber: string, name?: string) {
    const conversation = await prisma.chatConversation.upsert({
        where: { phoneNumber },
        update: {
            name: name || undefined,
            updatedAt: new Date(),
        },
        create: {
            phoneNumber,
            name,
        },
    });

    return conversation;
}

export async function updateConversationStatus(phoneNumber: string, status: string, stage?: string) {
    const conversation = await prisma.chatConversation.update({
        where: { phoneNumber },
        data: {
            status,
            stage: stage || undefined,
        },
    });

    revalidatePath("/admin/chat");
    return conversation;
}

export async function resumeBot(phoneNumber: string) {
    const conversation = await prisma.chatConversation.update({
        where: { phoneNumber },
        data: {
            status: "active",
            aiMessageCount: 0, // Reset AI message count
        },
    });

    revalidatePath("/admin/chat");
    return conversation;
}

// =============================================================================
// MESSAGE ACTIONS
// =============================================================================

export async function addMessage(
    phoneNumber: string,
    content: string,
    direction: "in" | "out",
    options?: {
        messageId?: string;
        isAiGenerated?: boolean;
        ruleName?: string;
        mediaType?: string;
        mediaUrl?: string;
    }
) {
    // Get or create conversation
    let conversation = await prisma.chatConversation.findUnique({
        where: { phoneNumber },
    });

    if (!conversation) {
        conversation = await prisma.chatConversation.create({
            data: { phoneNumber },
        });
    }

    // Create message
    const message = await prisma.chatMessage.create({
        data: {
            conversationId: conversation.id,
            content,
            direction,
            messageId: options?.messageId,
            isAiGenerated: options?.isAiGenerated || false,
            ruleName: options?.ruleName,
            mediaType: options?.mediaType,
            mediaUrl: options?.mediaUrl,
        },
    });

    // Update conversation stats
    await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: {
            messageCount: { increment: 1 },
            aiMessageCount: options?.isAiGenerated ? { increment: 1 } : undefined,
            updatedAt: new Date(),
        },
    });

    revalidatePath("/admin/chat");
    return message;
}

export async function updateMessageStatus(messageId: string, status: string) {
    const message = await prisma.chatMessage.updateMany({
        where: { messageId },
        data: { status },
    });

    return message;
}

// =============================================================================
// CHAT RULES ACTIONS
// =============================================================================

export async function getChatRules() {
    const rules = await prisma.chatRule.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return rules.map((rule) => ({
        ...rule,
        triggers: JSON.parse(rule.triggers || "[]"),
    }));
}

export async function createChatRule(data: {
    name: string;
    triggers: string[];
    matchExact?: boolean;
    stage?: string;
    action?: string;
    response?: string;
    followUp?: string;
    nextStage?: string;
}) {
    const rule = await prisma.chatRule.create({
        data: {
            name: data.name,
            triggers: JSON.stringify(data.triggers),
            matchExact: data.matchExact || false,
            stage: data.stage,
            action: data.action || "responder",
            response: data.response,
            followUp: data.followUp,
            nextStage: data.nextStage,
        },
    });

    revalidatePath("/admin/chat");
    return {
        ...rule,
        triggers: JSON.parse(rule.triggers),
    };
}

export async function updateChatRule(
    id: string,
    data: {
        name?: string;
        triggers?: string[];
        matchExact?: boolean;
        stage?: string | null;
        action?: string;
        response?: string;
        followUp?: string | null;
        nextStage?: string | null;
        isActive?: boolean;
        order?: number;
    }
) {
    const rule = await prisma.chatRule.update({
        where: { id },
        data: {
            ...data,
            triggers: data.triggers ? JSON.stringify(data.triggers) : undefined,
        },
    });

    revalidatePath("/admin/chat");
    return {
        ...rule,
        triggers: JSON.parse(rule.triggers),
    };
}

export async function deleteChatRule(id: string) {
    await prisma.chatRule.delete({
        where: { id },
    });

    revalidatePath("/admin/chat");
    return { success: true };
}

// =============================================================================
// STATS ACTIONS
// =============================================================================

export async function getChatStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
        totalConversations,
        conversationsToday,
        messagesToday,
        activeConversations,
    ] = await Promise.all([
        prisma.chatConversation.count(),
        prisma.chatConversation.count({
            where: { createdAt: { gte: today } },
        }),
        prisma.chatMessage.count({
            where: { createdAt: { gte: today } },
        }),
        prisma.chatConversation.count({
            where: { status: "active" },
        }),
    ]);

    return {
        totalConversations,
        conversationsToday,
        messagesToday,
        activeConversations,
    };
}

export async function getHourlyMetrics() {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const messages = await prisma.chatMessage.findMany({
        where: { createdAt: { gte: yesterday } },
        select: { createdAt: true },
    });

    // Group by hour
    const hourlyData: Record<string, number> = {};
    for (let i = 0; i < 24; i++) {
        hourlyData[i.toString().padStart(2, "0")] = 0;
    }

    messages.forEach((msg) => {
        const hour = msg.createdAt.getHours().toString().padStart(2, "0");
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

    return Object.entries(hourlyData).map(([hour, count]) => ({
        hour,
        count,
    }));
}

// =============================================================================
// EVOLUTION API INTEGRATION
// =============================================================================

export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
    const config = await getChatConfig();

    if (!config.evolutionUrl || !config.evolutionApiKey || !config.evolutionInstance) {
        throw new Error("Evolution API not configured. Configure URL, API Key e Instance Name nas configurações.");
    }

    // Validate phone number - must be numeric only
    let cleanNumber = phoneNumber.replace(/\D/g, "");

    // Check if it's a valid phone number format
    if (!cleanNumber || cleanNumber.length < 10 || !/^\d+$/.test(cleanNumber)) {
        throw new Error("Número de telefone inválido. Este contato não pode receber mensagens.");
    }

    // Brazilian numbers: 10-11 digits local, 12-13 with country code
    // International: up to 15 digits max
    if (cleanNumber.length > 15) {
        throw new Error("Número de telefone inválido (muito longo). Este contato não pode receber mensagens.");
    }

    // Ensure Brazilian number has country code (55)
    if (cleanNumber.length === 10 || cleanNumber.length === 11) {
        cleanNumber = "55" + cleanNumber;
    }

    // Validate that number with country code is reasonable (12-15 digits)
    if (cleanNumber.length < 12 || cleanNumber.length > 15) {
        throw new Error("Número de telefone com formato inválido. Este contato não pode receber mensagens.");
    }

    const baseUrl = config.evolutionUrl.replace(/\/$/, "");
    const url = `${baseUrl}/message/sendText/${config.evolutionInstance}`;

    console.log("[WhatsApp] Enviando mensagem para:", cleanNumber, "via", url);

    const requestBody = {
        number: cleanNumber,
        text: message,
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: config.evolutionApiKey,
            },
            body: JSON.stringify(requestBody),
        });

        const responseText = await response.text();
        console.log("[WhatsApp] Resposta da API:", response.status, responseText);

        if (!response.ok) {
            let errorMsg = "Erro ao enviar mensagem";
            try {
                const errorData = JSON.parse(responseText);
                // Check if it's a "number doesn't exist" error
                if (errorData.response?.message?.[0]?.exists === false) {
                    errorMsg = "Este número não existe no WhatsApp. Verifique se o contato está correto.";
                } else if (Array.isArray(errorData.message)) {
                    errorMsg = JSON.stringify(errorData.message);
                } else {
                    errorMsg = errorData.message || errorData.error || errorMsg;
                }
            } catch {
                errorMsg = responseText || errorMsg;
            }
            throw new Error(`Falha ao enviar (${response.status}): ${errorMsg}`);
        }

        const result = JSON.parse(responseText);

        // Check if the message was actually sent
        if (!result.key?.id && !result.messageId) {
            console.warn("[WhatsApp] Resposta sem messageId:", result);
        }

        // Save message to database
        await addMessage(phoneNumber, message, "out", {
            messageId: result.key?.id || result.messageId,
        });

        console.log("[WhatsApp] Mensagem enviada com sucesso. MessageId:", result.key?.id || result.messageId);
        return result;
    } catch (error: any) {
        console.error("[WhatsApp] Erro ao enviar mensagem:", error);

        // Check if it's a network/connection error
        if (error.message?.includes("fetch failed") || error.message?.includes("ECONNREFUSED")) {
            throw new Error("Não foi possível conectar à Evolution API. Verifique se a URL está correta e o servidor está rodando.");
        }

        throw error;
    }
}

export async function sendWhatsAppImage(phoneNumber: string, base64Image: string, caption?: string) {
    const config = await getChatConfig();

    if (!config.evolutionUrl || !config.evolutionApiKey || !config.evolutionInstance) {
        throw new Error("Evolution API not configured. Configure URL, API Key e Instance Name nas configurações.");
    }

    // Validate phone number
    let cleanNumber = phoneNumber.replace(/\D/g, "");
    if (!cleanNumber || cleanNumber.length < 10 || !/^\d+$/.test(cleanNumber)) {
        throw new Error("Número de telefone inválido. Este contato não pode receber imagens.");
    }

    // Check for invalid long numbers
    if (cleanNumber.length > 15) {
        throw new Error("Número de telefone inválido. Este contato não pode receber imagens.");
    }

    // Ensure Brazilian number has country code (55)
    if (cleanNumber.length === 10 || cleanNumber.length === 11) {
        cleanNumber = "55" + cleanNumber;
    }

    // Validate final number length
    if (cleanNumber.length < 12 || cleanNumber.length > 15) {
        throw new Error("Número com formato inválido. Este contato não pode receber imagens.");
    }

    const baseUrl = config.evolutionUrl.replace(/\/$/, "");
    const url = `${baseUrl}/message/sendMedia/${config.evolutionInstance}`;

    console.log("[WhatsApp] Enviando imagem para:", cleanNumber);

    // Remover prefixo data:image se existir (o base64 deve ser puro)
    let cleanBase64 = base64Image;
    if (base64Image.includes(",")) {
        cleanBase64 = base64Image.split(",")[1];
    }

    // Save image locally first
    let mediaUrl: string | null = null;
    try {
        const { writeFile, mkdir } = await import("fs/promises");
        const path = await import("path");

        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "chat");

        await mkdir(uploadDir, { recursive: true });

        const buffer = Buffer.from(cleanBase64, "base64");
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        mediaUrl = `/uploads/chat/${filename}`;
    } catch (error) {
        console.error("Error saving image locally:", error);
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: config.evolutionApiKey,
        },
        body: JSON.stringify({
            number: cleanNumber,
            mediatype: "image",
            media: cleanBase64,
            caption: caption || "",
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Evolution API error:", response.status, errorText);

        // Parse error for better message
        let errorMsg = "Erro ao enviar imagem";
        try {
            const errorData = JSON.parse(errorText);
            if (errorData.response?.message?.[0]?.exists === false) {
                errorMsg = "Este número não existe no WhatsApp.";
            } else if (errorData.message) {
                errorMsg = typeof errorData.message === "string" ? errorData.message : JSON.stringify(errorData.message);
            }
        } catch {
            if (response.status === 413) {
                errorMsg = "Imagem muito grande. Tente reduzir a resolução.";
            } else if (response.status === 400) {
                errorMsg = "Formato de imagem inválido ou número incorreto.";
            }
        }

        throw new Error(errorMsg);
    }

    const result = await response.json();

    // Save message to database with local mediaUrl
    await addMessage(phoneNumber, caption || "[Imagem]", "out", {
        messageId: result.key?.id,
        mediaType: "image",
        mediaUrl: mediaUrl,
    });

    return result;
}

// =============================================================================
// AI RESPONSE GENERATION
// =============================================================================

export async function processIncomingMessage(phoneNumber: string, text: string, messageData?: any) {
    const config = await getChatConfig();

    // Check if bot is enabled
    if (!config.botEnabled) {
        return { processed: false, reason: "bot_disabled" };
    }

    // Check operating hours
    if (config.hoursEnabled) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const workingDays = JSON.parse(config.workingDays || "[]");
        const dayNames = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
        const currentDay = dayNames[now.getDay()];

        if (!workingDays.includes(currentDay)) {
            if (config.offHoursMessage) {
                await sendWhatsAppMessage(phoneNumber, config.offHoursMessage);
            }
            return { processed: false, reason: "outside_hours" };
        }

        if (currentTime < config.hoursStart || currentTime > config.hoursEnd) {
            if (config.offHoursMessage) {
                await sendWhatsAppMessage(phoneNumber, config.offHoursMessage);
            }
            return { processed: false, reason: "outside_hours" };
        }
    }

    // Save incoming message
    await addMessage(phoneNumber, text, "in", {
        messageId: messageData?.key?.id,
    });

    // Get conversation state
    const conversation = await getConversation(phoneNumber);
    const currentStage = conversation?.stage || "inicio";

    // Check if waiting for human
    if (conversation?.status === "waiting_human") {
        return { processed: false, reason: "waiting_human" };
    }

    // Check message limit
    if (conversation && conversation.aiMessageCount >= config.maxAiMessages) {
        await updateConversationStatus(phoneNumber, "waiting_human");
        if (config.transferMessage) {
            await sendWhatsAppMessage(phoneNumber, config.transferMessage);
        }
        return { processed: false, reason: "ai_limit_reached" };
    }

    // Try to match a rule
    const rules = await getChatRules();
    const normalizedText = text.toLowerCase().trim();

    for (const rule of rules) {
        if (!rule.isActive) continue;

        // Check stage condition
        if (rule.stage && rule.stage !== currentStage) continue;

        // Check triggers
        const triggers = rule.triggers as string[];
        let matched = false;

        for (const trigger of triggers) {
            if (rule.matchExact) {
                if (normalizedText === trigger.toLowerCase()) {
                    matched = true;
                    break;
                }
            } else {
                if (normalizedText.includes(trigger.toLowerCase())) {
                    matched = true;
                    break;
                }
            }
        }

        if (matched) {
            // Execute action
            if (rule.action === "transferir_humano") {
                await updateConversationStatus(phoneNumber, "waiting_human", rule.nextStage || undefined);
                if (config.transferMessage) {
                    await sendWhatsAppMessage(phoneNumber, config.transferMessage);
                }
                return { processed: true, rule: rule.name, action: "transfer" };
            }

            if (rule.action === "finalizar") {
                await updateConversationStatus(phoneNumber, "closed", rule.nextStage || undefined);
                if (rule.response) {
                    await sendWhatsAppMessage(phoneNumber, rule.response);
                }
                return { processed: true, rule: rule.name, action: "close" };
            }

            if (rule.action === "salvar_nome") {
                await createOrUpdateConversation(phoneNumber, text);
            }

            // Send response
            if (rule.response) {
                await addMessage(phoneNumber, rule.response, "out", {
                    isAiGenerated: false,
                    ruleName: rule.name,
                });
                await sendWhatsAppMessage(phoneNumber, rule.response);
            }

            // Send follow-up
            if (rule.followUp) {
                await sendWhatsAppMessage(phoneNumber, rule.followUp);
            }

            // Update stage
            if (rule.nextStage) {
                await updateConversationStatus(phoneNumber, "active", rule.nextStage);
            }

            return { processed: true, rule: rule.name, action: rule.action };
        }
    }

    // No rule matched - use AI if configured
    if (config.aiProvider && (config.geminiApiKey || config.openaiApiKey)) {
        const aiResponse = await generateAIResponse(phoneNumber, text, config);
        if (aiResponse) {
            await addMessage(phoneNumber, aiResponse, "out", {
                isAiGenerated: true,
            });
            await sendWhatsAppMessage(phoneNumber, aiResponse);
            return { processed: true, ai: true };
        }
    }

    // Fallback message
    if (config.fallbackMessage) {
        await sendWhatsAppMessage(phoneNumber, config.fallbackMessage);
        return { processed: true, fallback: true };
    }

    return { processed: false, reason: "no_match" };
}

async function generateAIResponse(phoneNumber: string, text: string, config: any): Promise<string | null> {
    try {
        // Get conversation history
        const conversation = await getConversation(phoneNumber);
        const history = conversation?.messages.slice(-10) || [];

        const historyText = history
            .map((m) => `${m.direction === "in" ? "Cliente" : "Você"}: ${m.content}`)
            .join("\n");

        const systemPrompt = config.systemPrompt || `Você é um assistente virtual da empresa ${config.companyName || "nossa empresa"}.`;
        const instructions = config.instructions || "";
        const knowledge = config.knowledgeBase || "";

        const fullPrompt = `${systemPrompt}

${instructions}

${knowledge ? `## Base de Conhecimento\n${knowledge}\n` : ""}

## Histórico da Conversa
${historyText || "Início da conversa"}

## Mensagem Atual do Cliente
${text}

## Sua Resposta (seja objetivo e cordial):`;

        if (config.aiProvider === "gemini" && config.geminiApiKey) {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: fullPrompt }] }],
                        generationConfig: {
                            temperature: Number(config.temperature) || 0.7,
                            maxOutputTokens: config.maxTokens || 500,
                        },
                    }),
                }
            );

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        }

        if (config.aiProvider === "openai" && config.openaiApiKey) {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.openaiApiKey}`,
                },
                body: JSON.stringify({
                    model: config.openaiModel || "gpt-4o-mini",
                    messages: [
                        { role: "system", content: `${systemPrompt}\n\n${instructions}\n\n${knowledge}` },
                        ...history.map((m) => ({
                            role: m.direction === "in" ? "user" : "assistant",
                            content: m.content,
                        })),
                        { role: "user", content: text },
                    ],
                    temperature: Number(config.temperature) || 0.7,
                    max_tokens: config.maxTokens || 500,
                }),
            });

            const data = await response.json();
            return data.choices?.[0]?.message?.content || null;
        }

        return null;
    } catch (error) {
        console.error("AI generation error:", error);
        return config.errorMessage || null;
    }
}

// =============================================================================
// SIMULATION (for testing)
// =============================================================================

export async function simulateMessage(message: string, stage: string = "inicio") {
    const config = await getChatConfig();
    const rules = await getChatRules();
    const normalizedText = message.toLowerCase().trim();

    // Try to match a rule
    for (const rule of rules) {
        if (!rule.isActive) continue;

        // Check stage condition
        if (rule.stage && rule.stage !== stage) continue;

        // Check triggers
        const triggers = rule.triggers as string[];
        let matched = false;

        for (const trigger of triggers) {
            if (rule.matchExact) {
                if (normalizedText === trigger.toLowerCase()) {
                    matched = true;
                    break;
                }
            } else {
                if (normalizedText.includes(trigger.toLowerCase())) {
                    matched = true;
                    break;
                }
            }
        }

        if (matched) {
            return {
                resposta: rule.response || "",
                regra: rule.name,
                acao: rule.action,
                proxima_etapa: rule.nextStage,
                followUp: rule.followUp,
                usou_ia: false,
            };
        }
    }

    // No rule matched - simulate AI response
    if (config.aiProvider && (config.geminiApiKey || config.openaiApiKey)) {
        return {
            resposta: "[Resposta da IA seria gerada aqui]",
            regra: null,
            acao: "responder",
            proxima_etapa: stage,
            followUp: null,
            usou_ia: true,
        };
    }

    return {
        resposta: config.fallbackMessage || "Desculpe, não entendi sua mensagem.",
        regra: null,
        acao: "responder",
        proxima_etapa: stage,
        followUp: null,
        usou_ia: false,
    };
}

// =============================================================================
// EVOLUTION API SYNC - Import conversations and messages
// =============================================================================

export async function syncEvolutionChats() {
    const config = await getChatConfig();

    if (!config.evolutionUrl || !config.evolutionApiKey || !config.evolutionInstance) {
        throw new Error("Evolution API not configured");
    }

    const baseUrl = config.evolutionUrl.replace(/\/$/, "");

    // Fetch all chats from Evolution API
    const chatsResponse = await fetch(
        `${baseUrl}/chat/findChats/${config.evolutionInstance}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: config.evolutionApiKey,
            },
            body: JSON.stringify({}),
        }
    );

    if (!chatsResponse.ok) {
        const error = await chatsResponse.text();
        throw new Error(`Failed to fetch chats: ${error}`);
    }

    const chats = await chatsResponse.json();
    let importedCount = 0;
    let messagesCount = 0;

    // Process each chat
    for (const chat of chats) {
        const remoteJid = chat.id || chat.remoteJid;
        if (!remoteJid || remoteJid.includes("@g.us")) continue; // Skip groups

        // Remove both @s.whatsapp.net and @lid suffixes
        const phoneNumber = remoteJid
            .replace("@s.whatsapp.net", "")
            .replace("@lid", "");

        // Get contact name from various sources
        const contactName = chat.pushName || chat.name || chat.notifyName || null;

        // STRICT VALIDATION: Only import valid phone numbers
        const cleanNumber = phoneNumber.replace(/\D/g, "");

        // Validate phone number format
        let isValidPhone = false;

        if (cleanNumber.startsWith("55")) {
            // Brazilian number: 55 + DDD(2) + number(8-9) = 12-13 digits
            const localPart = cleanNumber.substring(2);
            isValidPhone = localPart.length === 10 || localPart.length === 11;
        } else {
            // International: 10-15 digits, but not suspicious patterns
            isValidPhone = cleanNumber.length >= 10 && cleanNumber.length <= 13;
        }

        // Skip invalid numbers - they can't receive messages anyway
        if (!isValidPhone) {
            console.log(`[Sync] Ignorando número inválido: ${phoneNumber} (${cleanNumber.length} dígitos)`);
            continue;
        }

        // Create or update conversation
        await prisma.chatConversation.upsert({
            where: { phoneNumber },
            update: { name: contactName || undefined },
            create: { phoneNumber, name: contactName },
        });

        // Fetch messages for this chat
        try {
            const msgsResponse = await fetch(
                `${baseUrl}/chat/findMessages/${config.evolutionInstance}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        apikey: config.evolutionApiKey,
                    },
                    body: JSON.stringify({
                        where: { key: { remoteJid } },
                        limit: 50,
                    }),
                }
            );

            if (msgsResponse.ok) {
                const msgsData = await msgsResponse.json();
                const messages = Array.isArray(msgsData)
                    ? msgsData
                    : msgsData.messages || msgsData.records || [];

                // Get conversation
                const conversation = await prisma.chatConversation.findUnique({
                    where: { phoneNumber },
                });

                if (conversation) {
                    for (const msg of messages) {
                        const messageId = msg.key?.id;
                        const fromMe = msg.key?.fromMe;
                        const content =
                            msg.message?.conversation ||
                            msg.message?.extendedTextMessage?.text ||
                            msg.message?.imageMessage?.caption ||
                            "[Media]";
                        const timestamp = msg.messageTimestamp
                            ? new Date(Number(msg.messageTimestamp) * 1000)
                            : new Date();

                        // Check if message already exists
                        const exists = await prisma.chatMessage.findFirst({
                            where: { messageId },
                        });

                        if (!exists && messageId) {
                            await prisma.chatMessage.create({
                                data: {
                                    conversationId: conversation.id,
                                    content,
                                    direction: fromMe ? "out" : "in",
                                    messageId,
                                    createdAt: timestamp,
                                },
                            });
                            messagesCount++;
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`Error fetching messages for ${phoneNumber}:`, e);
        }

        importedCount++;
    }

    // Cleanup invalid LID conversations first
    const allConvs = await prisma.chatConversation.findMany();
    let cleanedCount = 0;
    for (const conv of allConvs) {
        const isValidPhone = /^\d{10,15}$/.test(conv.phoneNumber);
        if (!isValidPhone && !conv.name) {
            await prisma.chatMessage.deleteMany({ where: { conversationId: conv.id } });
            await prisma.chatConversation.delete({ where: { id: conv.id } });
            cleanedCount++;
        }
    }
    console.log(`Cleaned up ${cleanedCount} invalid conversations`);

    // Update message counts and set updatedAt based on last message
    const allConversations = await prisma.chatConversation.findMany();
    for (const conv of allConversations) {
        const count = await prisma.chatMessage.count({
            where: { conversationId: conv.id },
        });
        // Get the last message to set proper updatedAt
        const lastMessage = await prisma.chatMessage.findFirst({
            where: { conversationId: conv.id },
            orderBy: { createdAt: "desc" },
        });
        await prisma.chatConversation.update({
            where: { id: conv.id },
            data: {
                messageCount: count,
                updatedAt: lastMessage?.createdAt || conv.updatedAt,
            },
        });
    }

    revalidatePath("/admin/chat");

    return {
        success: true,
        importedChats: importedCount,
        importedMessages: messagesCount,
    };
}

export async function cleanupInvalidConversations() {
    // Delete conversations that are LIDs (non-numeric IDs) without names
    const conversations = await prisma.chatConversation.findMany();

    let deletedCount = 0;
    for (const conv of conversations) {
        // Check if phoneNumber is valid (10-15 digits only)
        const isValidPhone = /^\d{10,15}$/.test(conv.phoneNumber);

        // Delete if: not a valid phone number AND has no name
        if (!isValidPhone && !conv.name) {
            // Delete messages first
            await prisma.chatMessage.deleteMany({
                where: { conversationId: conv.id },
            });
            // Delete conversation
            await prisma.chatConversation.delete({
                where: { id: conv.id },
            });
            deletedCount++;
        }
    }

    revalidatePath("/admin/chat");
    return { deletedCount };
}

export async function configureEvolutionWebhook(webhookUrl: string) {
    const config = await getChatConfig();

    if (!config.evolutionUrl || !config.evolutionApiKey || !config.evolutionInstance) {
        throw new Error("Evolution API not configured");
    }

    const baseUrl = config.evolutionUrl.replace(/\/$/, "");

    // Configure webhook
    const response = await fetch(`${baseUrl}/webhook/set/${config.evolutionInstance}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: config.evolutionApiKey,
        },
        body: JSON.stringify({
            url: webhookUrl,
            enabled: true,
            events: [
                "MESSAGES_UPSERT",
                "MESSAGES_UPDATE",
                "SEND_MESSAGE",
                "CONNECTION_UPDATE",
            ],
            webhookByEvents: false,
            webhookBase64: false,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to configure webhook: ${error}`);
    }

    return await response.json();
}

export async function getEvolutionConnectionStatus() {
    const config = await getChatConfig();

    if (!config.evolutionUrl || !config.evolutionApiKey || !config.evolutionInstance) {
        return { connected: false, error: "Not configured" };
    }

    try {
        const baseUrl = config.evolutionUrl.replace(/\/$/, "");
        const response = await fetch(
            `${baseUrl}/instance/connectionState/${config.evolutionInstance}`,
            {
                headers: { apikey: config.evolutionApiKey },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[WhatsApp] Connection status error:", response.status, errorText);
            return { connected: false, error: `API Error: ${response.status}` };
        }

        const data = await response.json();
        console.log("[WhatsApp] Connection state:", data);
        return {
            connected: data.state === "open" || data.instance?.state === "open",
            state: data.state || data.instance?.state,
        };
    } catch (error: any) {
        console.error("[WhatsApp] Connection check error:", error);
        return { connected: false, error: error.message };
    }
}

// Função de diagnóstico para verificar problemas
export async function diagnoseWhatsAppConnection() {
    const config = await getChatConfig();
    const result = {
        configured: false,
        evolutionUrl: null as string | null,
        evolutionInstance: null as string | null,
        hasApiKey: false,
        connectionStatus: null as any,
        testMessageResult: null as string | null,
    };

    // Check configuration
    result.evolutionUrl = config.evolutionUrl || null;
    result.evolutionInstance = config.evolutionInstance || null;
    result.hasApiKey = !!config.evolutionApiKey;
    result.configured = !!(config.evolutionUrl && config.evolutionApiKey && config.evolutionInstance);

    if (!result.configured) {
        return {
            ...result,
            error: "Evolution API não configurada. Configure URL, API Key e Instance Name nas configurações.",
        };
    }

    // Check connection status
    try {
        const connectionStatus = await getEvolutionConnectionStatus();
        result.connectionStatus = connectionStatus;

        if (!connectionStatus.connected) {
            return {
                ...result,
                error: `WhatsApp não conectado. Status: ${connectionStatus.state || "desconhecido"}. Escaneie o QR Code na Evolution API.`,
            };
        }
    } catch (error: any) {
        return {
            ...result,
            error: `Erro ao verificar conexão: ${error.message}`,
        };
    }

    return {
        ...result,
        success: true,
        message: "Evolution API configurada e WhatsApp conectado!",
    };
}
