"use server";

import { prisma } from "@/lib/prisma";
import { getMelhorEnvioToken, getMelhorEnvioBaseUrl, getMelhorEnvioHeaders } from "@/lib/melhor-envio";

interface ShippingDimensions {
    weight: number;  // kg
    height: number;  // cm
    width: number;   // cm
    length: number;  // cm
}

interface ShippingQuote {
    name: string;
    company: string;
    price: string;
    delivery_time: number;
    error?: string;
}

export async function calculateShipping(
    cepDestino: string,
    dimensions: ShippingDimensions,
    cepOrigem?: string
) {
    try {
        const config = await prisma.shippingConfig.findFirst();

        if (!config?.melhorEnvioEnabled) {
            return { error: "Cálculo de frete desativado." };
        }

        const token = await getMelhorEnvioToken();

        if (!token) {
            return { error: "Token do Melhor Envio não configurado." };
        }

        const baseUrl = getMelhorEnvioBaseUrl();
        const headers = getMelhorEnvioHeaders(token);

        // Valores mínimos exigidos pela API
        const weight = Math.max(dimensions.weight || 0.3, 0.3);
        const height = Math.max(dimensions.height || 2, 2);
        const width = Math.max(dimensions.width || 11, 11);
        const length = Math.max(dimensions.length || 16, 16);

        const payload = {
            from: { postal_code: cepOrigem || "01001000" },
            to: { postal_code: cepDestino.replace(/\D/g, "") },
            products: [
                {
                    id: "1",
                    width,
                    height,
                    length,
                    weight,
                    insurance_value: 0,
                    quantity: 1,
                },
            ],
        };

        const response = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Melhor Envio API error:", response.status, errorText);
            return { error: "Erro ao consultar transportadoras." };
        }

        const data = await response.json();

        // Mapeamento de nomes amigáveis (por nome do serviço)
        const nameMap: Record<string, string> = {
            ".Package": "JadLog Econômico",
            ".Com": "JadLog Express",
            "PAC": "Correios PAC",
            "SEDEX": "Correios Sedex",
        };

        // Mapeamento por transportadora + nome do serviço (chaves em lowercase)
        const companyNameMap: Record<string, Record<string, string>> = {
            "loggi": { "Express": "Loggi Express" },
            "buslog": { "Rodoviário": "Buslog Rodoviário" },
            "jet": { "Standard": "JeT Standard" },
            "correios": { "Mini Envios": "Correios Mini Envios" },
        };

        const mapServiceName = (name: string, company: string) => {
            return companyNameMap[company.toLowerCase()]?.[name] || nameMap[name] || name;
        };

        // Filtrar e formatar resultados válidos
        const quotes: ShippingQuote[] = data
            .filter((item: any) => !item.error && item.price)
            .map((item: any) => ({
                name: mapServiceName(item.name, item.company?.name || ""),
                company: item.company?.name || "",
                price: parseFloat(item.price).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }),
                delivery_time: item.delivery_time,
            }));

        if (quotes.length === 0) {
            return { error: "Nenhuma transportadora disponível para este CEP." };
        }

        return { quotes };
    } catch (error) {
        console.error("Shipping calc error:", error);
        return { error: "Erro ao consultar transportadoras." };
    }
}
