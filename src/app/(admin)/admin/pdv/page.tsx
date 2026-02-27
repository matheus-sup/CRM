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
        <div className="fixed inset-0 top-16 left-0 md:left-64 flex flex-col overflow-hidden bg-slate-50 z-10">
            <div className="flex items-center gap-4 px-4 py-2 shrink-0 bg-slate-50">
                <h1 className="text-xl font-bold text-slate-800">PDV (Frente de Caixa)</h1>
                <DownloadPdvButton isProfessional={isProfessional} />
            </div>
            <div className="flex-1 px-4 pb-2 overflow-hidden">
                <PdvManager initialProducts={products} sellers={sellers} />
            </div>
        </div>
    );
}
