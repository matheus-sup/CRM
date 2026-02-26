import { getStoreConfig } from "@/lib/actions/settings";
import { CartPageClient } from "@/components/shop/CartPageClient";

export const dynamic = "force-dynamic";

export default async function CartPage() {
    const config = await getStoreConfig();

    const cartConfig = {
        minPurchaseValue: config?.minPurchaseValue ? Number(config.minPurchaseValue) : 0,
        showShippingCalculator: config?.showShippingCalculator !== false,
    };

    return <CartPageClient config={cartConfig} />;
}
