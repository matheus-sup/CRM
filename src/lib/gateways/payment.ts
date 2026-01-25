export async function processPayment(
    order: {
        id: string;
        code: number;
        total: number;
        customer: { name: string; email?: string; document?: string };
    },
    method: string
) {
    // START MOCK IMPLEMENTATION
    console.log(`[Creating Payment] Order #${order.code} via ${method}`);

    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (method === 'pix') {
        return {
            success: true,
            status: "PENDING", // Pix starts as pending waiting for payment
            gatewayId: `mock_pix_${order.id}`,
            pixPayload: "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913GUT COSMETICOS6008SAO PAULO62070503***6304ABCD",
            qrCodeImage: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Rickrolling_QR_code.png" // Joke/Placeholder
        };
    }

    if (method === 'card') {
        return {
            success: true,
            status: "PAID", // Card usually approves immediately in mock
            gatewayId: `mock_card_${order.id}`,
            authorizationCode: "123456"
        };
    }

    return {
        success: false,
        message: "Método de pagamento não suportado."
    };
}
