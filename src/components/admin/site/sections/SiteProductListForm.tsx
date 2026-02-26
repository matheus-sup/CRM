"use client";

import { useActionState } from "react";
import { updateStoreConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Grid, Smartphone, Monitor, Image as ImageIcon } from "lucide-react";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { useState } from "react";

const initialState = { success: false, message: "" };

export function SiteProductListForm({ config, onConfigChange }: { config: any; onConfigChange?: (key: string, value: any) => void }) {
    const [state, formAction, isPending] = useActionState(updateStoreConfig, initialState);
    const [categoryImage, setCategoryImage] = useState(config.categoryDefaultImage || "");

    // Helper for Boolean Inputs
    const BooleanInput = ({ name, value }: { name: string, value: boolean }) => (
        <input type="hidden" name={name} value={value.toString()} />
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Grid className="h-5 w-5" /> Lista de produtos
                </CardTitle>
                <CardDescription>Configure como os produtos são exibidos nas listagens.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-8">

                    {/* Imagem para Categorias */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Imagem para as categorias</Label>
                        <div className="border rounded-lg p-4 bg-slate-50">
                            <ImagePicker
                                value={categoryImage}
                                onChange={setCategoryImage}
                                label="Selecionar Imagem Padrão"
                            />
                            <input type="hidden" name="categoryDefaultImage" value={categoryImage} />
                            <p className="text-xs text-muted-foreground mt-2">
                                Tamanho recomendado: 1580px x 220px. Usada quando a categoria não tem banner específico.
                            </p>
                        </div>
                    </div>

                    {/* Layout Grid */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Produtos na lista</Label>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" /> Colunas no Celular
                                </Label>
                                <Select name="mobileColumns" defaultValue={config.mobileColumns?.toString() || "2"} onValueChange={(v) => onConfigChange?.("mobileColumns", parseInt(v))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 produto</SelectItem>
                                        <SelectItem value="2">2 produtos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Monitor className="h-4 w-4" /> Colunas no Computador
                                </Label>
                                <Select name="desktopColumns" defaultValue={config.desktopColumns?.toString() || "4"} onValueChange={(v) => onConfigChange?.("desktopColumns", parseInt(v))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3">3 produtos</SelectItem>
                                        <SelectItem value="4">4 produtos</SelectItem>
                                        <SelectItem value="5">5 produtos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Mostrar produtos usando:</Label>
                            <Select name="paginationType" defaultValue={config.paginationType || "infinite"} onValueChange={(v) => onConfigChange?.("paginationType", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="infinite">Carregamento infinito</SelectItem>
                                    <SelectItem value="pagination">Paginação (Páginas 1, 2, 3...)</SelectItem>
                                    <SelectItem value="button">Botão "Carregar mais"</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Features Toggles */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold">Funcionalidades do Card</h3>

                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label>Compra rápida</Label>
                                    <p className="text-xs text-muted-foreground">Botão para adicionar ao carrinho diretamente da lista.</p>
                                </div>
                                <Switch
                                    defaultChecked={config.enableQuickBuy}
                                    onCheckedChange={(c: boolean) => {
                                        const el = document.getElementById("enableQuickBuy") as HTMLInputElement;
                                        if (el) el.value = c.toString();
                                        onConfigChange?.("enableQuickBuy", c);
                                    }}
                                />
                                <BooleanInput name="enableQuickBuy" value={config.enableQuickBuy} />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label>Informações das parcelas</Label>
                                    <p className="text-xs text-muted-foreground">Exibir "10x de R$..." abaixo do preço.</p>
                                </div>
                                <Switch
                                    defaultChecked={config.showInstallments}
                                    onCheckedChange={(c: boolean) => {
                                        const el = document.getElementById("showInstallments") as HTMLInputElement;
                                        if (el) el.value = c.toString();
                                        onConfigChange?.("showInstallments", c);
                                    }}
                                />
                                <BooleanInput name="showInstallments" value={config.showInstallments} />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label>Variações de cor</Label>
                                    <p className="text-xs text-muted-foreground">Mostrar bolinhas de cores disponíveis.</p>
                                </div>
                                <Switch
                                    defaultChecked={config.showColorVariations}
                                    onCheckedChange={(c: boolean) => {
                                        const el = document.getElementById("showColorVariations") as HTMLInputElement;
                                        if (el) el.value = c.toString();
                                        onConfigChange?.("showColorVariations", c);
                                    }}
                                />
                                <BooleanInput name="showColorVariations" value={config.showColorVariations} />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label>Fotos do produto (Hover)</Label>
                                    <p className="text-xs text-muted-foreground">Mostrar a segunda foto ao passar o mouse.</p>
                                </div>
                                <Switch
                                    defaultChecked={config.showHoverImage}
                                    onCheckedChange={(c: boolean) => {
                                        const el = document.getElementById("showHoverImage") as HTMLInputElement;
                                        if (el) el.value = c.toString();
                                        onConfigChange?.("showHoverImage", c);
                                    }}
                                />
                                <BooleanInput name="showHoverImage" value={config.showHoverImage} />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label>Últimas unidades</Label>
                                    <p className="text-xs text-muted-foreground">Aviso de "Poucas unidades" quando estoque baixo.</p>
                                </div>
                                <Switch
                                    defaultChecked={config.showLowStockWarning}
                                    onCheckedChange={(c: boolean) => {
                                        const el = document.getElementById("showLowStockWarning") as HTMLInputElement;
                                        if (el) el.value = c.toString();
                                        onConfigChange?.("showLowStockWarning", c);
                                    }}
                                />
                                <BooleanInput name="showLowStockWarning" value={config.showLowStockWarning} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 sticky bottom-0 bg-white border-t p-4 -mx-6 -mb-6">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Salvando..." : "Salvar Lista de Produtos"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
