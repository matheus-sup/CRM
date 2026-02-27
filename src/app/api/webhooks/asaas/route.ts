import { NextRequest, NextResponse } from "next/server";
import { processAsaasWebhook } from "@/lib/actions/subscription";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log("Asaas Webhook received:", body.event, body.payment?.id);

        // Process the webhook
        const result = await processAsaasWebhook(body.event, body.payment);

        return NextResponse.json({ received: true, ...result });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json(
            { error: error.message || "Webhook processing failed" },
            { status: 500 }
        );
    }
}

// Asaas also sends GET requests to verify the webhook URL
export async function GET() {
    return NextResponse.json({ status: "ok" });
}
