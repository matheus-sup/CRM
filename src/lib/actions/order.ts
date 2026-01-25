"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CartItem = {
    id: string; // Product ID
    name: string;
    price: number;
    quantity: number;
};

export async function createOrder(items: CartItem[], total: number, customer?: { name: string, phone: string }) {
    if (!items || items.length === 0) {
        return { success: false, error: "Carrinho vazio" };
    }

    try {
        // Handle Customer (CRM) - Find by phone or create
        let customerId = null;
        if (customer && customer.phone) {
            // Basic sanitization
            const cleanPhone = customer.phone.replace(/\D/g, "");

            // Try to find existing customer by phone
            const existingCustomer = await prisma.customer.findFirst({
                where: { phone: cleanPhone }
            });

            if (existingCustomer) {
                customerId = existingCustomer.id;
                // Optional: Update name if provided and not just "Cliente"
            } else {
                const newCustomer = await prisma.customer.create({
                    data: {
                        name: customer.name || "Cliente WhatsApp",
                        phone: cleanPhone,
                    }
                });
                customerId = newCustomer.id;
            }
        }

        // Generate ID
        const lastOrder = await prisma.order.findFirst({
            orderBy: { code: 'desc' }
        });
        const nextCode = (lastOrder?.code || 1000) + 1;

        const order = await prisma.order.create({
            data: {
                code: nextCode,
                total: total,
                status: "PENDING",
                paymentMethod: "WHATSAPP",
                customerId: customerId,
                items: {
                    create: items.map(item => ({
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    }))
                }
            }
        });

        // Decrement stock
        for (const item of items) {
            await prisma.product.update({
                where: { id: item.id },
                data: {
                    stock: { decrement: item.quantity }
                }
            }).catch(err => console.error(`Failed to update stock for ${item.id}`, err));
        }

        revalidatePath("/admin/pedidos");
        revalidatePath("/admin/clientes"); // Access new CRM page
        revalidatePath("/admin/estatisticas");

        return { success: true, orderId: order.code, orderUUID: order.id };
    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error: "Erro ao criar pedido" };
    }
}
