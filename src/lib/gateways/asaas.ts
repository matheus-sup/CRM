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
                notificationDisabled: true // Desabilita SMS/email do Asaas
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
                description: `Pedido #${orderId}`,
                notificationDisabled: true // Desabilita SMS/email do Asaas
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

// =============================================
// Subscription Functions (for SaaS Plans)
// =============================================

export async function createSubscription(
    customerAsaasId: string,
    value: number,
    billingType: "PIX" | "CREDIT_CARD" | "BOLETO",
    description: string,
    externalReference: string,
    creditCard?: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
    },
    creditCardHolderInfo?: {
        name: string;
        email: string;
        cpfCnpj: string;
        postalCode: string;
        addressNumber: string;
        phone: string;
    },
    remoteIp?: string
) {
    try {
        const headers = await getHeaders();

        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + 1); // Starts tomorrow

        const body: any = {
            customer: customerAsaasId,
            billingType: billingType,
            value: value,
            nextDueDate: nextDueDate.toISOString().split('T')[0],
            cycle: "MONTHLY",
            description: description,
            externalReference: externalReference,
            notificationDisabled: true, // Desabilita SMS/email do Asaas
        };

        // If credit card, add card info
        if (billingType === "CREDIT_CARD" && creditCard && creditCardHolderInfo) {
            body.creditCard = creditCard;
            body.creditCardHolderInfo = creditCardHolderInfo;
            if (remoteIp) body.remoteIp = remoteIp;
        }

        const res = await fetch(`${ASAAS_API_URL}/subscriptions`, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (data.errors) throw new Error(data.errors[0].description);

        return {
            subscriptionId: data.id,
            status: data.status,
            nextDueDate: data.nextDueDate,
            value: data.value
        };

    } catch (e: any) {
        console.error("Asaas Subscription Error:", e);
        throw new Error("Erro ao criar assinatura: " + e.message);
    }
}

export async function getSubscription(subscriptionId: string) {
    try {
        const headers = await getHeaders();
        const res = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionId}`, { headers });
        const data = await res.json();
        if (data.errors) throw new Error(data.errors[0].description);
        return data;
    } catch (e: any) {
        console.error("Asaas Get Subscription Error:", e);
        throw new Error("Erro ao buscar assinatura: " + e.message);
    }
}

export async function getSubscriptionPayments(subscriptionId: string) {
    try {
        const headers = await getHeaders();
        const res = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionId}/payments`, { headers });
        const data = await res.json();
        if (data.errors) throw new Error(data.errors[0].description);
        return data.data || [];
    } catch (e: any) {
        console.error("Asaas Get Subscription Payments Error:", e);
        throw new Error("Erro ao buscar pagamentos: " + e.message);
    }
}

export async function getPixQrCode(paymentId: string) {
    try {
        const headers = await getHeaders();
        const res = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`, { headers });
        const data = await res.json();
        if (data.errors) throw new Error(data.errors[0].description);
        return {
            encodedImage: data.encodedImage,
            payload: data.payload,
            expirationDate: data.expirationDate
        };
    } catch (e: any) {
        console.error("Asaas Get Pix QR Code Error:", e);
        throw new Error("Erro ao buscar QR Code PIX: " + e.message);
    }
}

export async function cancelSubscription(subscriptionId: string) {
    try {
        const headers = await getHeaders();
        const res = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionId}`, {
            method: "DELETE",
            headers
        });
        const data = await res.json();
        if (data.errors) throw new Error(data.errors[0].description);
        return { success: true, deleted: data.deleted };
    } catch (e: any) {
        console.error("Asaas Cancel Subscription Error:", e);
        throw new Error("Erro ao cancelar assinatura: " + e.message);
    }
}

export async function getPaymentStatus(paymentId: string) {
    try {
        const headers = await getHeaders();
        const res = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, { headers });
        const data = await res.json();
        if (data.errors) throw new Error(data.errors[0].description);
        return {
            id: data.id,
            status: data.status,
            value: data.value,
            billingType: data.billingType
        };
    } catch (e: any) {
        console.error("Asaas Get Payment Error:", e);
        throw new Error("Erro ao buscar pagamento: " + e.message);
    }
}

// =============================================
// Standard Payment Functions
// =============================================

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
                notificationDisabled: true, // Desabilita SMS/email do Asaas
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
