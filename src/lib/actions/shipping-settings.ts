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
        const melhorEnvioToken = formData.get("melhorEnvioToken") as string;
        const melhorEnvioClientId = formData.get("melhorEnvioClientId") as string;
        const melhorEnvioEmail = formData.get("melhorEnvioEmail") as string;
        const melhorEnvioSandbox = formData.get("melhorEnvioSandbox") === "true";

        await prisma.shippingConfig.upsert({
            where: { id: "shipping-config" },
            update: {
                melhorEnvioEnabled,
                melhorEnvioToken,
                melhorEnvioClientId,
                melhorEnvioEmail,
                melhorEnvioSandbox
            },
            create: {
                id: "shipping-config",
                melhorEnvioEnabled,
                melhorEnvioToken,
                melhorEnvioClientId,
                melhorEnvioEmail,
                melhorEnvioSandbox
            }
        });

        revalidatePath("/admin/configuracoes/envio");
        return { success: true, message: "Configurações de envio atualizadas com sucesso!" };

    } catch (error) {
        console.error("Error updating shipping config:", error);
        return { success: false, message: "Erro ao salvar configurações." };
    }
}
