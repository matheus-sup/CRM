import { PdvManager } from "@/components/admin/pdv/PdvManager";
import { DownloadPdvButton } from "@/components/admin/pdv/DownloadPdvButton";
import { getProducts } from "@/lib/actions/product";
import { getSellers } from "@/lib/actions/seller";

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

    // Fetch sellers
    const sellers = await getSellers();

    return (
        <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
                <h1 className="text-xl font-bold text-slate-800">PDV (Frente de Caixa)</h1>
                <DownloadPdvButton />
            </div>
            <PdvManager initialProducts={products} sellers={sellers} />
        </div>
    );
}
