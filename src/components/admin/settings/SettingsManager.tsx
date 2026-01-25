"use client";

import { useState } from "react";
import { SettingsSidebar } from "./SettingsSidebar";
import { SocialLinksForm } from "./SocialLinksForm";
import { MaintenanceForm } from "./MaintenanceForm";
import { SettingsForm } from "@/app/(admin)/admin/configuracoes/settings-form"; // Reuse existing for Identity/Colors
import { MarketingForm } from "./MarketingForm";
// Import other forms as we create them

export function SettingsManager({ config }: { config: any }) {
    const [activeTab, setActiveTab] = useState("redes-sociais"); // Defaulting to user's request context

    const renderContent = () => {
        switch (activeTab) {
            case "redes-sociais":
                return <SocialLinksForm config={config} />;
            case "marketing":
                return <MarketingForm config={config} />;
            case "identidade":
                return <SettingsForm config={config} />; // Using the old monolithic form for now, user can instruct to split later
            case "contato":
                // Reuse SettingsForm but maybe hide sections? Or just redirect to Identity for now since it covers both.
                // Ideally we split SettingsForm. For now, showing the full form is safe.
                return (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded text-yellow-800 text-sm mb-4">
                            Em breve: Formulário exclusivo de contato. Por enquanto, use a aba "Marca e Cores".
                        </div>
                        <SettingsForm config={config} />
                    </div>
                );
            case "em-construcao":
                return <MaintenanceForm config={config} />;
            case "paginas":
                return <div className="p-10 text-center text-slate-400">Gerenciador de Páginas (Próximo Passo)</div>;
            case "menus":
                return <div className="p-10 text-center text-slate-400">Gerenciador de Menus (Próximo Passo)</div>;
            case "layout":
                return <div className="p-10 text-center text-slate-400 border-2 border-dashed rounded-xl">🔒 Layout Fixo (Em breve)</div>;
            default:
                return <div className="p-10 text-center text-slate-400">Selecione uma opção no menu.</div>;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 p-8 overflow-y-auto max-h-screen">
                <div className="max-w-4xl mx-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
