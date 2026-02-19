import { getStoreConfig } from "@/lib/actions/settings";
import { SocialLinksForm } from "@/components/admin/settings/SocialLinksForm";

export default async function SocialLinksPage() {
    const config = await getStoreConfig();

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Redes Sociais</h1>
                <p className="text-slate-500 text-sm">Gerencie os links das redes sociais da sua loja.</p>
            </div>
            <SocialLinksForm config={config} />
        </div>
    );
}
