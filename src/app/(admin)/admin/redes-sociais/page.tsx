import { getStoreConfig } from "@/lib/actions/settings";
import { SiteContactForm } from "@/components/admin/site/SiteContactForm";

export default async function SocialMediaPage() {
    const config = await getStoreConfig();

    // Ensure serializable
    const serializedConfig = {
        ...config,
        minPurchaseValue: config?.minPurchaseValue ? Number(config.minPurchaseValue) : 0,
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Links de redes sociais & Contato</h1>
                <p className="text-slate-500 text-sm">Gerencie seus canais de comunicação.</p>
            </div>
            <SiteContactForm config={serializedConfig} />
        </div>
    );
}
