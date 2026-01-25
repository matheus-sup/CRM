import { PdvManager } from "@/components/admin/pdv/PdvManager";
import { getProducts } from "@/lib/actions/product";

export default async function PdvPage() {
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
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">PDV (Frente de Caixa)</h1>
            <PdvManager initialProducts={products} />
        </div>
    );
}
