import { PdvManager } from "@/components/admin/pdv/PdvManager";
import { DownloadPdvButton } from "@/components/admin/pdv/DownloadPdvButton";
import { getProducts } from "@/lib/actions/product";
import { getSellers } from "@/lib/actions/seller";
import { getUserPlan } from "@/lib/actions/tools";

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

    // Check user plan
    const userPlan = await getUserPlan("test-user-dev");
    const isProfessional = userPlan.plan === "PROFESSIONAL" || userPlan.plan === "ENTERPRISE";

    return (
        <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
                <h1 className="text-xl font-bold text-slate-800">PDV (Frente de Caixa)</h1>
                <DownloadPdvButton isProfessional={isProfessional} />
            </div>
            <PdvManager initialProducts={products} sellers={sellers} />
        </div>
    );
}
