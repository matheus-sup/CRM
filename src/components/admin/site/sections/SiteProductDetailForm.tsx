"use client";

import { useActionState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, Tag, Truck, Ruler, Package, ChevronRight } from "lucide-react";
import { useState } from "react";

const initialState = { success: false, message: "" };

export function SiteProductDetailForm({ config }: { config: any }) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);

    // Helper for Boolean Inputs
    const BooleanInput = ({ name, value }: { name: string, value: boolean }) => (
        <input type="hidden" name={name} value={value.toString()} />
    );

    const ToggleItem = ({ id, label, description, checked }: any) => (
        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
            <div className="space-y-0.5">
                <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <Switch
                id={id}
                defaultChecked={checked}
                onCheckedChange={(c: boolean) => {
                    const el = document.getElementById(id) as HTMLInputElement;
                    if (el) el.value = c.toString();
                }}
            />
            <BooleanInput name={id} value={checked} />
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" /> Detalhe do produto
                </CardTitle>
                <CardDescription>Customize as informações exibidas na página do produto.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">

                    <div className="space-y-4">
                        <ToggleItem
                            id="showProductSold"
                            label="Produtos vendidos"
                            description="Mostrar contador de vendas recentes"
                            checked={config.showProductSold}
                        />
                        <ToggleItem
                            id="showPromoPrice"
                            label="Preço promocional"
                            description="Destacar preço 'De/Por'"
                            checked={config.showPromoPrice}
                        />
                        <ToggleItem
                            id="showDiscountPayment"
                            label="Desconto por meio de pagamento"
                            description="Ex: '5% de desconto no Pix'"
                            checked={config.showDiscountPayment}
                        />
                        <ToggleItem
                            id="showInstallmentsDetail"
                            label="Informações das parcelas"
                            description="Tabela de parcelamento detalhada"
                            checked={config.showInstallmentsDetail}
                        />
                        <ToggleItem
                            id="showVariations"
                            label="Variações do produto"
                            description="Seletor de cor, tamanho, etc."
                            checked={config.showVariations}
                        />
                        <ToggleItem
                            id="showMeasurements"
                            label="Guia de medidas"
                            description="Botão para tabela de medidas"
                            checked={config.showMeasurements}
                        />
                        <ToggleItem
                            id="showSKU"
                            label="SKU"
                            description="Código de referência do produto"
                            checked={config.showSKU}
                        />
                        <ToggleItem
                            id="showStockQuantity"
                            label="Estoque"
                            description="Mostrar quantidade disponível"
                            checked={config.showStockQuantity}
                        />
                        <ToggleItem
                            id="showShippingSimulator"
                            label="Formas de entrega"
                            description="Calculadora de frete na página"
                            checked={config.showShippingSimulator}
                        />
                        <ToggleItem
                            id="showBuyInfo"
                            label="Informação de compra"
                            description="Texto sobre segurança e garantias"
                            checked={config.showBuyInfo}
                        />
                        <ToggleItem
                            id="showRelatedProducts"
                            label="Produtos relacionados"
                            description="Carrossel 'Quem viu também comprou'"
                            checked={config.showRelatedProducts}
                        />
                    </div>

                    <div className="pt-4 sticky bottom-0 bg-white border-t p-4 -mx-6 -mb-6">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Salvando..." : "Salvar Detalhes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
