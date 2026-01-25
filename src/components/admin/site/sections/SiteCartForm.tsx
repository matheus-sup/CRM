"use client";

import { useActionState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const initialState = { success: false, message: "" };

export function SiteCartForm({ config }: { config: any }) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);

    // Helper for Boolean Inputs
    const BooleanInput = ({ name, value }: { name: string, value: boolean }) => (
        <input type="hidden" name={name} value={value.toString()} />
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" /> Carrinho de compras
                </CardTitle>
                <CardDescription>Configure o comportamento do carrinho e checkout.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-8">

                    {/* Min Purchase */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="minPurchaseValue" className="text-base font-semibold">Valor mínimo de compra</Label>
                            <p className="text-sm text-gray-500">Qual o valor mínimo que seus clientes devem gastar?</p>
                        </div>
                        <Input
                            id="minPurchaseValue"
                            name="minPurchaseValue"
                            type="number"
                            step="0.01"
                            defaultValue={config.minPurchaseValue?.toString() || "0"}
                            placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">Insira apenas números.</p>
                    </div>

                    {/* Quick Cart */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-base font-semibold">Carrinho de compra rápida</Label>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
                            <Switch
                                id="enableQuickCart"
                                defaultChecked={config.enableQuickCart}
                                onCheckedChange={(c: boolean) => {
                                    const el = document.getElementById("enableQuickCart") as HTMLInputElement;
                                    if (el) el.value = c.toString();
                                }}
                            />
                            <div className="space-y-0.5">
                                <Label htmlFor="enableQuickCart" className="font-medium cursor-pointer">Permitir que seus clientes adicionem produtos sem precisar ir a outra página</Label>
                            </div>
                            <BooleanInput name="enableQuickCart" value={config.enableQuickCart} />
                        </div>

                        <div className="space-y-2">
                            <Label>Ação ao adicionar um produto ao carrinho:</Label>
                            <Select name="cartAction" defaultValue={config.cartAction || "notification"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="notification">Mostrar uma notificação (Toast)</SelectItem>
                                    <SelectItem value="modal">Abrir janela do carrinho (Modal)</SelectItem>
                                    <SelectItem value="page">Ir para página do carrinho</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-base font-semibold">Recomendações de produtos</Label>
                        </div>
                        <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
                            <Switch
                                id="showCartRecommendations"
                                defaultChecked={config.showCartRecommendations}
                                onCheckedChange={(c: boolean) => {
                                    const el = document.getElementById("showCartRecommendations") as HTMLInputElement;
                                    if (el) el.value = c.toString();
                                }}
                            />
                            <div className="space-y-0.5">
                                <Label htmlFor="showCartRecommendations" className="font-medium cursor-pointer">Sugerir produtos complementares ao adicionar</Label>
                            </div>
                            <BooleanInput name="showCartRecommendations" value={config.showCartRecommendations} />
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-base font-semibold">Formas de entrega</Label>
                        </div>
                        <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
                            <Switch
                                id="showShippingCalculator"
                                defaultChecked={config.showShippingCalculator}
                                onCheckedChange={(c: boolean) => {
                                    const el = document.getElementById("showShippingCalculator") as HTMLInputElement;
                                    if (el) el.value = c.toString();
                                }}
                            />
                            <div className="space-y-0.5">
                                <Label htmlFor="showShippingCalculator" className="font-medium cursor-pointer">Mostrar a calculadora de frete e as lojas físicas no carrinho</Label>
                            </div>
                            <BooleanInput name="showShippingCalculator" value={config.showShippingCalculator} />
                        </div>
                    </div>

                    <div className="pt-4 sticky bottom-0 bg-white border-t p-4 -mx-6 -mb-6">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Salvando..." : "Salvar Carrinho"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
