"use client";

import { useState } from "react";
import { List, ShoppingCart, Users } from "lucide-react";
import { OrdersList } from "@/components/admin/sales/OrdersList";
import { SellersTab } from "@/components/admin/sales/SellersTab";

interface SellerStats {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    isActive: boolean;
    totalSales: number;
    salesCount: number;
    totalItems: number;
    pa: number;
    tkm: number;
}

interface SalesManagerProps {
    orders: any[];
    products: any[];
    sellers?: SellerStats[];
}

export function SalesManager({ orders, products, sellers = [] }: SalesManagerProps) {
    const [view, setView] = useState<"list" | "abandoned" | "sellers">("list");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-800">Vendas</h1>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setView("list")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <List className="h-4 w-4" />
                            Lista de Vendas
                        </button>
                        <button
                            onClick={() => setView("abandoned")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === "abandoned" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Carrinhos Abandonados
                        </button>
                        <button
                            onClick={() => setView("sellers")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === "sellers" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <Users className="h-4 w-4" />
                            Vendedores
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                {view === "list" && <OrdersList orders={orders} />}
                {view === "sellers" && <SellersTab initialSellers={sellers} />}
                {view === "abandoned" && (
                    <div className="p-12 text-center bg-white rounded-lg border border-dashed border-slate-200">
                        <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">Carrinhos Abandonados</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            Funcionalidade de recuperação de carrinhos em desenvolvimento.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
