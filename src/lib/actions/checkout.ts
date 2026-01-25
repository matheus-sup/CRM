"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { processPayment } from "@/lib/gateways/payment";

interface CreateOrderParams {
    customer: {
        name: string;
        email?: string;
        phone?: string;
        document?: string;
    };
    address: {
        zip: string;
        street: string;
        number: string;
        complement?: string;
        district: string;
        city: string;
        state: string;
    };
    shipping: {
        title: string;
        price: number;
        days?: number;
    };
    paymentMethod: string;
    items: {
        id: string; // Product ID
        name: string;
        image?: string;
        price: number;
        quantity: number;
    }[];
    total: number;
}

export async function createOrder(data: CreateOrderParams) {
    try {
        console.log("Creating order...", data);

        // 1. Generate Order Code (Simple sequence simulation)
        // In production, use a sequence table or UUID shortener
        const lastOrder = await prisma.order.findFirst({
            orderBy: { code: 'desc' },
            select: { code: true }
        });
        const nextCode = (lastOrder?.code || 1000) + 1;

        // 2. Find or Create Customer
        // Logic: Try to find by email if provided, else create specific "Guest" customer or link later
        let customerId = null;
        if (data.customer.email) {
            const existingCustomer = await prisma.customer.findUnique({
                where: { email: data.customer.email }
            });

            if (existingCustomer) {
                customerId = existingCustomer.id;
            } else {
                const newCustomer = await prisma.customer.create({
                    data: {
                        name: data.customer.name,
                        email: data.customer.email,
                        phone: data.customer.phone,
                        document: data.customer.document
                    }
                });
                customerId = newCustomer.id;
            }
        }

        // 3. Create Order
        const order = await prisma.order.create({
            data: {
                code: nextCode,
                customerId: customerId,
                customerName: data.customer.name,
                customerEmail: data.customer.email || "guest@store.com",
                customerPhone: data.customer.phone,

                status: "PENDING",
                total: data.total,
                subtotal: data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                shippingCost: data.shipping.price,
                shippingTitle: data.shipping.title,
                shippingDays: data.shipping.days,

                paymentMethod: data.paymentMethod,
                origin: "ONLINE",

                // Address Snapshot
                addressZip: data.address.zip,
                addressStreet: data.address.street,
                addressNumber: data.address.number,
                addressComplement: data.address.complement,
                addressDistrict: data.address.district,
                addressCity: data.address.city,
                addressState: data.address.state,

                // Create Items
                items: {
                    create: data.items.map(item => ({
                        productId: item.id,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        quantity: item.quantity
                    }))
                }
            }
        });

        // 4. Process Payment (Mock)
        const paymentResult = await processPayment(
            { id: order.id, code: order.code, total: data.total, customer: data.customer },
            data.paymentMethod
        );

        // 5. Update Order with Payment Result
        await prisma.order.update({
            where: { id: order.id },
            data: {
                paymentStatus: paymentResult.status,
                // If paid immediately (card), we might also set status to PAID or leave PENDING for fulfillment
                status: paymentResult.status === 'PAID' ? 'PAID' : 'PENDING'
            }
        });

        revalidatePath("/admin/pedidos");

        return {
            success: true,
            orderId: order.id,
            orderCode: order.code,
            payment: paymentResult
        };

    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, message: "Erro ao criar pedido." };
    }
}
