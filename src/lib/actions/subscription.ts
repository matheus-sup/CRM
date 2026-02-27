"use server";

import { prisma } from "@/lib/prisma";
import {
    createAsaasCustomer,
    createSubscription as createAsaasSubscription,
    getSubscription as getAsaasSubscription,
    cancelSubscription as cancelAsaasSubscription
} from "@/lib/gateways/asaas";
import { PLANS, type PlanKey } from "@/lib/constants/plans";

export async function createCheckoutSubscription(data: {
    email: string;
    name: string;
    cpfCnpj: string;
    phone: string;
    plan: PlanKey;
    billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
    creditCard?: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
    };
    creditCardHolderInfo?: {
        name: string;
        email: string;
        cpfCnpj: string;
        postalCode: string;
        addressNumber: string;
        phone: string;
    };
    remoteIp?: string;
}) {
    try {
        const planInfo = PLANS[data.plan];
        if (!planInfo) {
            throw new Error("Plano inválido");
        }

        // Check if email already has a subscription
        const existingPlan = await prisma.userPlan.findUnique({
            where: { email: data.email }
        });

        if (existingPlan?.isActive) {
            throw new Error("Este e-mail já possui uma assinatura ativa");
        }

        // Create or get Asaas customer
        const asaasCustomerId = await createAsaasCustomer({
            name: data.name,
            email: data.email,
            cpfCnpj: data.cpfCnpj,
            phone: data.phone,
            externalId: data.email
        });

        // Create subscription in Asaas
        const subscription = await createAsaasSubscription(
            asaasCustomerId,
            planInfo.price,
            data.billingType,
            `Assinatura ${planInfo.name} - NeoAutomation`,
            data.email,
            data.creditCard,
            data.creditCardHolderInfo,
            data.remoteIp
        );

        // Create or update UserPlan in database
        const userPlan = await prisma.userPlan.upsert({
            where: { email: data.email },
            create: {
                email: data.email,
                name: data.name,
                cpfCnpj: data.cpfCnpj,
                phone: data.phone,
                plan: data.plan,
                priceMonthly: planInfo.price,
                asaasCustomerId: asaasCustomerId,
                asaasSubscriptionId: subscription.subscriptionId,
                status: "PENDING",
                nextBillingDate: new Date(subscription.nextDueDate),
                isActive: false // Will be activated by webhook when payment confirmed
            },
            update: {
                name: data.name,
                cpfCnpj: data.cpfCnpj,
                phone: data.phone,
                plan: data.plan,
                priceMonthly: planInfo.price,
                asaasCustomerId: asaasCustomerId,
                asaasSubscriptionId: subscription.subscriptionId,
                status: "PENDING",
                nextBillingDate: new Date(subscription.nextDueDate),
                isActive: false
            }
        });

        return {
            success: true,
            userPlanId: userPlan.id,
            subscriptionId: subscription.subscriptionId,
            status: subscription.status,
            nextDueDate: subscription.nextDueDate
        };

    } catch (error: any) {
        console.error("Checkout Error:", error);
        return {
            success: false,
            error: error.message || "Erro ao processar assinatura"
        };
    }
}

export async function checkSubscriptionStatus(email: string) {
    try {
        const userPlan = await prisma.userPlan.findUnique({
            where: { email }
        });

        if (!userPlan) {
            return { hasSubscription: false, isActive: false };
        }

        // If has Asaas subscription, check its status
        if (userPlan.asaasSubscriptionId) {
            const asaasSub = await getAsaasSubscription(userPlan.asaasSubscriptionId);

            // Update local status based on Asaas
            const isActive = asaasSub.status === "ACTIVE";

            if (userPlan.isActive !== isActive) {
                await prisma.userPlan.update({
                    where: { email },
                    data: {
                        isActive,
                        status: asaasSub.status
                    }
                });
            }

            return {
                hasSubscription: true,
                isActive,
                plan: userPlan.plan,
                status: asaasSub.status
            };
        }

        return {
            hasSubscription: true,
            isActive: userPlan.isActive,
            plan: userPlan.plan,
            status: userPlan.status
        };

    } catch (error: any) {
        console.error("Check Subscription Error:", error);
        return { hasSubscription: false, isActive: false, error: error.message };
    }
}

export async function cancelUserSubscription(email: string) {
    try {
        const userPlan = await prisma.userPlan.findUnique({
            where: { email }
        });

        if (!userPlan?.asaasSubscriptionId) {
            throw new Error("Assinatura não encontrada");
        }

        // Cancel in Asaas
        await cancelAsaasSubscription(userPlan.asaasSubscriptionId);

        // Update local
        await prisma.userPlan.update({
            where: { email },
            data: {
                status: "CANCELLED",
                isActive: false,
                endDate: new Date()
            }
        });

        return { success: true };

    } catch (error: any) {
        console.error("Cancel Subscription Error:", error);
        return { success: false, error: error.message };
    }
}

// Determine plan based on payment value
function determinePlanFromValue(value: number): PlanKey {
    if (value >= 397) return "ENTERPRISE";
    if (value >= 197) return "PROFISSIONAL";
    return "STARTER";
}

// For webhook processing - handles payments from Asaas links
export async function processAsaasWebhook(event: string, payment: any) {
    try {
        // Get customer email from payment - Asaas sends customer info in webhook
        const customerEmail = payment.customer?.email || payment.externalReference;

        if (!customerEmail) {
            console.log("Webhook without customer email");
            return { processed: false, error: "No customer email" };
        }

        console.log("Processing webhook for:", customerEmail, "Event:", event);

        // Check if UserPlan exists
        let userPlan = await prisma.userPlan.findUnique({
            where: { email: customerEmail }
        });

        switch (event) {
            case "PAYMENT_CONFIRMED":
            case "PAYMENT_RECEIVED":
                // If UserPlan doesn't exist, create it (from Asaas link payment)
                if (!userPlan) {
                    const plan = determinePlanFromValue(payment.value);
                    userPlan = await prisma.userPlan.create({
                        data: {
                            email: customerEmail,
                            name: payment.customer?.name || "",
                            cpfCnpj: payment.customer?.cpfCnpj || "",
                            phone: payment.customer?.phone || payment.customer?.mobilePhone || "",
                            plan: plan,
                            priceMonthly: payment.value,
                            asaasCustomerId: payment.customer?.id || payment.customer,
                            asaasPaymentId: payment.id,
                            asaasSubscriptionId: payment.subscription || null,
                            status: "ACTIVE",
                            isActive: true,
                            startDate: new Date()
                        }
                    });
                    console.log("Created new UserPlan for:", customerEmail);
                } else {
                    // Update existing UserPlan
                    await prisma.userPlan.update({
                        where: { email: customerEmail },
                        data: {
                            status: "ACTIVE",
                            isActive: true,
                            startDate: userPlan.startDate || new Date(),
                            asaasPaymentId: payment.id,
                            asaasSubscriptionId: payment.subscription || userPlan.asaasSubscriptionId
                        }
                    });
                    console.log("Updated UserPlan for:", customerEmail);
                }
                break;

            case "PAYMENT_OVERDUE":
                if (userPlan) {
                    await prisma.userPlan.update({
                        where: { email: customerEmail },
                        data: {
                            status: "OVERDUE",
                            isActive: false
                        }
                    });
                }
                break;

            case "PAYMENT_DELETED":
            case "PAYMENT_REFUNDED":
                if (userPlan) {
                    await prisma.userPlan.update({
                        where: { email: customerEmail },
                        data: {
                            status: "CANCELLED",
                            isActive: false
                        }
                    });
                }
                break;
        }

        return { processed: true };

    } catch (error: any) {
        console.error("Webhook Processing Error:", error);
        return { processed: false, error: error.message };
    }
}
