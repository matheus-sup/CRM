import { getShippingConfig } from "@/lib/actions/shipping-settings";
import { ShippingSettingsForm } from "@/components/admin/settings/ShippingSettingsForm";

export default async function EnviosPage() {
    const config = await getShippingConfig();

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Gestão de Envios</h1>
                <p className="text-slate-500">Configure os métodos de envio e integrações.</p>
            </div>

            <ShippingSettingsForm config={config} />
        </div>
    );
}
