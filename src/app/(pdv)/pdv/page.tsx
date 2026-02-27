import { PdvManager } from "@/components/admin/pdv/PdvManager";
import { getProducts } from "@/lib/actions/product";

export default async function StandalonePdvPage() {
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
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            <div className="px-4 py-2 shrink-0">
                <h1 className="text-xl font-bold text-slate-800">PDV (Frente de Caixa)</h1>
            </div>
            <div className="flex-1 px-4 pb-2 overflow-hidden">
                <PdvManager initialProducts={products} />
            </div>
        </div>
    );
}
