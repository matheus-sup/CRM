"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Eye, Sparkles, ShoppingBag, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveDraftConfig, publishStoreConfig } from "@/lib/actions/settings";

interface Template {
    id: string;
    name: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
    };
    badge?: string;
    features?: string[]; // Features/styles this template uses
    config: any;
}

const templates: Template[] = [
    {
        id: "classic",
        name: "Clássico Elegante",
        description: "Design tradicional e sofisticado, perfeito para lojas premium",
        features: ["Hero centralizado", "Categorias em grid", "Newsletter completa"],
        colors: {
            primary: "#db2777",
            secondary: "#fce7f3",
            background: "#ffffff"
        },
        config: {
            themeColor: "#db2777",
            secondaryColor: "#fce7f3",
            backgroundColor: "#ffffff",
            headerColor: "#ffffff",
            footerBg: "#0f172a",
            footerText: "#a3a3a3",
            headingColor: "#111827",
            bodyColor: "#334155",
            menuColor: "#334155",
            // Component Styles
            headerStyle: "classic",
            cardStyle: "standard",
            footerStyle: "full",
            homeLayout: JSON.stringify([
                {
                    id: "hero-classic",
                    type: "hero",
                    content: {
                        slides: [{
                            id: "slide-1",
                            title: "Beleza que Transforma",
                            subtitle: "Descubra os melhores produtos de beleza e cosméticos",
                            buttonText: "Ver Coleção",
                            buttonLink: "/produtos"
                        }],
                        autoplay: false
                    },
                    styles: {
                        variant: "default", // Hero: default, minimal, split
                        minHeight: "80vh",
                        background: "linear-gradient(to bottom right, #db2777, #9333ea)",
                        textColor: "#ffffff",
                        titleColor: "#ffffff",
                        textAlign: "center",
                        buttonColor: "#ffffff",
                        buttonTextColor: "#db2777",
                        fullWidth: true
                    }
                },
                {
                    id: "products-classic",
                    type: "product-grid",
                    content: { collectionType: "new", title: "Novidades", limit: 8 },
                    styles: { backgroundColor: "#ffffff", textColor: "#111827", accentColor: "#db2777", fullWidth: true }
                },
                {
                    id: "categories-classic",
                    type: "categories",
                    content: { title: "Categorias em Destaque", selectionMode: "auto", limit: 6 },
                    styles: { variant: "grid", headingColor: "#111827", cardTextColor: "#ffffff", fullWidth: true }
                },
                {
                    id: "newsletter-classic",
                    type: "newsletter",
                    content: { title: "Entre para o Clube", description: "Receba novidades e promoções exclusivas direto no seu e-mail", placeholder: "seu@email.com", buttonText: "Inscrever" },
                    styles: { variant: "full", backgroundColor: "#0f172a", titleColor: "#ffffff", textColor: "#a3a3a3", iconColor: "#db2777", buttonColor: "#db2777", buttonTextColor: "#ffffff", fullWidth: true }
                }
            ])
        }
    },
    {
        id: "minimal",
        name: "Minimalista Moderno",
        description: "Design limpo e minimalista, focado na experiência do usuário",
        badge: "Novo",
        features: ["Hero compacto", "Categorias horizontais", "Newsletter inline"],
        colors: {
            primary: "#000000",
            secondary: "#f5f5f5",
            background: "#ffffff"
        },
        config: {
            themeColor: "#000000",
            secondaryColor: "#f5f5f5",
            backgroundColor: "#ffffff",
            headerColor: "#ffffff",
            footerBg: "#000000",
            footerText: "#ffffff",
            headingColor: "#000000",
            bodyColor: "#404040",
            menuColor: "#000000",
            // Component Styles - Minimalista
            headerStyle: "minimal",
            cardStyle: "compact",
            footerStyle: "minimal",
            homeLayout: JSON.stringify([
                {
                    id: "hero-minimal",
                    type: "hero",
                    content: {
                        slides: [{
                            id: "slide-1",
                            title: "Menos é Mais",
                            subtitle: "Cosméticos essenciais para sua rotina de beleza",
                            buttonText: "Explorar",
                            buttonLink: "/produtos"
                        }],
                        autoplay: false
                    },
                    styles: {
                        variant: "minimal", // Hero minimal - typography focused
                        background: "#f5f5f5",
                        textColor: "#666666",
                        titleColor: "#000000",
                        buttonColor: "#000000",
                        buttonTextColor: "#ffffff",
                        fullWidth: true
                    }
                },
                {
                    id: "categories-minimal",
                    type: "categories",
                    content: { title: "Categorias", selectionMode: "auto", limit: 6 },
                    styles: { variant: "horizontal", headingColor: "#000000", accentColor: "#000000", fullWidth: true }
                },
                {
                    id: "products-minimal",
                    type: "product-grid",
                    content: { collectionType: "featured", title: "Essenciais", limit: 6 },
                    styles: { backgroundColor: "#ffffff", textColor: "#000000", accentColor: "#000000", fullWidth: true, paddingTop: "3rem", paddingBottom: "5rem" }
                },
                {
                    id: "newsletter-minimal",
                    type: "newsletter",
                    content: { title: "Newsletter", description: "Novidades exclusivas", placeholder: "seu@email.com", buttonText: "→" },
                    styles: { variant: "compact", backgroundColor: "#000000", titleColor: "#ffffff", textColor: "#ffffff", buttonColor: "#ffffff", buttonTextColor: "#000000", fullWidth: true }
                }
            ])
        }
    },
    {
        id: "vibrant",
        name: "Vibrante & Ousado",
        description: "Cores vivas e design ousado para marcas jovens e modernas",
        badge: "Popular",
        features: ["Hero dividido", "Categorias circulares", "Newsletter split"],
        colors: {
            primary: "#ff6b6b",
            secondary: "#4ecdc4",
            background: "#ffe66d"
        },
        config: {
            themeColor: "#ff6b6b",
            secondaryColor: "#4ecdc4",
            backgroundColor: "#ffffff",
            headerColor: "#ffe66d",
            footerBg: "#2c3e50",
            footerText: "#ecf0f1",
            headingColor: "#2c3e50",
            bodyColor: "#34495e",
            menuColor: "#2c3e50",
            // Component Styles - Vibrante
            headerStyle: "centered",
            cardStyle: "detailed",
            footerStyle: "modern",
            homeLayout: JSON.stringify([
                {
                    id: "hero-vibrant",
                    type: "hero",
                    content: {
                        slides: [
                            { id: "slide-1", title: "Brilhe com Cor", subtitle: "Expresse sua personalidade com nossa coleção vibrante", buttonText: "Descobrir", buttonLink: "/produtos" },
                            { id: "slide-2", title: "Nova Coleção", subtitle: "Tendências que você vai amar", buttonText: "Ver Agora", buttonLink: "/produtos?collection=new" }
                        ],
                        autoplay: true,
                        autoplayInterval: 5
                    },
                    styles: {
                        variant: "split", // Hero split - two columns
                        backgroundColor: "#ffffff",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        accentColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        textColor: "#6b7280",
                        titleColor: "#2c3e50",
                        buttonColor: "#ff6b6b",
                        buttonTextColor: "#ffffff",
                        fullWidth: true
                    }
                },
                {
                    id: "categories-vibrant",
                    type: "categories",
                    content: { title: "Explore por Categoria", selectionMode: "auto", limit: 8 },
                    styles: { variant: "circular", headingColor: "#2c3e50", accentColor: "#ff6b6b", fullWidth: true }
                },
                {
                    id: "products-vibrant",
                    type: "product-grid",
                    content: { collectionType: "featured", title: "🔥 Em Alta", limit: 8 },
                    styles: { backgroundColor: "#ffffff", textColor: "#2c3e50", accentColor: "#ff6b6b", fullWidth: true }
                },
                {
                    id: "newsletter-vibrant",
                    type: "newsletter",
                    content: { title: "Fique por Dentro", description: "Inscreva-se para receber ofertas exclusivas e novidades em primeira mão", placeholder: "Digite seu e-mail", buttonText: "Quero Receber" },
                    styles: { variant: "split", backgroundColor: "#f8fafc", titleColor: "#2c3e50", textColor: "#6b7280", buttonColor: "#ff6b6b", buttonTextColor: "#ffffff", fullWidth: true }
                }
            ])
        }
    }
];

// Preview Component - Mockup visual do site com estruturas diferentes
function TemplatePreview({ template }: { template: Template }) {
    const { colors, config } = template;
    const headerStyle = config.headerStyle || "classic";
    const cardStyle = config.cardStyle || "standard";
    const footerStyle = config.footerStyle || "full";

    return (
        <div className="w-full max-h-[70vh] overflow-y-auto rounded-lg border shadow-xl">
            {/* Header Mockup - Different structures per style */}
            {headerStyle === "classic" && (
                <div className="border-b" style={{ backgroundColor: config.headerColor || colors.background }}>
                    <div className="flex items-center justify-between px-4 py-3">
                        <span className="font-bold text-sm" style={{ color: config.menuColor || colors.primary }}>MINHA LOJA</span>
                        <div className="flex-1 mx-4 max-w-xs">
                            <div className="flex h-8 rounded-full border overflow-hidden">
                                <div className="flex-1 bg-gray-50" />
                                <div className="w-8 flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                                    <Search className="h-3 w-3 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" style={{ color: config.menuColor }} />
                            <ShoppingBag className="h-4 w-4" style={{ color: config.menuColor }} />
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 pb-2 text-[10px] font-semibold" style={{ color: config.menuColor }}>
                        <span>PRODUTOS</span><span>CATEGORIAS</span><span>OFERTAS</span>
                    </div>
                </div>
            )}

            {headerStyle === "centered" && (
                <div className="border-b" style={{ backgroundColor: config.headerColor || colors.background }}>
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 text-[10px]" style={{ color: config.menuColor }}>
                        <span className="flex items-center gap-1"><Search className="h-3 w-3" />Buscar</span>
                        <div className="flex gap-4 font-medium"><span>PRODUTOS</span><span>CATEGORIAS</span></div>
                        <span className="flex items-center gap-1"><ShoppingBag className="h-3 w-3" />Carrinho</span>
                    </div>
                    <div className="py-4 text-center">
                        <span className="text-xl font-black" style={{ color: colors.primary }}>MINHA LOJA</span>
                        <p className="text-[9px] tracking-widest text-gray-400 mt-1">COSMÉTICOS • MAKES</p>
                    </div>
                </div>
            )}

            {headerStyle === "minimal" && (
                <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: config.headerColor || colors.background }}>
                    <span className="font-bold" style={{ color: colors.primary }}>LOJA</span>
                    <div className="flex gap-5 text-[10px] font-medium" style={{ color: config.menuColor }}>
                        <span>Produtos</span><span>Sobre</span><span>Contato</span>
                    </div>
                    <div className="flex gap-2">
                        <Search className="h-3.5 w-3.5" style={{ color: config.menuColor }} />
                        <ShoppingBag className="h-3.5 w-3.5" style={{ color: config.menuColor }} />
                    </div>
                </div>
            )}

            {/* Hero Mockup */}
            <div
                className="relative h-40 flex items-center"
                style={{
                    background: template.id === "classic"
                        ? `linear-gradient(to bottom right, ${colors.primary}, #9333ea)`
                        : template.id === "vibrant"
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : colors.secondary,
                    justifyContent: headerStyle === "minimal" ? "flex-start" : "center",
                    paddingLeft: headerStyle === "minimal" ? "1.5rem" : "0"
                }}
            >
                <div className={headerStyle === "minimal" ? "text-left" : "text-center"}>
                    <h2 className="text-lg font-bold mb-1" style={{ color: template.id === "minimal" ? colors.primary : "#ffffff" }}>
                        {template.id === "classic" && "Beleza que Transforma"}
                        {template.id === "minimal" && "Menos é Mais"}
                        {template.id === "vibrant" && "Brilhe com Cor"}
                    </h2>
                    <p className="text-[10px] mb-2 opacity-80" style={{ color: template.id === "minimal" ? "#666" : "#ffffff" }}>
                        Descubra nossa coleção exclusiva
                    </p>
                    <button
                        className={`px-3 py-1 text-[10px] font-medium ${headerStyle === "minimal" ? "rounded" : "rounded-full"}`}
                        style={{ backgroundColor: template.id === "minimal" ? colors.primary : "#ffffff", color: template.id === "minimal" ? "#ffffff" : colors.primary }}
                    >
                        Ver Coleção
                    </button>
                </div>
            </div>

            {/* Products Mockup - Different card styles */}
            <div className="p-3" style={{ backgroundColor: colors.background }}>
                <h3 className="text-xs font-bold mb-2 text-center" style={{ color: config.headingColor || colors.primary }}>
                    {template.id === "vibrant" ? "🔥 Em Alta" : "Novidades"}
                </h3>

                {cardStyle === "standard" && (
                    <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-lg overflow-hidden border bg-white p-1.5">
                                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-1.5" />
                                <div className="h-1.5 w-3/4 bg-gray-200 rounded mb-1" />
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold" style={{ color: colors.primary }}>R$ 49</span>
                                    <div className="h-4 w-4 rounded flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                                        <ShoppingBag className="h-2 w-2 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {cardStyle === "compact" && (
                    <div className="grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="text-center">
                                <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 mb-1" />
                                <div className="h-1.5 w-2/3 mx-auto bg-gray-200 rounded mb-0.5" />
                                <span className="text-[9px] font-semibold" style={{ color: colors.primary }}>R$ 49</span>
                            </div>
                        ))}
                    </div>
                )}

                {cardStyle === "detailed" && (
                    <div className="grid grid-cols-2 gap-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="rounded border overflow-hidden bg-white">
                                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
                                    <span className="absolute top-1 right-1 text-[8px] px-1.5 py-0.5 text-white" style={{ backgroundColor: colors.primary }}>-20%</span>
                                </div>
                                <div className="p-2">
                                    <div className="text-[8px] text-gray-400 mb-0.5">CATEGORIA</div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded mb-1" />
                                    <div className="flex gap-0.5 mb-1.5">{[1,2,3,4,5].map(s => <span key={s} className="text-[8px] text-yellow-400">★</span>)}</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold" style={{ color: colors.primary }}>R$ 49,90</span>
                                    </div>
                                    <button className="w-full mt-1.5 py-1 text-[8px] text-white rounded" style={{ backgroundColor: colors.primary }}>Adicionar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {cardStyle === "horizontal" && (
                    <div className="space-y-1.5">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-2 p-1.5 rounded border bg-white">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="h-1.5 w-3/4 bg-gray-200 rounded mb-1" />
                                    <div className="h-1.5 w-1/2 bg-gray-100 rounded mb-1" />
                                    <span className="text-[9px] font-bold" style={{ color: colors.primary }}>R$ 49,90</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Mockup - Different structures */}
            {footerStyle === "full" && (
                <div className="px-3 py-3" style={{ backgroundColor: config.footerBg || "#0f172a" }}>
                    <div className="grid grid-cols-4 gap-2 text-[8px] mb-2" style={{ color: config.footerText || "#ffffff" }}>
                        <div><span className="font-bold block mb-1" style={{ color: colors.primary }}>LOJA</span><span className="opacity-60">Sobre • Contato</span></div>
                        <div><span className="font-bold block mb-1 opacity-70">LINKS</span><span className="opacity-60">Produtos • FAQ</span></div>
                        <div><span className="font-bold block mb-1 opacity-70">AJUDA</span><span className="opacity-60">Trocas • Termos</span></div>
                        <div><span className="font-bold block mb-1 opacity-70">CONTATO</span><span className="opacity-60">📱 📧 📍</span></div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <div className="flex gap-1">{["💳","PIX"].map((p,i) => <span key={i} className="text-[7px] bg-white text-gray-800 px-1 rounded">{p}</span>)}</div>
                        <span className="text-[7px] opacity-40" style={{ color: config.footerText }}>© 2024 Minha Loja</span>
                    </div>
                </div>
            )}

            {footerStyle === "minimal" && (
                <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: config.footerBg || "#000" }}>
                    <span className="text-[10px] font-bold" style={{ color: config.footerText || "#fff" }}>LOJA</span>
                    <div className="flex gap-3 text-[9px] opacity-70" style={{ color: config.footerText }}>
                        <span>Produtos</span><span>Contato</span><span>Termos</span>
                    </div>
                    <span className="text-[8px] opacity-50" style={{ color: config.footerText }}>© 2024</span>
                </div>
            )}

            {footerStyle === "modern" && (
                <div className="px-3 py-3" style={{ backgroundColor: config.footerBg || "#1a1a2e" }}>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <span className="text-sm font-bold block mb-1" style={{ color: colors.primary }}>MINHA LOJA</span>
                            <p className="text-[8px] opacity-60 mb-2" style={{ color: config.footerText }}>Sua loja de cosméticos</p>
                            <div className="flex gap-1">
                                {["📸","📘","🎵"].map((e,i) => <span key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: colors.primary + "30" }}>{e}</span>)}
                            </div>
                        </div>
                        <div>
                            <div className="flex gap-1 mb-2">
                                <div className="flex-1 h-6 rounded bg-white/10" />
                                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                                    <span className="text-[10px] text-white">→</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[8px]" style={{ color: config.footerText }}>
                                <div className="opacity-60">Produtos • Ofertas</div>
                                <div className="opacity-60">Contato • Ajuda</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function TemplateGallery({ currentConfig }: { currentConfig: any }) {
    const [applying, setApplying] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    // Detect active template by comparing theme colors
    const detectActiveTemplate = () => {
        const currentThemeColor = currentConfig?.themeColor || "#db2777";
        const matchingTemplate = templates.find(t => t.config.themeColor === currentThemeColor);
        return matchingTemplate?.id || "classic";
    };

    const activeTemplateId = detectActiveTemplate();

    const handleApply = async (template: Template) => {
        if (!confirm(`Aplicar o template "${template.name}"?\n\nIsso substituirá as configurações atuais de cores e layout da página inicial.\n\nVocê poderá personalizar tudo depois.`)) {
            return;
        }

        setApplying(template.id);
        setPreviewTemplate(null);

        try {
            const validFields = [
                'storeName', 'description', 'bannerUrl', 'logoUrl', 'faviconUrl',
                'cnpj', 'legalName', 'themeColor', 'accentColor', 'priceColor',
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
                // Component Style Variants
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

            // DEBUG: Log what's being applied
            console.log("DEBUG Template homeLayout:", cleanTemplateConfig.homeLayout ? "HAS homeLayout" : "NO homeLayout");
            console.log("DEBUG Template headerStyle:", cleanTemplateConfig.headerStyle);
            console.log("DEBUG Template cardStyle:", cleanTemplateConfig.cardStyle);
            console.log("DEBUG Template footerStyle:", cleanTemplateConfig.footerStyle);

            const { id, createdAt, updatedAt, menus, products, categories, banners, ...cleanCurrentConfig } = currentConfig;

            const newConfig = {
                ...cleanCurrentConfig,
                ...cleanTemplateConfig
            };

            console.log("DEBUG Final Config homeLayout length:", newConfig.homeLayout?.length);

            const draftResult = await saveDraftConfig(newConfig);

            if (!draftResult.success) {
                alert(`❌ Erro ao salvar template: ${draftResult.message}`);
                return;
            }

            const publishResult = await publishStoreConfig();

            if (publishResult.success) {
                alert(`✅ Template "${template.name}" aplicado com sucesso!\n\nA página será recarregada.`);
                window.location.reload();
            } else {
                alert(`❌ Template salvo, mas erro ao publicar: ${publishResult.message}`);
            }
        } catch (error) {
            console.error("Error applying template:", error);
            alert("❌ Erro ao aplicar template. Tente novamente.");
        } finally {
            setApplying(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Preview Modal */}
            <Dialog open={previewTemplate !== null} onOpenChange={() => setPreviewTemplate(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Preview: {previewTemplate?.name}</span>
                        </DialogTitle>
                    </DialogHeader>
                    {previewTemplate && (
                        <div className="space-y-4">
                            <TemplatePreview template={previewTemplate} />
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setPreviewTemplate(null)}
                                >
                                    Fechar
                                </Button>
                                <Button
                                    onClick={() => handleApply(previewTemplate)}
                                    disabled={applying !== null || activeTemplateId === previewTemplate.id}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    {activeTemplateId === previewTemplate.id ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Tema Atual
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Aplicar Este Tema
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

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
                            {/* Color Preview */}
                            <div
                                className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setPreviewTemplate(template)}
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

                                {/* Features */}
                                {template.features && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {template.features.map((feature, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Color Swatches */}
                                <div className="flex gap-2">
                                    <div
                                        className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                                        style={{ backgroundColor: template.colors.primary }}
                                        title="Cor Principal"
                                    />
                                    <div
                                        className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                                        style={{ backgroundColor: template.colors.secondary }}
                                        title="Cor Secundária"
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
                                {/* Preview Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPreviewTemplate(template)}
                                    className="gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Preview
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
