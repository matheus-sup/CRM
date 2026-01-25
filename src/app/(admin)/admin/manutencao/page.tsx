import { getStoreConfig } from "@/lib/actions/settings";
import { MaintenanceForm } from "@/components/admin/site/MaintenanceForm";
import { Hammer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function MaintenancePage() {
    const config = await getStoreConfig();

    // Cast to any to avoid TS errors if prisma client is stale
    const serializedConfig = {
        ...config,
        // Ensure decimals are serialized if needed, though getStoreConfig usually returns plain objects or we handle it
        minPurchaseValue: config?.minPurchaseValue ? Number(config.minPurchaseValue) : 0,
    } as any;

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
                    <MaintenanceForm config={serializedConfig} />
                </CardContent>
            </Card>
        </div>
    );
}
