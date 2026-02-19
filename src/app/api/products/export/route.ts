import { prisma } from "@/lib/prisma";
import { PRODUCT_CSV_HEADERS, generateCsv } from "@/lib/csv-helper";

export async function GET() {
    const products = await prisma.product.findMany({
        orderBy: { name: "asc" }
    });

    const rows = products.map(p => ({
        name: p.name,
        description: p.description || "",
        price: p.price.toString().replace(".", ","), // Excel BR format
        stock: p.stock,
        sku: p.sku || "",
        barcode: p.barcode || "",
        costPerItem: p.costPerItem ? p.costPerItem.toString().replace(".", ",") : ""
    }));

    const csv = generateCsv(rows, PRODUCT_CSV_HEADERS);

    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename=produtos-export-${new Date().toISOString().split('T')[0]}.csv`,
        },
    });
}
