import { getStoreConfig } from "@/lib/actions/settings";
import { getBanners } from "@/lib/actions/banner";
import { SettingsManager } from "@/components/admin/settings/SettingsManager";

export default async function SettingsPage() {
    const config = await getStoreConfig();
    const banners = await getBanners();

    // Serialize Decimal types if needed
    const serializedConfig = {
        ...config,
        minPurchaseValue: config?.minPurchaseValue ? Number(config.minPurchaseValue) : 0,
    };

    return (
        <div className="-m-8"> {/* Negative margin to offset default dashboard padding if any, fitting full height sidebar */}
            <SettingsManager config={serializedConfig} banners={banners} />
        </div>
    );
}
