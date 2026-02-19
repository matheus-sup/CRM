"use client";

import { useSearchParams } from "next/navigation";
import { SettingsSidebar } from "./SettingsSidebar";
import { SocialLinksForm } from "./SocialLinksForm";
import { MaintenanceForm } from "./MaintenanceForm";
import { SettingsForm } from "@/app/(admin)/admin/configuracoes/settings-form";
import { MarketingForm } from "./MarketingForm";
import { SocialAuthForm } from "./SocialAuthForm";

export function SettingsManager({ config, banners }: { config: any, banners: any[] }) {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "apple-google-login";

    const renderContent = () => {
        switch (activeTab) {
            case "redes-sociais":
                return <SocialLinksForm config={config} />;
            case "apple-google-login":
                return <SocialAuthForm config={config} />;
            case "marketing":
                return <MarketingForm config={config} />;
            case "identidade":
                return <SettingsForm config={config} />;
            case "contato":
                return (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded text-yellow-800 text-sm mb-4">
                            Em breve: Formulário exclusivo de contato. Por enquanto, use a aba "Rodapé".
                        </div>
                        <SettingsForm config={config} />
                    </div>
                );
            case "em-construcao":
                return <MaintenanceForm config={config} />;
            case "whatsapp":
            case "pagamento":
            case "envio":
                return <div className="p-10 text-center text-slate-400 border-2 border-dashed rounded-xl">Em desenvolvimento: {activeTab}</div>;
            default:
                return <div className="p-10 text-center text-slate-400">Selecione uma opção no menu.</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-8">
            <div className="max-w-5xl mx-auto">
                {renderContent()}
            </div>
        </div>
    );
}
