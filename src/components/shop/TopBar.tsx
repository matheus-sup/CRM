import { Truck, CreditCard } from "lucide-react";

export function TopBar() {
    return (
        <div className="bg-primary/10 py-2 text-xs font-medium text-primary">
            <div className="container mx-auto flex items-center justify-center gap-6 px-4 md:justify-between">
                <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Frete Grátis para todo o Brasil nas compras acima de R$ 199</span>
                </div>
                <div className="hidden flex-items-center gap-2 md:flex">
                    <CreditCard className="h-4 w-4" />
                    <span>Pague com Pix com 5% de desconto</span>
                </div>
            </div>
        </div>
    );
}
