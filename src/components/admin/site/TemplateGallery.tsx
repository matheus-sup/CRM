"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Eye, ExternalLink, Sparkles, Loader2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveDraftConfig, publishStoreConfig } from "@/lib/actions/settings";
import { templates, type Template } from "@/lib/templates";

export function TemplateGallery({ currentConfig }: { currentConfig: any }) {
    const [applying, setApplying] = useState<string | null>(null);
    const [confirmTemplate, setConfirmTemplate] = useState<Template | null>(null);
    const [applyStatus, setApplyStatus] = useState<"idle" | "applying" | "success" | "error">("idle");

    const detectActiveTemplate = () => {
        const currentThemeColor = currentConfig?.themeColor || "#db2777";
        const matchingTemplate = templates.find(t => t.config.themeColor === currentThemeColor);
        return matchingTemplate?.id || "classic";
    };

    const activeTemplateId = detectActiveTemplate();

    const handleApply = async (template: Template) => {
        setConfirmTemplate(template);
    };

    const openPreview = (templateId: string) => {
        window.open(`/preview/${templateId}`, "_blank");
    };

    const confirmApply = async () => {
        if (!confirmTemplate) return;
        const template = confirmTemplate;

        setApplyStatus("applying");
        setApplying(template.id);

        try {
            const validFields = [
                'storeName', 'description', 'bannerUrl', 'logoUrl', 'faviconUrl',
                'cnpj', 'legalName', 'themeColor', 'accentColor', 'priceColor', 'siteType',
                'deliveryTime', 'isOpen', 'storeDescription', 'storeRating', 'showAccountButton',
                'secondaryColor', 'backgroundColor', 'menuColor', 'menuFont', 'menuFontSize',
                'headerColor', 'cartCountBg', 'cartCountText', 'searchBtnBg', 'searchIconColor',
                'headerShowLogo', 'headerLogoWidth', 'headerText', 'headerSubtext', 'headerSearchPlaceholder',
                'headingColor', 'sectionTitleColor', 'headingFont', 'headingFontSize',
                'headerBtnBg', 'headerBtnText', 'productBtnBg', 'productBtnText',
                'bodyColor', 'bodyFont', 'bodyFontSize', 'instagram', 'instagramToken',
                'facebook', 'youtube', 'tiktok', 'twitter', 'pinterest', 'pinterestTag',
                'facebookPixelId', 'googleTagId', 'whatsapp', 'phone', 'email', 'address', 'mapUrl',
                'footerBg', 'footerText', 'footerLogo', 'newsletterEnabled', 'showPaymentMethods',
                'showSocialIcons', 'footerBlocks', 'paymentText', 'creditsText',
                'headerStyle', 'cardStyle', 'footerStyle',
                'categoryDefaultImage', 'mobileColumns', 'desktopColumns', 'paginationType',
                'showInstallments', 'enableQuickBuy', 'showColorVariations', 'showHoverImage',
                'showCardCarousel', 'showLowStockWarning', 'showProductSold', 'showPromoPrice',
                'showDiscountPayment', 'showInstallmentsDetail', 'showVariations', 'showMeasurements',
                'showSKU', 'showStockQuantity', 'showShippingSimulator', 'showBuyInfo',
                'showRelatedProducts', 'minPurchaseValue', 'enableQuickCart', 'cartAction',
                'showCartRecommendations', 'showShippingCalculator', 'homeLayout',
                'maintenanceMode', 'maintenanceMessage', 'maintenancePassword',
                'googleClientId', 'googleClientSecret', 'appleClientId', 'appleKeyId',
                'appleTeamId', 'applePrivateKey'
            ];

            const cleanTemplateConfig: any = {};
            Object.keys(template.config).forEach(key => {
                if (validFields.includes(key)) {
                    cleanTemplateConfig[key] = template.config[key];
                }
            });

            const { id, createdAt, updatedAt, menus, products, categories, banners, ...cleanCurrentConfig } = currentConfig;

            const newConfig = {
                ...cleanCurrentConfig,
                ...cleanTemplateConfig
            };

            const draftResult = await saveDraftConfig(newConfig);

            if (!draftResult.success) {
                setApplyStatus("error");
                setTimeout(() => {
                    setConfirmTemplate(null);
                    setApplyStatus("idle");
                }, 2000);
                return;
            }

            const publishResult = await publishStoreConfig();

            if (publishResult.success) {
                setApplyStatus("success");
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                setApplyStatus("error");
                setTimeout(() => {
                    setConfirmTemplate(null);
                    setApplyStatus("idle");
                }, 2000);
            }
        } catch (error) {
            console.error("Error applying template:", error);
            setApplyStatus("error");
            setTimeout(() => {
                setConfirmTemplate(null);
                setApplyStatus("idle");
            }, 2000);
        } finally {
            setApplying(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Apply Confirmation Modal */}
            {confirmTemplate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => applyStatus === "idle" && setConfirmTemplate(null)}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                    >
                        <div
                            className="h-2"
                            style={{
                                background: `linear-gradient(to right, ${confirmTemplate.colors.primary}, ${confirmTemplate.colors.secondary})`
                            }}
                        />

                        <div className="p-6">
                            {applyStatus === "idle" && (
                                <>
                                    <div
                                        className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                                        style={{ backgroundColor: confirmTemplate.colors.primary + "15" }}
                                    >
                                        <Palette className="w-7 h-7" style={{ color: confirmTemplate.colors.primary }} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-center text-gray-900 mb-1">
                                        {confirmTemplate.name}
                                    </h3>
                                    <p className="text-sm text-center text-gray-500 mb-6">
                                        Aplicar este tema a sua loja?
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setConfirmTemplate(null)}
                                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={confirmApply}
                                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors hover:opacity-90"
                                            style={{ backgroundColor: confirmTemplate.colors.primary }}
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                </>
                            )}

                            {applyStatus === "applying" && (
                                <div className="py-8 text-center">
                                    <Loader2
                                        className="w-10 h-10 mx-auto mb-4 animate-spin"
                                        style={{ color: confirmTemplate.colors.primary }}
                                    />
                                    <p className="text-sm text-gray-600">Aplicando tema...</p>
                                </div>
                            )}

                            {applyStatus === "success" && (
                                <div className="py-8 text-center">
                                    <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-50">
                                        <Check className="w-7 h-7 text-green-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Tema aplicado!</p>
                                    <p className="text-xs text-gray-500 mt-1">Recarregando...</p>
                                </div>
                            )}

                            {applyStatus === "error" && (
                                <div className="py-8 text-center">
                                    <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-50">
                                        <span className="text-2xl">:(</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Erro ao aplicar</p>
                                    <p className="text-xs text-gray-500 mt-1">Tente novamente</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Template List */}
            <div className="grid grid-cols-1 gap-4">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className={cn(
                            "group relative border-2 rounded-xl overflow-hidden transition-all hover:shadow-lg",
                            activeTemplateId === template.id
                                ? "border-green-300 bg-green-50/30"
                                : "hover:border-purple-300"
                        )}
                    >
                        <div className="flex items-center gap-4 p-4">
                            {/* Color Preview - Click opens full preview */}
                            <div
                                className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => openPreview(template.id)}
                            >
                                <div className="flex h-full">
                                    <div className="flex-1" style={{ backgroundColor: template.colors.primary }} />
                                    <div className="flex-1" style={{ backgroundColor: template.colors.secondary }} />
                                    <div className="flex-1 border-l-2 border-white" style={{ backgroundColor: template.colors.background }} />
                                </div>
                            </div>

                            {/* Template Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg text-slate-900">{template.name}</h3>
                                    {activeTemplateId === template.id && (
                                        <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                            Atual
                                        </Badge>
                                    )}
                                    {template.badge && activeTemplateId !== template.id && (
                                        <Badge
                                            className={cn(
                                                "text-xs",
                                                template.badge === "Novo" && "bg-blue-100 text-blue-700 border-blue-200",
                                                template.badge === "Popular" && "bg-orange-100 text-orange-700 border-orange-200"
                                            )}
                                        >
                                            {template.badge}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{template.description}</p>

                                {template.features && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {template.features.map((feature, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <div
                                        className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                                        style={{ backgroundColor: template.colors.primary }}
                                        title="Cor Principal"
                                    />
                                    <div
                                        className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                                        style={{ backgroundColor: template.colors.secondary }}
                                        title="Cor Secundaria"
                                    />
                                    <div
                                        className="h-5 w-5 rounded-full border-2 border-slate-200 shadow-sm"
                                        style={{ backgroundColor: template.colors.background }}
                                        title="Cor de Fundo"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex-shrink-0 flex flex-col gap-2">
                                {/* Preview Button - Opens in new tab */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openPreview(template.id)}
                                    className="gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Preview
                                    <ExternalLink className="h-3 w-3 opacity-50" />
                                </Button>

                                {/* Apply Button */}
                                <Button
                                    size="sm"
                                    onClick={() => handleApply(template)}
                                    disabled={applying !== null || activeTemplateId === template.id}
                                    className={cn(
                                        "gap-2 transition-all",
                                        applying === template.id
                                            ? "bg-blue-600 hover:bg-blue-600"
                                            : activeTemplateId === template.id
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-purple-600 hover:bg-purple-700"
                                    )}
                                >
                                    {applying === template.id ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Aplicando...
                                        </>
                                    ) : activeTemplateId === template.id ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Ativo
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            Aplicar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
