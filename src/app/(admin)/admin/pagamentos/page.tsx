import { getPaymentConfig } from "@/lib/actions/payment-settings";
import { PaymentSettingsForm } from "@/components/admin/settings/PaymentSettingsForm";

export default async function PaymentSettingsPage() {
    const config = await getPaymentConfig();

    // Serialize Decimal types (Next.js cannot pass objects like Decimal to client components)
    const serializedConfig = config ? {
        ...config,
        minInstallmentValue: config.minInstallmentValue ? Number(config.minInstallmentValue) : 5,
        interestRate: config.interestRate ? Number(config.interestRate) : 0,
    } : null;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Pagamentos</h1>
                <p className="text-slate-500">Configure como sua loja recebe pagamentos.</p>
            </div>

            <PaymentSettingsForm config={serializedConfig} />
        </div>
    );
}
