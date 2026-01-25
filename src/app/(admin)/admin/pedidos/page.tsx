import { prisma } from "@/lib/prisma";
import { SalesManager } from "@/components/admin/sales/SalesManager";
import { getProducts } from "@/lib/actions/product";

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { customer: true }
    });

    // Fetch products for PDV
    let products: any[] = [];
    try {
        const result = await getProducts();
        if (Array.isArray(result)) {
            products = result.map((p: any) => ({
                ...p,
                price: Number(p.price),
                images: []
            }));
        }
    } catch (error) {
        console.error("Failed to load products for PDV", error);
    }

    return (
        <SalesManager orders={orders} products={products} />
    );
}
