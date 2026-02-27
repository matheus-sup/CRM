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
    // Validate seller (skip validation for "loja" virtual seller)
    if (data.sellerId !== "loja") {
        const seller = await prisma.seller.findUnique({
            where: { id: data.sellerId },
        });

        if (!seller) {
            return { success: false, error: "Vendedor não encontrado" };
        }
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

    // PIX payments are pending until confirmation
    const isPix = data.paymentMethod === "PIX";
    const orderStatus = isPix ? "PENDING" : "PAID";
    const paymentStatus = isPix ? "PENDING" : "APPROVED";

    try {
        // Create order with transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create the order
            const newOrder = await tx.order.create({
                data: {
                    code: nextCode,
                    sellerId: data.sellerId === "loja" ? null : data.sellerId,
                    customerName: data.customerName || "Cliente Loja",
                    customerEmail: "loja@pdv.local",
                    customerPhone: null,
                    status: orderStatus,
                    paymentStatus: paymentStatus,
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

            // Only update stock for non-PIX payments (PIX will update on confirmation)
            if (!isPix) {
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
                paymentStatus: order.paymentStatus,
                sellerName: order.seller?.name || "Loja",
                change: data.paymentMethod === "CASH" && data.amountReceived
                    ? data.amountReceived - Number(order.total)
                    : 0,
                isPendingPix: isPix,
            },
        };
    } catch (error) {
        console.error("Error creating PDV order:", error);
        return { success: false, error: "Erro ao criar pedido" };
    }
}

// Confirmar pagamento PIX e atualizar estoque
export async function confirmPixPayment(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            return { success: false, error: "Pedido não encontrado" };
        }

        if (order.paymentMethod !== "PIX") {
            return { success: false, error: "Este pedido não é PIX" };
        }

        if (order.paymentStatus === "APPROVED") {
            return { success: false, error: "Pagamento já confirmado" };
        }

        // Update order and stock in transaction
        await prisma.$transaction(async (tx) => {
            // Update order status
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: "PAID",
                    paymentStatus: "APPROVED",
                },
            });

            // Update stock for each item
            for (const item of order.items) {
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
                        reason: `Venda PDV #${order.code} (PIX confirmado)`,
                        orderId: order.id,
                    },
                });
            }
        });

        revalidatePath("/admin/pdv");
        revalidatePath("/admin/pedidos");
        revalidatePath("/admin/vendas");

        return { success: true };
    } catch (error) {
        console.error("Error confirming PIX payment:", error);
        return { success: false, error: "Erro ao confirmar pagamento" };
    }
}

// Cancelar pedido PIX pendente
export async function cancelPendingPixOrder(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return { success: false, error: "Pedido não encontrado" };
        }

        if (order.paymentStatus === "APPROVED") {
            return { success: false, error: "Não é possível cancelar pedido já pago" };
        }

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "CANCELLED",
                paymentStatus: "CANCELLED",
            },
        });

        revalidatePath("/admin/pdv");
        revalidatePath("/admin/pedidos");
        revalidatePath("/admin/vendas");

        return { success: true };
    } catch (error) {
        console.error("Error cancelling PIX order:", error);
        return { success: false, error: "Erro ao cancelar pedido" };
    }
}

// Buscar pedidos PIX pendentes
export async function getPendingPixOrders() {
    const orders = await prisma.order.findMany({
        where: {
            paymentMethod: "PIX",
            paymentStatus: "PENDING",
            origin: "STORE",
        },
        include: {
            items: true,
            seller: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return orders.map(order => ({
        ...order,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
    }));
}
