"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getShippingConfig() {
    try {
        let config = await prisma.shippingConfig.findFirst();

        if (!config) {
            config = await prisma.shippingConfig.create({
                data: {
                    id: "shipping-config",
                }
            });
        }

        return config;
    } catch (error) {
        console.error("Error fetching shipping config:", error);
        return null;
    }
}

export async function updateShippingConfig(prevState: any, formData: FormData) {
    try {
        const melhorEnvioEnabled = formData.get("melhorEnvioEnabled") === "true";
        const melhorEnvioEmail = formData.get("melhorEnvioEmail") as string;

        // Apenas atualiza enabled e email - o token é gerenciado pelo fluxo OAuth
        await prisma.shippingConfig.upsert({
            where: { id: "shipping-config" },
            update: {
                melhorEnvioEnabled,
                melhorEnvioEmail,
            },
            create: {
                id: "shipping-config",
                melhorEnvioEnabled,
                melhorEnvioEmail,
            }
        });

        revalidatePath("/admin/configuracoes/envio");
        revalidatePath("/admin/envios");
        return { success: true, message: "Configurações de envio atualizadas com sucesso!" };

    } catch (error) {
        console.error("Error updating shipping config:", error);
        return { success: false, message: "Erro ao salvar configurações." };
    }
}

/**
 * Gera a URL de autorização do Melhor Envio para o usuário abrir no navegador.
 */
export async function getMelhorEnvioAuthUrl() {
    const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
    const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;
    const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";

    if (!clientId || !redirectUri) {
        return { error: "MELHOR_ENVIO_CLIENT_ID e MELHOR_ENVIO_REDIRECT_URI não configurados no .env" };
    }

    const baseUrl = isSandbox
        ? "https://sandbox.melhorenvio.com.br"
        : "https://melhorenvio.com.br";

    const scopes = [
        "shipping-calculate",
        "shipping-cancel",
        "shipping-checkout",
        "shipping-companies",
        "shipping-generate",
        "shipping-preview",
        "shipping-print",
        "shipping-share",
        "shipping-tracking",
        "cart-read",
        "cart-write",
        "orders-read",
        "users-read",
    ].join(" ");

    const authUrl = new URL(`${baseUrl}/oauth/authorize`);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes);

    return { url: authUrl.toString() };
}

/**
 * Troca o código de autorização pelo token de acesso.
 * O usuário copia o código da URL após autorizar no Melhor Envio.
 */
export async function exchangeCodeForToken(code: string) {
    const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
    const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
    const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;
    const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";

    if (!clientId || !clientSecret || !redirectUri) {
        return { success: false, message: "Variáveis de ambiente do Melhor Envio não configuradas." };
    }

    const baseUrl = isSandbox
        ? "https://sandbox.melhorenvio.com.br"
        : "https://melhorenvio.com.br";

    try {
        const response = await fetch(`${baseUrl}/oauth/token`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "Neo Automacao CRM (contato@neoautomacao.com.br)",
            },
            body: JSON.stringify({
                grant_type: "authorization_code",
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                code,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Melhor Envio token error:", errorData);
            return {
                success: false,
                message: `Erro ao gerar token: ${errorData.message || errorData.error_description || response.statusText}`,
            };
        }

        const tokenData = await response.json();
        const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

        await prisma.shippingConfig.upsert({
            where: { id: "shipping-config" },
            update: {
                melhorEnvioToken: tokenData.access_token,
                melhorEnvioRefreshToken: tokenData.refresh_token,
                melhorEnvioTokenExpiresAt: expiresAt,
                melhorEnvioEnabled: true,
            },
            create: {
                id: "shipping-config",
                melhorEnvioToken: tokenData.access_token,
                melhorEnvioRefreshToken: tokenData.refresh_token,
                melhorEnvioTokenExpiresAt: expiresAt,
                melhorEnvioEnabled: true,
            },
        });

        revalidatePath("/admin/envios");
        return { success: true, message: "Token gerado com sucesso!" };
    } catch (error) {
        console.error("Exchange token error:", error);
        return { success: false, message: "Erro interno ao trocar código por token." };
    }
}
