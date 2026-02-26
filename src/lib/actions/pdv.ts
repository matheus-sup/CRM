"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

interface CheckoutData {
    items: CartItem[];
    sellerId: string;
    paymentMethod: "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "PIX";
    discount: number;
    customerName?: string;
    customerCpf?: string;
    amountReceived?: number; // For cash payments
}

export async function createPdvOrder(data: CheckoutData) {
    // Validate seller
    const seller = await prisma.seller.findUnique({
        where: { id: data.sellerId },
    });

    if (!seller) {
        return { success: false, error: "Vendedor não encontrado" };
    }

    // Calculate totals
    const subtotal = data.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );
    const total = subtotal - data.discount;

    if (total < 0) {
        return { success: false, error: "Desconto maior que o total" };
    }

    // Get next order code
    const lastOrder = await prisma.order.findFirst({
        orderBy: { code: "desc" },
    });
    const nextCode = (lastOrder?.code || 1000) + 1;

    try {
        // Create order with transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create the order
            const newOrder = await tx.order.create({
                data: {
                    code: nextCode,
                    sellerId: data.sellerId,
                    customerName: data.customerName || "Cliente Loja",
                    customerEmail: "loja@pdv.local",
                    customerPhone: null,
                    status: "PAID",
                    paymentStatus: "APPROVED",
                    paymentMethod: data.paymentMethod,
                    subtotal,
                    shippingCost: 0,
                    discount: data.discount,
                    total,
                    origin: "STORE",
                    addressStreet: "Venda em Loja",
                    addressNumber: "-",
                    addressDistrict: "-",
                    addressCity: "-",
                    addressState: "-",
                    addressZip: "-",
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                        })),
                    },
                },
                include: {
                    items: true,
                    seller: true,
                },
            });

            // Update stock for each product
            for (const item of data.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });

                // Create stock movement record
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: "OUT",
                        quantity: -item.quantity,
                        reason: `Venda PDV #${nextCode}`,
                        orderId: newOrder.id,
                    },
                });
            }

            return newOrder;
        });

        revalidatePath("/admin/pdv");
        revalidatePath("/admin/pedidos");
        revalidatePath("/admin/vendas");

        return {
            success: true,
            order: {
                id: order.id,
                code: order.code,
                total: Number(order.total),
                paymentMethod: order.paymentMethod,
                sellerName: order.seller?.name,
                change: data.paymentMethod === "CASH" && data.amountReceived
                    ? data.amountReceived - Number(order.total)
                    : 0,
            },
        };
    } catch (error) {
        console.error("Error creating PDV order:", error);
        return { success: false, error: "Erro ao criar pedido" };
    }
}
