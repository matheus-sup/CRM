"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, XCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

type ExpiryStats = {
    expired: number;
    expiringIn7Days: number;
    expiringIn30Days: number;
};

type ExpiringProduct = {
    productId: string;
    productName: string;
    stock: number;
    expiresAt: Date;
    imageUrl?: string;
    isExpired: boolean;
    daysUntilExpiry: number;
};

interface ExpiringProductsCardProps {
    stats: ExpiryStats;
    products: ExpiringProduct[];
}

export function ExpiringProductsCard({ stats, products }: ExpiringProductsCardProps) {
    const hasAlerts = stats.expired > 0 || stats.expiringIn7Days > 0 || stats.expiringIn30Days > 0;

    if (!hasAlerts) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-600" />
                        Validade dos Produtos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8 text-center">
                        <div>
                            <div className="text-green-600 font-semibold">Tudo em dia!</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Nenhum produto com validade próxima ou vencido.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Alertas de Validade
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2">
                    {stats.expired > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                            <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-red-700">{stats.expired}</div>
                            <div className="text-xs text-red-600">Vencido(s)</div>
                        </div>
                    )}
                    {stats.expiringIn7Days > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                            <AlertTriangle className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-orange-700">{stats.expiringIn7Days}</div>
                            <div className="text-xs text-orange-600">em 7 dias</div>
                        </div>
                    )}
                    {stats.expiringIn30Days > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                            <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-yellow-700">{stats.expiringIn30Days}</div>
                            <div className="text-xs text-yellow-600">em 30 dias</div>
                        </div>
                    )}
                </div>

                {/* Top 5 Most Urgent */}
                {products.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-sm font-semibold text-slate-700">Mais urgentes:</div>
                        <div className="space-y-2">
                            {products.slice(0, 5).map((product) => (
                                <div
                                    key={product.productId}
                                    className="flex items-center justify-between p-2 bg-white rounded-lg border"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.productName}
                                                className="h-10 w-10 rounded object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                <Clock className="h-4 w-4 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="font-medium text-sm truncate">{product.productName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {product.stock} un | Val: {new Date(product.expiresAt).toLocaleDateString("pt-BR")}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            product.isExpired
                                                ? "bg-red-100 text-red-700 border-red-300"
                                                : product.daysUntilExpiry <= 7
                                                    ? "bg-orange-100 text-orange-700 border-orange-300"
                                                    : "bg-yellow-100 text-yellow-700 border-yellow-300"
                                        }
                                    >
                                        {product.isExpired
                                            ? "Vencido"
                                            : product.daysUntilExpiry === 0
                                                ? "Hoje"
                                                : product.daysUntilExpiry === 1
                                                    ? "Amanhã"
                                                    : `${product.daysUntilExpiry}d`}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* View All Link */}
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/produtos?filter=expiring">
                        Ver todos
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
