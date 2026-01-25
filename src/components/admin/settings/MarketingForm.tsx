"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Save, AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MarketingForm({ config }: { config: any }) {
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const res = await updateStoreConfig(null, formData);
            if (res.success) {
                toast.success("Configurações de Marketing salvas!");
            } else {
                toast.error("Erro ao salvar.");
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-bold text-slate-800">Rastreamento e Pixels</h2>
                </div>

                <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Dica</AlertTitle>
                    <AlertDescription>
                        Insira os IDs dos seus pixels. Os scripts serão inseridos automaticamente em todas as páginas da loja.
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                        <Input
                            name="facebookPixelId"
                            defaultValue={config?.facebookPixelId || ""}
                            placeholder="Ex: 123456789012345"
                        />
                        <p className="text-xs text-slate-500">
                            Encontrado no Gerenciador de Negócios do Meta {'>'} Fontes de Dados.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="googleTagId">Google Config ID (G-XXXX ou GT-XXXX)</Label>
                        <Input
                            name="googleTagId"
                            defaultValue={config?.googleTagId || ""}
                            placeholder="Ex: G-A1B2C3D4"
                        />
                        <p className="text-xs text-slate-500">
                            ID do Google Analytics 4 ou Google Tag Manager.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button disabled={isPending} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </form>
    );
}
