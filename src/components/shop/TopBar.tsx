import { Truck, CreditCard, MessageCircle } from "lucide-react";

export function TopBar() {
    return (
        <div className="bg-primary py-2 text-xs font-medium text-white">
            <div className="container mx-auto flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span className="hidden sm:inline">Frete Grátis Sul e Sudeste a partir de R$299</span>
                    <span className="sm:hidden">Frete Grátis Sul/Sudeste &gt; R$299</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>WhatsApp (11) 99673-9701</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Pague em até 12x</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
