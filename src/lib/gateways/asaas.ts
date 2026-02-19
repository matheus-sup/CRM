import { getStoreConfig } from "@/lib/actions/settings";

const ASAAS_API_URL = process.env.ASAAS_ENV === "production"
    ? "https://www.asaas.com/api/v3"
    : "https://sandbox.asaas.com/api/v3";

async function getHeaders() {
    const config = await getStoreConfig();
    const apiKey = await import("@/lib/prisma").then(m => m.prisma.paymentConfig.findUnique({
        where: { id: "payment-config" }
    })).then(c => c?.asaasApiKey);

    if (!apiKey) {
        throw new Error("Asaas API Key não configurada.");
    }

    return {
        "Content-Type": "application/json",
        "access_token": apiKey
    };
}

export async function createAsaasCustomer(customerData: { name: string; email?: string; cpfCnpj?: string; phone?: string; externalId: string }) {
    try {
        const headers = await getHeaders();

        // 1. Check if customer exists by email or externalReference
        // Ideally we should store asaasId in our DB. For now, let's search or create.

        const res = await fetch(`${ASAAS_API_URL}/customers`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                name: customerData.name,
                email: customerData.email,
                cpfCnpj: customerData.cpfCnpj,
                mobilePhone: customerData.phone,
                externalReference: customerData.externalId,
                notificationDisabled: false
            })
        });

        const data = await res.json();

        if (data.errors) {
            // Check if email already exists error, then search
            if (data.errors[0].code === 'jz4') { // Email in use
                const search = await fetch(`${ASAAS_API_URL}/customers?email=${customerData.email}`, { headers });
                const searchData = await search.json();
                if (searchData.data && searchData.data.length > 0) {
                    return searchData.data[0].id;
                }
            }
            throw new Error(data.errors[0].description);
        }

        return data.id;
    } catch (e: any) {
        console.error("Asaas Create Customer Error:", e);
        throw new Error("Erro ao criar cliente no Asaas: " + e.message);
    }
}

export async function createPixCharge(orderId: string, value: number, customerAsaasId: string) {
    try {
        const headers = await getHeaders();

        const res = await fetch(`${ASAAS_API_URL}/payments`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                customer: customerAsaasId,
                billingType: "PIX",
                value: value,
                dueDate: new Date().toISOString().split('T')[0], // Due today
                externalReference: orderId,
                description: `Pedido #${orderId}`
            })
        });

        const data = await res.json();
        if (data.errors) throw new Error(data.errors[0].description);

        // Get QR Code
        const qrRes = await fetch(`${ASAAS_API_URL}/payments/${data.id}/pixQrCode`, { headers });
        const qrData = await qrRes.json();

        return {
            paymentId: data.id,
            encodedImage: qrData.encodedImage,
            payload: qrData.payload,
            expirationDate: qrData.expirationDate
        };

    } catch (e: any) {
        console.error("Asaas Pix Error:", e);
        throw new Error("Erro ao gerar Pix Asaas.");
    }
}

export async function createCreditCardCharge(
    orderId: string,
    value: number,
    customerAsaasId: string,
    cardInfo: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
    },
    remoteIp: string
) {
    try {
        const headers = await getHeaders();

        const res = await fetch(`${ASAAS_API_URL}/payments`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                customer: customerAsaasId,
                billingType: "CREDIT_CARD",
                value: value,
                dueDate: new Date().toISOString().split('T')[0],
                externalReference: orderId,
                description: `Pedido #${orderId}`,
                creditCard: {
                    holderName: cardInfo.holderName,
                    number: cardInfo.number,
                    expiryMonth: cardInfo.expiryMonth,
                    expiryYear: cardInfo.expiryYear,
                    ccv: cardInfo.ccv
                },
                creditCardHolderInfo: {
                    name: cardInfo.holderName,
                    email: "email@placeholder.com", // Asaas requires this, but we might not have it in the cardInfo object directly
                    cpfCnpj: "00000000000", // Required if not on customer? Asaas usually needs valid data.
                    postalCode: "00000000",
                    addressNumber: "0",
                    mobilePhone: "00000000000"
                },
                remoteIp: remoteIp
            })
        });

        const data = await res.json();
        if (data.errors) throw new Error(data.errors[0].description);

        return {
            paymentId: data.id,
            status: data.status,
            gatewayId: data.id
        };

    } catch (e: any) {
        console.error("Asaas Card Error:", e);
        throw new Error("Erro ao processar cartão Asaas: " + e.message);
    }
}
