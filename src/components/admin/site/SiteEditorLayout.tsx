"use client";
// forcing refresh

import { useState, useEffect, useTransition, useRef } from "react";
import { publishStoreConfig, discardDraft, saveDraftConfig } from "@/lib/actions/settings";

import { SiteBrandingForm } from "@/components/admin/site/sections/SiteBrandingForm";
import { SiteColorsForm } from "@/components/admin/site/sections/SiteColorsForm";
import { SiteTypographyForm } from "@/components/admin/site/sections/SiteTypographyForm";
import { SiteHomeForm } from "@/components/admin/site/sections/SiteHomeForm";
import { SiteHeaderForm } from "@/components/admin/site/sections/SiteHeaderForm";
import { SiteFooterForm } from "@/components/admin/site/sections/SiteFooterForm";
import { SiteProductListForm } from "@/components/admin/site/sections/SiteProductListForm";
import { SiteProductDetailForm } from "@/components/admin/site/sections/SiteProductDetailForm";
import { SiteCartForm } from "@/components/admin/site/sections/SiteCartForm";

import { SiteContactForm } from "./SiteContactForm";
import { SiteBanners } from "./SiteBanners";
import { MockCategoryNav } from "./MockCategoryNav";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { Eye, Check, ChevronLeft, ChevronRight, LayoutTemplate, Palette, Type, PanelTop, Home, Grid, ShoppingBag, ShoppingCart, PanelBottom, Code, Share2, List, FileText, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper for Sidebar Menu Item
const SidebarMenuItem = ({ label, icon: Icon, onClick, disabled }: { label: string, icon: any, onClick: () => void, disabled?: boolean }) => (
    <div
        onClick={disabled ? undefined : onClick}
        className={cn(
            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group",
            disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 hover:text-blue-600"
        )}
    >
        <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">{label}</span>
        </div>
        {!disabled && <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />}
    </div>
);

const getSectionLabel = (key: string) => {
    const labels: Record<string, string> = {
        "branding": "Imagem da sua marca",
        "colors": "Cores da sua marca",
        "typography": "Tipo de Letra",
        "header": "Cabeçalho",
        "home": "Página inicial",
        "products-list": "Lista de produtos",
        "products-detail": "Detalhe do produto",
        "cart": "Carrinho de compras",
        "footer": "Rodapé da página"
    };
    return labels[key] || key;
};

interface SiteEditorLayoutProps {
    config: any;
    banners: any[];
    products?: any[];
}

export function SiteEditorLayout({ config, banners, products }: SiteEditorLayoutProps) {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    // Local state for Live Preview
    const [activeConfig, setActiveConfig] = useState(config);

    // Sync with server state on load/save
    useEffect(() => {
        setActiveConfig(config);
    }, [config]);

    const handleConfigChange = (key: string, value: any) => {
        setActiveConfig((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const [fullScreenPreview, setFullScreenPreview] = useState(false);
    const [mobileEditMode, setMobileEditMode] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [isPublishing, startPublish] = useTransition();
    const [isDiscarding, startDiscard] = useTransition();

    const handlePublish = () => {
        startPublish(async () => {
            const res = await publishStoreConfig();
            if (res.success) {
                alert("Site publicado com sucesso!");
                window.location.reload();
            } else {
                alert("Erro ao publicar: " + res.message);
            }
        });
    };

    const handleDiscard = () => {
        if (!confirm("Tem certeza? Isso apagará todas as alterações feitas no rascunho e voltará para a versão que está no ar hoje.")) return;

        startDiscard(async () => {
            const res = await discardDraft();
            if (res.success) {
                // Force reload to see reverted config
                window.location.reload();
            } else {
                alert("Erro: " + res.message);
            }
        });
    };

    const previewRef = useRef<HTMLDivElement>(null);

    // Intercept clicks in Preview to prevent navigation
    useEffect(() => {
        const container = previewRef.current;
        if (!container) return;

        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest("a");

            if (link) {
                const href = link.getAttribute("href");
                // Allow hash links (anchors) if needed, or mostly block all
                if (href && !href.startsWith("#")) {
                    e.preventDefault();
                    e.stopPropagation();
                    alert(`Modo de Edição: O clique neste link levaria para "${href}". A navegação foi bloqueada para não sair do editor.`);
                }
            }
        };

        // Capture phase ensures we get it before Next.js Link or other handlers
        container.addEventListener("click", handleLinkClick, { capture: true });

        return () => {
            container.removeEventListener("click", handleLinkClick, { capture: true });
        };
    }, []);

    const renderContent = () => {
        const props = { config: activeConfig, onConfigChange: handleConfigChange };

        // Pass onConfigChange only to forms that support it
        switch (activeSection) {

            case "branding": return <SiteBrandingForm config={activeConfig} onConfigChange={handleConfigChange} />;
            case "colors": return <SiteColorsForm config={activeConfig} onConfigChange={handleConfigChange} />;
            case "typography": return <SiteTypographyForm config={activeConfig} onConfigChange={handleConfigChange} />;
            case "header": return <SiteHeaderForm config={activeConfig} onConfigChange={handleConfigChange} />;
            case "home": return <SiteHomeForm
                config={activeConfig}
                onEdit={(sectionId) => {
                    // Mapping to internal sections or alerts for external pages
                    const mapping: Record<string, string> = {
                        "hero": "banners",
                        "categories-main": "products-list", // Fallback for now? Or alert. Categories are external.
                        "products-new": "products-list",
                        "products-featured": "products-list",
                        "products-offers": "products-list",
                        "brands": "branding",
                        "instagram": "contact", // Social Links usually here
                        "info-shipping": "footer",
                        "newsletter": "footer",
                        "testimonials": "contact", // Simplification
                        "banners-promo": "banners",
                        "banners-categories": "banners"
                    };

                    if (sectionId === "categories-main") {
                        if (confirm("As categorias são gerenciadas no menu 'Categorias'. Deseja ir para lá?")) {
                            window.open("/admin/categorias", "_blank");
                        }
                        return;
                    }

                    if (mapping[sectionId]) {
                        setActiveSection(mapping[sectionId] as any);
                    } else {
                        alert("Configuração rápida desta seção em breve. Use o menu lateral.");
                    }
                }}
            />;
            case "banners": return <SiteBanners banners={banners} />;
            case "products-list": return <SiteProductListForm config={activeConfig} />;
            case "products-detail": return <SiteProductDetailForm config={activeConfig} />;
            case "cart": return <SiteCartForm config={activeConfig} />;
            case "footer": return <SiteFooterForm config={activeConfig} />;
            case "contact": return <SiteContactForm config={activeConfig} />;
            default: return <SiteBrandingForm config={activeConfig} />;
        }
    };

    return (
        <div className="flex h-full bg-white overflow-hidden relative">

            {/* Mobile Fab to Toggle Edit Mode */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
                {!mobileEditMode && (
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setMobileEditMode(true)}
                    >
                        <Palette className="h-6 w-6" />
                    </Button>
                )}
            </div>

            {/* Left Panel: Editor Controls (Drill-down) */}
            {/* Logic: Visible if NOT fullScreenPreview. Responsive: Hidden on mobile unless mobileEditMode is true. */}
            {(!fullScreenPreview || mobileEditMode) && (
                <div className={cn(
                    "flex flex-col border-r bg-white shadow-xl z-40 transition-all duration-300",
                    // Desktop styles
                    "md:w-[400px] md:relative md:flex",
                    // Mobile styles
                    mobileEditMode ? "fixed inset-0 w-full" : "hidden"
                )}>

                    {/* Header of Sidebar */}
                    <div className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-white">
                        <div className="flex items-center gap-2">
                            {activeSection ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="-ml-2 gap-1 text-slate-500 hover:text-slate-900 font-normal"
                                    onClick={() => setActiveSection(null as any)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Voltar
                                </Button>
                            ) : (
                                <span className="font-bold text-slate-800">Personalizar Layout</span>
                            )}
                        </div>

                        {/* Mobile Close Button */}
                        <div className="md:hidden">
                            <Button variant="ghost" size="sm" onClick={() => setMobileEditMode(false)}>
                                Fechar
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto bg-white sidebar-scroll">

                        {activeSection ? (
                            /* Active Form View */
                            <div className="p-4">
                                <div className="mb-4 pb-2 border-b">
                                    <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
                                        {getSectionLabel(activeSection)}
                                    </h2>
                                </div>
                                {renderContent()}
                            </div>
                        ) : (
                            /* Main Menu View (Print 4 Style) */
                            <div className="py-2">
                                <div className="px-4 py-3">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Geral</h3>

                                    <SidebarMenuItem
                                        label="Imagem da sua marca"
                                        icon={LayoutTemplate}
                                        onClick={() => setActiveSection("branding")}
                                    />
                                    <SidebarMenuItem
                                        label="Cores da sua marca"
                                        icon={Palette}
                                        onClick={() => setActiveSection("colors")}
                                    />
                                    <SidebarMenuItem
                                        label="Tipo de Letra"
                                        icon={Type}
                                        onClick={() => setActiveSection("typography")}
                                    />
                                    <SidebarMenuItem
                                        label="Contatos & Redes Sociais"
                                        icon={Share2}
                                        onClick={() => setActiveSection("contact")}
                                    />
                                </div>

                                <div className="border-t my-1"></div>

                                <div className="px-4 py-3">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Configurações avançadas</h3>
                                    <SidebarMenuItem
                                        label="Cabeçalho"
                                        icon={PanelTop}
                                        onClick={() => setActiveSection("header")}
                                    />
                                    <SidebarMenuItem
                                        label="Página inicial"
                                        icon={Home}
                                        onClick={() => setActiveSection("home")}
                                    />
                                    <SidebarMenuItem
                                        label="Menus de Navegação"
                                        icon={List}
                                        onClick={() => window.open("/admin/menus", "_blank")}
                                    />
                                    <SidebarMenuItem
                                        label="Páginas Institucionais"
                                        icon={FileText}
                                        onClick={() => window.open("/admin/paginas", "_blank")}
                                    />
                                    <SidebarMenuItem
                                        label="Lista de produtos"
                                        icon={Grid}
                                        onClick={() => setActiveSection("products-list")}
                                    />
                                    <SidebarMenuItem
                                        label="Detalhe do produto"
                                        icon={ShoppingBag}
                                        onClick={() => setActiveSection("products-detail")}
                                    />
                                    <SidebarMenuItem
                                        label="Carrinho de compras"
                                        icon={ShoppingCart}
                                        onClick={() => setActiveSection("cart")}
                                    />
                                    <SidebarMenuItem
                                        label="Rodapé da página"
                                        icon={PanelBottom}
                                        onClick={() => setActiveSection("footer")}
                                    />
                                </div>

                                <div className="border-t my-1"></div>

                                <div className="px-4 py-3">
                                    <SidebarMenuItem
                                        label="Edição de CSS avançada"
                                        icon={Code}
                                        onClick={() => {/* TODO */ }}
                                        disabled
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions (Salvar/Publicar) - Fixed at bottom of sidebar */}
                    <div className="p-4 border-t bg-slate-50">
                        <div className="flex gap-2">
                            <Button
                                className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                variant="outline"
                                onClick={async () => {
                                    const res = await saveDraftConfig(activeConfig);
                                    if (res.success) alert("Rascunho salvo!");
                                    else alert("Erro: " + res.message);
                                }}
                                disabled={isPublishing || isDiscarding}
                            >
                                Salvar Rascunho
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={async () => {
                                    // Save first to ensure WYSIWYG match
                                    await saveDraftConfig(activeConfig);
                                    handlePublish();
                                }}
                                disabled={isPublishing || isDiscarding}
                            >
                                {isPublishing ? "Publicando..." : "Publicar"}
                            </Button>
                        </div>
                        <div className="mt-2 text-center">
                            <button
                                onClick={handleDiscard}
                                disabled={isPublishing || isDiscarding}
                                className="text-xs text-red-400 hover:text-red-600 underline"
                            >
                                Descartar alterações (Resetar)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Right Panel: Live Preview */}
            <div className={cn(
                "flex-1 bg-slate-100 overflow-y-auto flex items-start justify-center relative transition-all duration-300",
                fullScreenPreview ? "p-0" : "p-8"
            )}>
                {!fullScreenPreview && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        {/* Device Toggles */}
                        <div className="bg-white/80 backdrop-blur rounded-lg border shadow-sm flex items-center p-1 gap-1">
                            <Button
                                variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setPreviewDevice('desktop')}
                                title="Visualizar Desktop"
                            >
                                <LayoutTemplate className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setPreviewDevice('mobile')}
                                title="Visualizar Mobile"
                            >
                                <Smartphone className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 border shadow-sm flex items-center gap-2 pointer-events-none h-10">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live Preview
                        </div>
                    </div>
                )}

                {/* Browser Frame */}
                {/* Responsive Width Logic */}
                <div
                    ref={previewRef}
                    className={cn(
                        "bg-white shadow-2xl overflow-hidden border border-slate-200 origin-top transform transition-all duration-500",
                        fullScreenPreview ? "w-full h-full rounded-none scale-100 border-0" : "min-h-[800px] rounded-lg scale-[0.9]",
                        /* Width override based on device */
                        !fullScreenPreview && previewDevice === 'mobile' ? "w-[375px] border-slate-300 border-[8px] rounded-[3rem]" : (!fullScreenPreview && "w-full max-w-[1200px]")
                    )}
                >
                    {/* Preview Styles Injection */}
                    <style jsx global>{`
                            .preview-scope {
                                --background: ${activeConfig.backgroundColor || "#ffffff"};
                                --foreground: ${activeConfig.bodyColor || "#334155"};
                                --primary: ${activeConfig.themeColor || "#db2777"};
                                --brand-accent: ${(activeConfig as any).accentColor || (activeConfig as any).themeColor || "#db2777"};
                                --price-color: ${(activeConfig as any).priceColor || (activeConfig as any).accentColor || (activeConfig as any).themeColor || "#db2777"};
                                --primary-foreground: #ffffff; 

                                --primary-foreground: #ffffff; 

                                --color-section-title: ${(activeConfig as any).sectionTitleColor || activeConfig.headingColor || "#111827"};
                                --color-hero-text: ${(activeConfig as any).bannerTextColor || activeConfig.headingColor || "#111827"};

                                --btn-header-bg: ${(activeConfig as any).headerBtnBg || activeConfig.themeColor || "#db2777"};
                                --btn-header-text: ${(activeConfig as any).headerBtnText || "#ffffff"};
                                --btn-product-bg: ${(activeConfig as any).productBtnBg || activeConfig.themeColor || "#db2777"};
                                --btn-product-text: ${(activeConfig as any).productBtnText || "#ffffff"};
                                
                                --header-bg: ${activeConfig.headerColor || activeConfig.backgroundColor || "#ffffff"};
                                --footer-bg: ${activeConfig.footerBg || "#171717"};
                                --footer-text: ${activeConfig.footerText || "#a3a3a3"};
                                --footer-border: ${activeConfig.footerBg ? activeConfig.footerBg : "#border"};
                                
                                --color-search-bg: ${activeConfig.searchBtnBg || activeConfig.themeColor || "#db2777"};
                                --color-search-icon: ${activeConfig.searchIconColor || "#ffffff"};
                                --color-cart-bg: ${activeConfig.cartCountBg || "#22c55e"};
                                --color-cart-text: ${activeConfig.cartCountText || "#ffffff"};
                                --color-menu: ${activeConfig.menuColor || "#334155"};

                                --font-heading: ${activeConfig.headingFont || "Inter"}, sans-serif;
                                --font-body: ${activeConfig.bodyFont || "Inter"}, sans-serif;
                                --size-heading: ${activeConfig.headingFontSize || "32px"};
                                --size-body: ${activeConfig.bodyFontSize || "16px"};
                            }
                            
                            /* Apply Fonts */
                            .preview-scope h1, .preview-scope h2, .preview-scope h3, .preview-scope h4, .preview-scope h5, .preview-scope h6 {
                                font-family: var(--font-heading);
                            }
                            .preview-scope {
                                font-family: var(--font-body);
                                font-size: var(--size-body);
                            }
                        `}</style>
                    {/* Dynamic Font Loader (Simple version) */}
                    <link href={`https://fonts.googleapis.com/css2?family=${(activeConfig.headingFont || "Inter").replace(' ', '+')}:wght@400;700&family=${(activeConfig.bodyFont || "Inter").replace(' ', '+')}:wght@400;500;700&display=swap`} rel="stylesheet" />

                    <div className="preview-scope min-h-full font-sans antialiased text-foreground h-full overflow-y-auto" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>



                        {/* Header Preview */}
                        <Header config={activeConfig} />

                        {/* Category Nav Mock (Always visible or controlled by layout? Usually part of layout in page.tsx but here separated. Let's keep it separated for now or move it if needed) */}
                        {/* Actually page.tsx has categories-main as a section. Let's respect that. */}

                        {/* Dynamic Layout Rendering */}
                        <div className="pb-20">
                            {(() => {
                                let layout = [];
                                try {
                                    layout = activeConfig.homeLayout ? JSON.parse(activeConfig.homeLayout) : [];
                                    // Fallback if empty array
                                    if (layout.length === 0) layout = [
                                        { id: "hero", enabled: true },
                                        { id: "products-new", enabled: true }
                                    ];
                                } catch (e) {
                                    layout = [
                                        { id: "hero", enabled: true },
                                        { id: "products-new", enabled: true }
                                    ];
                                }

                                return layout
                                    .filter((section: any) => section.enabled)
                                    .map((section: any, index: number) => {
                                        switch (section.id) {
                                            case "categories-main":
                                                return <MockCategoryNav key={index} config={activeConfig} />;

                                            case "hero":
                                                return (
                                                    <div key={index} className="container mx-auto px-4 py-6">
                                                        <div className="bg-slate-50 rounded-2xl h-[400px] flex items-center justify-center relative overflow-hidden group">
                                                            {activeConfig.bannerUrl ? (
                                                                <img src={activeConfig.bannerUrl} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
                                                            ) : (
                                                                <div className="text-center space-y-4 relative z-10">
                                                                    <h2 className="text-4xl font-bold tracking-tight text-slate-900" style={{ color: "var(--color-hero-text)" }}>
                                                                        {activeConfig.storeName || "Sua Loja Incrível"}
                                                                    </h2>
                                                                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                                                                        {activeConfig.description || "Os melhores produtos de beleza você encontra aqui."}
                                                                    </p>
                                                                    <Button className="mt-4" style={{ backgroundColor: "var(--primary)" }}>Comprar Agora</Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );

                                            case "products-new":
                                            case "products-featured":
                                            case "products-offers":
                                                // Generic Product Grid for Preview
                                                return (
                                                    <div key={index} className="container mx-auto px-4 py-8">
                                                        <h3 className="text-2xl font-bold mb-6" style={{ color: activeConfig.headingColor }}>
                                                            {section.id === "products-new" ? "Lançamentos" :
                                                                section.id === "products-offers" ? "Ofertas" : "Destaques"}
                                                        </h3>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                            {(products && products.length > 0 ? products : [1, 2, 3, 4]).slice(0, 4).map((p: any, i) => {
                                                                const isMock = typeof p === 'number';
                                                                const name = isMock ? `Produto Exemplo ${p}` : p.name;
                                                                const price = isMock ? 129.90 : Number(p.price);
                                                                const image = isMock ? null : p.images?.[0]?.url;

                                                                return (
                                                                    <div key={i} className="space-y-3 group cursor-pointer">
                                                                        <div className="aspect-square bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                                                                            {image ? (
                                                                                <img src={image} alt={name} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <div className="text-slate-300 bg-slate-200 w-full h-full flex items-center justify-center">
                                                                                    {isMock ? `Produto ${p}` : "Sem Imagem"}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm text-muted-foreground">Categoria</div>
                                                                            <div className="font-medium truncate">{name}</div>
                                                                            <div className="font-bold mt-1" style={{ color: "var(--price-color)" }}>
                                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );

                                            case "instagram":
                                                return (
                                                    <div key={index} className="container mx-auto px-4 py-8 text-center border-2 border-dashed rounded-xl m-4">
                                                        <h3 className="text-xl text-slate-400">Feed do Instagram</h3>
                                                    </div>
                                                );

                                            default:
                                                return null;
                                        }
                                    });
                            })()}
                        </div>

                        {/* Footer Preview */}
                        <Footer config={activeConfig} />
                    </div>
                </div>
            </div>
        </div>
    );
}
