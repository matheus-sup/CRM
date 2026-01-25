import { prisma } from "@/lib/prisma";
import { InventoryList } from "@/components/admin/inventory/InventoryList";

export default async function InventoryPage() {
    // Fetch products sorted by stock (lowest first maybe? or just name)
    const products = await prisma.product.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            variants: true // If we want to show variant stock total
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Inventário</h1>
            </div>
            <InventoryList initialProducts={products} />
        </div>
    );
}
