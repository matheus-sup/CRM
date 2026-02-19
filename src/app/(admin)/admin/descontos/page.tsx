import { getCoupons } from "@/lib/actions/coupon";
import { CouponManager } from "@/components/admin/CouponManager";

export default async function DiscountsPage() {
    const { coupons } = await getCoupons();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Descontos e Cupons</h1>
                <p className="text-sm text-slate-500">Gerencie cupons de desconto e promoções.</p>
            </div>

            <CouponManager initialCoupons={coupons || []} />
        </div>
    );
}
