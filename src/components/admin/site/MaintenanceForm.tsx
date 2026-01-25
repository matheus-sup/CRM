"use client";

import { useActionState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const initialState = { success: false, message: "" };

export function MaintenanceForm({ config }: { config: any }) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);

    return (
        <form action={formAction} className="space-y-6">
            {state?.message && (
                <div className={`p-4 rounded-md text-sm ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {state.message}
                </div>
            )}

            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode" className="text-base font-medium">
                        Ativar Manutenção
                    </Label>
                    <p className="text-sm text-slate-500">
                        A loja ficará indisponível para o público.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Hidden input to ensure value is sent */}
                    <input type="hidden" name="maintenanceMode" value={config?.maintenanceMode ? "true" : "false"} id="maintenanceModeInput" />
                    <Switch
                        id="maintenanceModeSwitch"
                        defaultChecked={config?.maintenanceMode}
                        onCheckedChange={(checked) => {
                            const input = document.getElementById("maintenanceModeInput") as HTMLInputElement;
                            if (input) input.value = checked ? "true" : "false";
                        }}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">Mensagem de Aviso</Label>
                <Textarea
                    id="maintenanceMessage"
                    name="maintenanceMessage"
                    placeholder="Estamos em manutenção. Voltamos logo!"
                    defaultValue={config?.maintenanceMessage || ""}
                    rows={4}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="maintenancePassword">Senha de Acesso (Opcional)</Label>
                <Input
                    id="maintenancePassword"
                    name="maintenancePassword"
                    placeholder="Defina uma senha para acesso rápido"
                    defaultValue={config?.maintenancePassword || ""}
                />
                <p className="text-xs text-muted-foreground">Permite que pessoas acessem a loja usando essa senha na tela de manutenção.</p>
            </div>

            {/* Hidden identity fields */}
            <input type="hidden" name="storeName" value={config?.storeName || ""} />

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
        </form>
    );
}
