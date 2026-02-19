import { prisma } from "@/lib/prisma";
import { createAsaasCustomer, createPixCharge, createCreditCardCharge } from "./asaas";

export async function processPayment(
    order: {
        id: string;
        code: number;
        total: number;
        customer: { name: string; email?: string; document?: string; phone?: string };
    },
    method: string,
    cardInfo?: any
) {
    // 1. Get Payment Config
    const config = await prisma.paymentConfig.findUnique({ where: { id: "payment-config" } });

    // Fallback to Mock if not configured or disabled
    if (!config?.asaasEnabled) {
        console.log(`[Mock Payment] processing ${method} for order #${order.code}`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (method === 'pix') {
            return {
                success: true,
                status: "PENDING",
                gatewayId: `mock_pix_${order.id}`,
                pixPayload: "00020126580014BR.GOV.BCB.PIX0136123e...mock",
                qrCodeImage: "https://via.placeholder.com/300?text=QR+Code+Mock"
            };
        }
        if (method === 'card') {
            return {
                success: true,
                status: "PAID",
                gatewayId: `mock_card_${order.id}`,
                authorizationCode: "123456"
            };
        }
        return { success: false, message: "Método não suportado (Mock)." };
    }

    // 2. Real Implementation (Asaas)
    try {
        // Create/Get Customer in Asaas
        // We use the Order ID as external reference for the customer? No, usually customer ID.
        // But order.customer might not have ID passed here easily if we didn't query it. 
        // Let's use order.id as external ref for simplicity or the customer document.
        const asaasCustomerId = await createAsaasCustomer({
            name: order.customer.name,
            email: order.customer.email,
            cpfCnpj: order.customer.document,
            phone: order.customer.phone,
            externalId: `cust_${order.id}` // Ideally actual customer ID
        });

        if (method === 'pix') {
            const pix = await createPixCharge(order.id, order.total, asaasCustomerId);
            return {
                success: true,
                status: "PENDING",
                gatewayId: pix.paymentId,
                pixPayload: pix.payload,
                qrCodeImage: pix.encodedImage
            };
        }

        if (method === 'card') {
            if (!cardInfo) return { success: false, message: "Dados do cartão obrigatórios." };

            const card = await createCreditCardCharge(order.id, order.total, asaasCustomerId, cardInfo, "127.0.0.1");
            return {
                success: true,
                status: card.status === 'CONFIRMED' || card.status === 'RECEIVED' ? 'PAID' : 'PENDING',
                gatewayId: card.paymentId
            };
        }

        return { success: false, message: "Método não suportado pelo Asaas." };

    } catch (error: any) {
        console.error("Payment Gateway Error:", error);
        return { success: false, message: error.message || "Erro no processamento do pagamento." };
    }
}
