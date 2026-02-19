"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { CartItem } from "@/lib/store/cart";

// Sync local items with DB items on login/load
export async function syncCart(localItems: CartItem[]) {
    const user = await getCurrentUser();
    if (!user) return { success: false, items: localItems };

    try {
        let cart = await prisma.cart.findUnique({
            where: { customerId: user.id },
            include: { items: { include: { product: true } } }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { customerId: user.id },
                include: { items: { include: { product: true } } }
            });
        }

        // Merge logic:
        // 1. Add local items to DB if they don't exist
        for (const localItem of localItems) {
            const existsInDb = cart.items.find(dbItem => dbItem.productId === localItem.id);
            if (!existsInDb) {
                await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId: localItem.id,
                        quantity: localItem.quantity
                    }
                });
            } else {
                // Update quantity if local is fresher? Or sum? Let's take local for now as it's "current session"
                if (localItem.quantity !== existsInDb.quantity) {
                    await prisma.cartItem.update({
                        where: { id: existsInDb.id },
                        data: { quantity: localItem.quantity }
                    });
                }
            }
        }

        // 2. Fetch fresh cart from DB to return
        // This effectively merges "Old DB Items" + "New Local Items"
        const freshCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { product: { include: { images: true } } } } }
        });

        const mergedItems: CartItem[] = freshCart?.items.map(item => ({
            id: item.productId,
            name: item.product.name,
            price: Number(item.product.price),
            image: item.product.images[0]?.url,
            slug: item.product.slug,
            quantity: item.quantity
        })) || [];

        return { success: true, items: mergedItems };

    } catch (error) {
        console.error("Cart Sync Error:", error);
        return { success: false, items: localItems };
    }
}

// Update DB when user changes cart (Add/Remove/Update)
export async function updateCartDB(items: CartItem[]) {
    const user = await getCurrentUser();
    if (!user) return; // Do nothing if guest

    try {
        const cart = await prisma.cart.findUnique({ where: { customerId: user.id } });
        if (!cart) return;

        // Naive sync: Delete all and recreate is easiest for consistency, but less efficient.
        // Better: Upsert.
        // For MVP speed: Reconcile list.

        // 1. Clear current items
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

        // 2. Insert new items
        if (items.length > 0) {
            await prisma.cartItem.createMany({
                data: items.map(item => ({
                    cartId: cart.id,
                    productId: item.id,
                    quantity: item.quantity
                }))
            });
        }

    } catch (error) {
        console.error("Cart DB Update Error:", error);
    }
}
