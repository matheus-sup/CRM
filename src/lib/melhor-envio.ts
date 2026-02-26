import { prisma } from "@/lib/prisma";

/**
 * Retorna a base URL do Melhor Envio (sandbox ou produção)
 */
export function getMelhorEnvioBaseUrl(): string {
    const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
    return isSandbox
        ? "https://sandbox.melhorenvio.com.br"
        : "https://melhorenvio.com.br";
}

/**
 * Obtém um token válido, renovando automaticamente se necessário.
 * Retorna null se não houver token configurado.
 */
export async function getMelhorEnvioToken(): Promise<string | null> {
    const config = await prisma.shippingConfig.findFirst();

    if (!config?.melhorEnvioToken) {
        return null;
    }

    // Verificar se o token está próximo de expirar (renova 1 dia antes)
    if (config.melhorEnvioTokenExpiresAt && config.melhorEnvioRefreshToken) {
        const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

        if (config.melhorEnvioTokenExpiresAt < oneDayFromNow) {
            const newToken = await refreshToken(config.melhorEnvioRefreshToken);
            if (newToken) {
                return newToken;
            }
        }
    }

    return config.melhorEnvioToken;
}

/**
 * Renova o access token usando o refresh token
 */
async function refreshToken(refreshToken: string): Promise<string | null> {
    const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
    const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
    const baseUrl = getMelhorEnvioBaseUrl();

    if (!clientId || !clientSecret) {
        console.error("Melhor Envio: CLIENT_ID ou CLIENT_SECRET não configurados");
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}/oauth/token`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "CRM App (contato@crm.com)",
            },
            body: JSON.stringify({
                grant_type: "refresh_token",
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            console.error("Melhor Envio: Erro ao renovar token", await response.text());
            return null;
        }

        const data = await response.json();
        const expiresAt = new Date(Date.now() + data.expires_in * 1000);

        // Atualizar tokens no banco
        await prisma.shippingConfig.update({
            where: { id: "shipping-config" },
            data: {
                melhorEnvioToken: data.access_token,
                melhorEnvioRefreshToken: data.refresh_token,
                melhorEnvioTokenExpiresAt: expiresAt,
            },
        });

        return data.access_token;
    } catch (error) {
        console.error("Melhor Envio: Erro ao renovar token", error);
        return null;
    }
}

/**
 * Headers padrão para requisições à API do Melhor Envio
 */
export function getMelhorEnvioHeaders(token: string) {
    return {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "User-Agent": "CRM App (contato@crm.com)",
    };
}
