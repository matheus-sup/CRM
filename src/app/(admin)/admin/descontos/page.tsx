import { getCoupons } from "@/lib/actions/coupon";
import { getItemDiscounts } from "@/lib/actions/item-discount";
import { CouponManager } from "@/components/admin/CouponManager";

export default async function DiscountsPage() {
    const { coupons } = await getCoupons();
    const { itemDiscounts } = await getItemDiscounts();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Descontos e Cupons</h1>
                <p className="text-sm text-slate-500">Gerencie cupons de desconto e promocoes.</p>
            </div>

            <CouponManager
                initialCoupons={coupons || []}
                initialItemDiscounts={itemDiscounts || []}
            />
        </div>
    );
}
