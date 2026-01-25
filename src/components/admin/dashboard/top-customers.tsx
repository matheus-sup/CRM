"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Customer {
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    ordersCount: number;
}

export function TopCustomers({ customers }: { customers: Customer[] }) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Top Clientes 🏆</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {customers.length === 0 ? (
                        <p className="text-sm text-slate-500">Nenhum cliente ainda.</p>
                    ) : (
                        customers.map((customer, index) => (
                            <div key={customer.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="font-bold text-slate-400 text-sm">#{index + 1}</div>
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
                                        <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{customer.name}</p>
                                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-sm">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(customer.totalSpent)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{customer.ordersCount} pedidos</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
