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
            <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-slate-800">PDV (Frente de Caixa)</h1>
                <a href="/admin/pdv" download className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">
                    Download PDV
                </a>
            </div>
            <PdvManager initialProducts={products} />
        </div>
    );
}
