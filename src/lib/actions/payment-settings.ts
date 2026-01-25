"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPaymentConfig() {
    try {
        let config = await prisma.paymentConfig.findFirst();

        if (!config) {
            config = await prisma.paymentConfig.create({
                data: {
                    id: "payment-config", // Singleton ID
                }
            });
        }

        return config;
    } catch (error) {
        console.error("Error fetching payment config:", error);
        return null;
    }
}

export async function updatePaymentConfig(prevState: any, formData: FormData) {
    try {
        // Parse Booleans
        const pagarmeEnabled = formData.get("pagarmeEnabled") === "true";
        const asaasEnabled = formData.get("asaasEnabled") === "true";
        const manualPixEnabled = formData.get("manualPixEnabled") === "true";

        // Pagar.me
        const pagarmeApiKey = formData.get("pagarmeApiKey") as string;

        // Asaas
        const asaasApiKey = formData.get("asaasApiKey") as string;
        const asaasWalletId = formData.get("asaasWalletId") as string;

        // Manual Pix
        const pixKey = formData.get("pixKey") as string;
        const pixHolder = formData.get("pixHolder") as string;
        const pixBank = formData.get("pixBank") as string;

        // Credit Card
        const maxInstallments = parseInt(formData.get("maxInstallments") as string || "12");
        const minInstallmentValue = parseFloat((formData.get("minInstallmentValue") as string || "5").replace(",", "."));
        const interestRate = parseFloat((formData.get("interestRate") as string || "0").replace(",", "."));

        await prisma.paymentConfig.upsert({
            where: { id: "payment-config" },
            update: {
                pagarmeEnabled,
                pagarmeApiKey,
                asaasEnabled,
                asaasApiKey,
                asaasWalletId,
                manualPixEnabled,
                pixKey,
                pixHolder,
                pixBank,
                maxInstallments,
                minInstallmentValue,
                interestRate
            },
            create: {
                id: "payment-config",
                pagarmeEnabled,
                pagarmeApiKey,
                asaasEnabled,
                asaasApiKey,
                asaasWalletId,
                manualPixEnabled,
                pixKey,
                pixHolder,
                pixBank,
                maxInstallments,
                minInstallmentValue,
                interestRate
            }
        });

        revalidatePath("/admin/configuracoes/pagamentos");
        return { success: true, message: "Configurações de pagamento atualizadas com sucesso!" };

    } catch (error) {
        console.error("Error updating payment config:", error);
        return { success: false, message: "Erro ao salvar configurações." };
    }
}
