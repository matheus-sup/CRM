import { getStoreConfig } from "@/lib/actions/settings";
import { MaintenanceForm } from "@/components/admin/settings/MaintenanceForm";
import { Hammer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { serializeForClient } from "@/lib/utils";

export default async function MaintenancePage() {
    const config = await getStoreConfig();

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Páginas em Construção</h1>
                <p className="text-slate-500 text-sm">Controle o acesso à sua loja enquanto faz alterações.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Hammer className="h-5 w-5" /> Modo de Manutenção
                    </CardTitle>
                    <CardDescription>
                        Quando ativado, apenas administradores poderão ver a loja. Clientes verão uma mensagem de aviso.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MaintenanceForm config={serializeForClient(config)} />
                </CardContent>
            </Card>
        </div>
    );
}
