"use client";

import { useState } from "react";
import { FooterBlockEditor } from "@/components/admin/footer/FooterBlockEditor";
import { ColorPickerInput } from "@/components/admin/site/ColorPickerInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Palette, Share2, Instagram, Facebook, Youtube, Twitter, Music2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { updateStoreConfig } from "@/lib/actions/settings";

interface SiteFooterFormProps {
    config: any;
    menus?: any[];
    categories?: any[];
    onConfigChange?: (key: string, value: any) => void;
    onHighlightComponent?: (component: string) => void;
    selectedBlockId?: string | null;
}

export function SiteFooterForm({ config, menus = [], categories = [], onConfigChange, onHighlightComponent, selectedBlockId }: SiteFooterFormProps) {
    const [hasHighlighted, setHasHighlighted] = useState(false);

    const handleFocus = () => {
        if (!hasHighlighted) {
            onHighlightComponent?.("footer");
            setHasHighlighted(true);
        }
    };
    // Parse footerBlocks from config
    let savedLayout: any = {};
    try {
        if (config?.footerBlocks) {
            const parsed = JSON.parse(config.footerBlocks as string);
            if (Array.isArray(parsed)) {
                savedLayout = { blocks: parsed };
            } else {
                savedLayout = parsed;
            }
        }
    } catch (e) {
        console.error("Error parsing footerBlocks:", e);
    }

    // Handle blocks change from FooterBlockEditor
    const handleBlocksChange = (data: { blocks: any[], bottomBlocks: any[] }) => {
        if (onConfigChange) {
            // Update footerBlocks in activeConfig for live preview
            onConfigChange("footerBlocks", JSON.stringify(data));
        }
    };

    // Helper to save simple overrides
    const handleStyleChange = async (key: string, value: string) => {
        if (onConfigChange) {
            onConfigChange(key, value);
        }
        // Also trigger a background save if possible or rely on parent save button (if any).
        // SiteEditorLayout usually relies on onConfigChange to update state, but also might need explicit save.
        // For individual inputs here, we can use updateStoreConfig if needed, but onConfigChange should suffice for Preview.
        const formData = new FormData();
        formData.append(key, value);
        await updateStoreConfig(null, formData);
    };

    return (
        <div className="space-y-6" onFocus={handleFocus}>
            <div className="space-y-2">
                <FooterBlockEditor
                    initialData={savedLayout}
                    menus={menus}
                    config={config}
                    categories={categories}
                    onBlocksChange={handleBlocksChange}
                    selectedBlockId={selectedBlockId}
                />
            </div>

            <Separator />

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="appearance">
                    <AccordionTrigger className="text-sm font-semibold">
                        <span className="flex items-center gap-2"><Palette className="h-4 w-4" /> Aparência e Créditos</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500">Cores do Rodapé</Label>
                                <div className="grid gap-3">
                                    <ColorPickerInput
                                        id="footerBg"
                                        label="Cor de Fundo"
                                        value={config.footerBg || "#0f172a"}
                                        onChange={(val) => handleStyleChange("footerBg", val)}
                                    />
                                    <ColorPickerInput
                                        id="footerText"
                                        label="Cor do Texto"
                                        value={config.footerText || "#cbd5e1"}
                                        onChange={(val) => handleStyleChange("footerText", val)}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="creditsText" className="text-xs font-semibold uppercase text-slate-500">Texto de Créditos</Label>
                                <Input
                                    id="creditsText"
                                    defaultValue={config.creditsText}
                                    className="h-8 text-sm"
                                    placeholder="Ex: Desenvolvido por..."
                                    onChange={(e) => handleStyleChange("creditsText", e.target.value)}
                                />
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Banner de Newsletter</Label>
                                            <p className="text-xs text-slate-500">Exibir banner de inscrição acima do rodapé.</p>
                                        </div>
                                        <Switch
                                            checked={config.newsletterEnabled !== false && config.newsletterEnabled !== "false"}
                                            onCheckedChange={(checked) => handleStyleChange("newsletterEnabled", String(checked))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Logo da Loja</Label>
                                            <p className="text-xs text-slate-500">Substituir título do bloco 'Sobre' pelo logo.</p>
                                        </div>
                                        <Switch
                                            checked={config.footerLogo === true || config.footerLogo === "true"}
                                            onCheckedChange={(checked) => handleStyleChange("footerLogo", String(checked))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="social">
                    <AccordionTrigger className="text-sm font-semibold">
                        <span className="flex items-center gap-2"><Share2 className="h-4 w-4" /> Redes Sociais</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2">
                            <p className="text-xs text-slate-500 mb-2">
                                Links que aparecem no bloco "Sobre a Loja" do rodapé.
                            </p>

                            <div className="space-y-2">
                                <Label htmlFor="instagram" className="text-xs flex items-center gap-2">
                                    <Instagram className="h-3.5 w-3.5 text-pink-600" /> Instagram
                                </Label>
                                <Input
                                    id="instagram"
                                    defaultValue={config.instagram || ""}
                                    className="h-8 text-sm"
                                    placeholder="https://instagram.com/sua_loja"
                                    onChange={(e) => handleStyleChange("instagram", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="facebook" className="text-xs flex items-center gap-2">
                                    <Facebook className="h-3.5 w-3.5 text-blue-600" /> Facebook
                                </Label>
                                <Input
                                    id="facebook"
                                    defaultValue={config.facebook || ""}
                                    className="h-8 text-sm"
                                    placeholder="https://facebook.com/sua_loja"
                                    onChange={(e) => handleStyleChange("facebook", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="youtube" className="text-xs flex items-center gap-2">
                                    <Youtube className="h-3.5 w-3.5 text-red-600" /> YouTube
                                </Label>
                                <Input
                                    id="youtube"
                                    defaultValue={config.youtube || ""}
                                    className="h-8 text-sm"
                                    placeholder="https://youtube.com/@sua_loja"
                                    onChange={(e) => handleStyleChange("youtube", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tiktok" className="text-xs flex items-center gap-2">
                                    <Music2 className="h-3.5 w-3.5" /> TikTok
                                </Label>
                                <Input
                                    id="tiktok"
                                    defaultValue={config.tiktok || ""}
                                    className="h-8 text-sm"
                                    placeholder="https://tiktok.com/@seu_usuario"
                                    onChange={(e) => handleStyleChange("tiktok", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="twitter" className="text-xs flex items-center gap-2">
                                    <Twitter className="h-3.5 w-3.5 text-sky-500" /> Twitter / X
                                </Label>
                                <Input
                                    id="twitter"
                                    defaultValue={config.twitter || ""}
                                    className="h-8 text-sm"
                                    placeholder="https://x.com/seu_usuario"
                                    onChange={(e) => handleStyleChange("twitter", e.target.value)}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
