"use client";
// forcing refresh

import { useState, useEffect, useTransition, useRef } from "react";
import { publishStoreConfig, discardDraft, saveDraftConfig } from "@/lib/actions/settings";
import { moveMenuItem } from "@/lib/actions/menu-reorder";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { SiteBrandingForm } from "@/components/admin/site/sections/SiteBrandingForm";
import { SiteColorsForm } from "@/components/admin/site/sections/SiteColorsForm";
import { SiteTypographyForm } from "@/components/admin/site/sections/SiteTypographyForm";
import { SiteHomeForm } from "@/components/admin/site/sections/SiteHomeForm";
import { SiteHeaderForm } from "@/components/admin/site/sections/SiteHeaderForm";
import { SiteFooterForm } from "@/components/admin/site/sections/SiteFooterForm";
import { SiteProductListForm } from "@/components/admin/site/sections/SiteProductListForm";
import { SiteProductDetailForm } from "@/components/admin/site/sections/SiteProductDetailForm";
import { SiteCartForm } from "@/components/admin/site/sections/SiteCartForm";
import { SiteStylesForm } from "@/components/admin/site/sections/SiteStylesForm";
import { SiteSectionEditor } from "@/components/admin/site/sections/SiteSectionEditor";
import { BlockPropertyEditor } from "@/components/admin/site/BlockPropertyEditor";
import { BlockLayerList } from "@/components/admin/site/BlockLayerList"; // New Layer List
import { BlockRenderer } from "@/components/shop/pbuilder/BlockRenderer";
import { SiteBlockSidebar } from "@/components/admin/site/SiteBlockSidebar";
import { BlockType, PageBlock } from "@/types/page-builder";
import { cn } from "@/lib/utils";

import { SiteContactForm } from "./SiteContactForm";
import { SiteBanners } from "./SiteBanners";
import { MockCategoryNav } from "./MockCategoryNav";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { EditableFooter } from "@/components/admin/footer/EditableFooter";
import { TemplateSelector } from "@/components/admin/site/TemplateSelector";
import { Button } from "@/components/ui/button";
import { Eye, Check, ChevronLeft, ChevronRight, LayoutTemplate, Palette, Type, PanelTop, Home, Grid, ShoppingBag, ShoppingCart, PanelBottom, Share2, List, FileText, Smartphone, Plus, Layers, MapPin } from "lucide-react";

// Simple ID generator to avoid 'uuid' package dependency issues
const uuidv4 = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

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
        "styles": "Estilos dos Componentes",
        "header": "Cabeçalho",
        "home": "Página inicial",
        "products-list": "Lista de produtos",
        "products-detail": "Detalhe do produto",
        "cart": "Carrinho de compras",
        "footer": "Rodapé da página"
    };
    return labels[key] || key;
};

import { ModernHome } from "@/components/shop/modern/ModernHome";
import { ThemeInjector } from "@/components/theme-injector";
import { CardapioPreview } from "@/components/admin/site/CardapioPreview";
import { ProductDetailPreview } from "@/components/admin/site/ProductDetailPreview";

interface SiteEditorLayoutProps {
    config: any;
    banners: any[];
    products?: any[];
    categories?: any[];
    brands?: any[];
    menus?: any[];
    deliveryCategories?: any[];
}

export function SiteEditorLayout({ config, banners, products, categories = [], brands = [], menus = [], deliveryCategories = [] }: SiteEditorLayoutProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const activeSection = searchParams.get("section");

    // Previous section storage for better navigation flow (e.g. Home -> Banner -> Back to Home)
    const [prevSection, setPrevSection] = useState<string | null>(null);

    const setSection = (section: string | null, isSubNavigation = false) => {
        const params = new URLSearchParams(searchParams.toString());
        if (section) {
            if (activeSection === "home" && isSubNavigation) {
                setPrevSection("home");
            } else if (!section) {
                setPrevSection(null);
            }
            params.set("section", section);
        } else {
            params.delete("section");
            setPrevSection(null);
        }

        // Use shallow routing / replace to avoid server re-fetch while editing
        // But Next.js App Router doesn't support "shallow" in the same way.
        // However, updating the URL is just for bookmarking. 
        // We can just rely on ensuring activeConfig is NOT reset.
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleBack = () => {
        if (prevSection) {
            setSection(prevSection);
            setPrevSection(null); // Consume the back state
        } else {
            setSection(null);
        }
    };

    // Local state for Live Preview
    const [activeConfig, setActiveConfig] = useState(config);

    // Sync with server state on load/save
    // Sync with server state on load/save
    // CRITICAL FIX: Do NOT reset activeConfig on every prop update, 
    // because navigation (url params) triggers server re-render with OLD data, wiping changes.
    /*
    useEffect(() => {
        setActiveConfig(config);
    }, [config]);
    */

    // --- Block Editor State ---
    const [blocks, setBlocks] = useState<PageBlock[]>([]);
    const [isBlockSidebarOpen, setIsBlockSidebarOpen] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null); // New state
    const [selectedField, setSelectedField] = useState<{ field: string; timestamp: number } | null>(null); // Track which field was clicked with timestamp for re-triggers

    // --- Header Editor State ---
    const [selectedHeaderField, setSelectedHeaderField] = useState<{ field: string; timestamp: number } | null>(null);

    // --- Footer Block Editor State ---
    const [footerBlocks, setFooterBlocks] = useState<any[]>([]);
    const [footerBottomBlocks, setFooterBottomBlocks] = useState<any[]>([]);
    const [footerBottomAlignment, setFooterBottomAlignment] = useState<"left" | "center" | "right">("center");
    const [selectedFooterBlockId, setSelectedFooterBlockId] = useState<string | null>(null);

    // Initialize footer blocks from config
    useEffect(() => {
        try {
            if (activeConfig?.footerBlocks) {
                const parsed = JSON.parse(activeConfig.footerBlocks);
                if (Array.isArray(parsed)) {
                    setFooterBlocks(parsed);
                } else {
                    setFooterBlocks(parsed.blocks || []);
                    setFooterBottomBlocks(parsed.bottomBlocks || []);
                    setFooterBottomAlignment(parsed.bottomAlignment || "center");
                }
            }
        } catch (e) {
            console.error("Error parsing footerBlocks:", e);
        }
    }, [activeConfig?.footerBlocks]);

    // Initialize blocks from config
    useEffect(() => {
        try {
            const parsed = JSON.parse(activeConfig.homeLayout || "[]");
            // Check if it's the new PageBuilder format (has 'type' property)
            const isPageBuilderFormat = Array.isArray(parsed) && parsed.length > 0 && parsed[0].type;

            if (isPageBuilderFormat) {
                // Use existing PageBuilder blocks
                setBlocks(parsed);
            } else {
                // Keep legacy format - don't auto-migrate
                // Set blocks to empty so ModernHome is used
                setBlocks([]);
            }
        } catch (e) {
            console.error("Error initializing blocks:", e);
            // Keep blocks empty to use ModernHome fallback
            setBlocks([]);
        }
    }, [activeConfig.homeLayout]);

    const handleAddBlock = (type: BlockType, variant?: string) => {
        const newBlock: PageBlock = {
            id: uuidv4(),
            type,
            variant,
            content: type === "html" ? { code: "<!-- Insira seu código aqui -->\n<div class='p-10 bg-blue-100 text-blue-800 rounded'>\n  <h2 class='text-2xl font-bold'>Olá Mundo!</h2>\n  <p>Edite este HTML livremente.</p>\n</div>" } :
                type === "hero" ? { title: "Novo Banner", subtitle: "Subtítulo do banner", buttonText: "Ver Mais" } :
                    type === "text" ? { html: "<div class='text-center'><h2>Título da Seção</h2><p>Escreva seu texto aqui...</p></div>" } :
                        type === "instagram" ? { username: "loja_exemplo" } :
                            type === "map" ? { embedUrl: "" } :
                                type === "promo" ? { title: "Super Promoção", subtitle: "Desconto de 50% em toda a loja!" } :
                                    type === "product-grid" ? { collectionType: "new" } :
                                        type === "columns" ? { columns: variant === "4-cols" ? 4 : variant === "3-cols" ? 3 : 2 } : {},
            styles: {
                paddingTop: "2rem",
                paddingBottom: "2rem",
                ...(type === "promo" ? { backgroundColor: "#db2777", textColor: "#ffffff" } : {})
            }
        };

        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);

        // Update Config Immediately (Draft)
        handleConfigChange("homeLayout", JSON.stringify(newBlocks));
    };

    const handleUpdateBlock = (updatedBlock: PageBlock) => {
        const newBlocks = blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b);
        setBlocks(newBlocks);
        handleConfigChange("homeLayout", JSON.stringify(newBlocks));
    };

    const handleDeleteBlock = (blockId: string) => {
        if (!confirm("Tem certeza que deseja remover este bloco?")) return;
        const newBlocks = blocks.filter(b => b.id !== blockId);
        setBlocks(newBlocks);
        setSelectedBlockId(null);
        handleConfigChange("homeLayout", JSON.stringify(newBlocks));
    };

    const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === blockId);
        if (index === -1) return;

        const newBlocks = [...blocks];
        if (direction === 'up' && index > 0) {
            [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
        } else if (direction === 'down' && index < newBlocks.length - 1) {
            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        } else {
            return; // No move possible
        }

        setBlocks(newBlocks);
        handleConfigChange("homeLayout", JSON.stringify(newBlocks));
    };

    const handleReorder = (newBlocks: PageBlock[]) => {
        setBlocks(newBlocks);
        handleConfigChange("homeLayout", JSON.stringify(newBlocks));
    };

    const handleConfigChange = (key: string, value: any) => {
        setActiveConfig((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const [fullScreenPreview, setFullScreenPreview] = useState(false);
    const [mobileEditMode, setMobileEditMode] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [previewPage, setPreviewPage] = useState<'home' | 'product' | 'products' | 'cart'>('home');
    const [isPublishing, startPublish] = useTransition();
    const [isDiscarding, startDiscard] = useTransition();

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => {
            setToast(prev => prev ? { ...prev, visible: false } : null);
            setTimeout(() => setToast(null), 400);
        }, 2000);
    };

    const handlePublish = () => {
        startPublish(async () => {
            const res = await publishStoreConfig();
            if (res.success) {
                showToast("Site publicado com sucesso!", "success");
                setTimeout(() => window.location.reload(), 2400);
            } else {
                showToast("Erro ao publicar: " + res.message, "error");
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

    // Auto-switch preview page based on active section
    useEffect(() => {
        if (activeSection === "products-detail") {
            setPreviewPage("product");
        } else if (activeSection === "home" || activeSection === "branding" || activeSection === "colors" || activeSection === "typography" || activeSection === "styles") {
            // Keep current page or default to home for general settings
            if (previewPage !== "home" && previewPage !== "product") {
                setPreviewPage("home");
            }
        }
    }, [activeSection]);

    // Highlight a specific block by its ID
    const highlightBlockById = (blockId: string) => {
        const container = previewRef.current;
        if (!container) return;

        // Find element with data-block-id attribute matching the blockId
        const targetElement = container.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;

        if (targetElement) {
            // Scroll into view smoothly
            targetElement.scrollIntoView({ behavior: "smooth", block: "center" });

            // Add highlight animation
            targetElement.classList.add("component-highlight");

            // Remove highlight after animation (2 pulses = 2 seconds)
            setTimeout(() => {
                targetElement?.classList.remove("component-highlight");
            }, 2000);
        }
    };

    // Highlight component in preview when style is changed
    const highlightComponent = (componentType: string) => {
        const container = previewRef.current;
        if (!container) return;

        let targetElement: HTMLElement | null = null;

        // Find the element based on component type
        switch (componentType) {
            case "header":
                targetElement = container.querySelector('[data-section="header"]') ||
                               container.querySelector("header");
                break;
            case "footer":
                targetElement = container.querySelector('[data-section="footer"]') ||
                               container.querySelector("footer");
                break;
            case "home":
                // Scroll to the home/content area
                targetElement = container.querySelector('[data-section="home"]') ||
                               container.querySelector('.min-h-screen');
                break;
            case "hero":
                // Try multiple selectors for hero blocks
                targetElement = container.querySelector('section[id*="hero"]') ||
                               container.querySelector('[data-block-id*="hero"]');
                break;
            case "categories":
                targetElement = container.querySelector('section[id*="categories"]') ||
                               container.querySelector('[data-block-id*="categories"]');
                break;
            case "newsletter":
                targetElement = container.querySelector('section[id*="newsletter"]') ||
                               container.querySelector('[data-block-id*="newsletter"]');
                break;
            case "product-grid":
                // Product grid can be the first grid in the home section
                targetElement = container.querySelector('section[id*="products"]') ||
                               container.querySelector('[data-block-id*="products"]') ||
                               container.querySelector('[data-section="home"] .grid');
                break;
            case "products-detail":
                // Product detail page container
                targetElement = container.querySelector('[data-section="products-detail"]') ||
                               container.querySelector('.container');
                break;
            default:
                // Try to find by block type in id or data-block-id
                targetElement = container.querySelector(`section[id*="${componentType}"]`) ||
                               container.querySelector(`[data-block-id*="${componentType}"]`);
        }

        if (targetElement) {
            // Scroll into view smoothly
            targetElement.scrollIntoView({ behavior: "smooth", block: "start" });

            // Add highlight animation
            targetElement.classList.add("component-highlight");

            // Remove highlight after animation
            setTimeout(() => {
                targetElement?.classList.remove("component-highlight");
            }, 2000);
        }
    };

    // Intercept clicks in Preview to prevent navigation AND enable Click-to-Edit
    useEffect(() => {
        const container = previewRef.current;
        if (!container) return;

        const handlePreviewClick = (e: MouseEvent) => {
            // 1. Prevent Default Navigation
            const target = e.target as HTMLElement;
            const link = target.closest("a");

            console.log('[SiteEditorLayout] Click target:', target.tagName, 'data-field:', target.dataset?.field, 'data-section:', target.dataset?.section);

            if (link) {
                e.preventDefault();
                e.stopPropagation();
            }

            // 2. Detect Click-to-Edit Areas
            // Traverse up from the target to find elements with data attributes
            let current: HTMLElement | null = target;
            let foundSection = null;
            let foundBlockId = null;
            let foundFooterBlockId = null;
            let foundField = null;

            while (current && current !== container) {
                // Priority 0: Specific Field (title, subtitle, button)
                if (current.dataset.field && !foundField) {
                    foundField = current.dataset.field;
                    console.log('[SiteEditorLayout] Found field:', foundField, 'on element:', current.tagName);
                }

                // Priority 1: Specific Blocks (Home or Footer)
                if (current.dataset.blockId) {
                    foundBlockId = current.dataset.blockId;
                }
                if (current.dataset.footerBlockId) {
                    foundFooterBlockId = current.dataset.footerBlockId;
                }

                // Priority 2: Sections (Header, Footer, Home Wrapper)
                if (current.dataset.section) {
                    foundSection = current.dataset.section;
                }

                // Stop if we found specific stuff to avoid bubbling too far up if nested
                if (foundBlockId || foundFooterBlockId || foundSection) {
                    break;
                }

                current = current.parentElement;
            }

            // 3. Trigger Navigation Logic
            if (foundFooterBlockId) {
                setSection("footer");
                setSelectedFooterBlockId(foundFooterBlockId);
                setSelectedField(null);
                return;
            }

            if (foundBlockId) {
                // If it's a home block, ensure we are in home section and select it
                setSection("home");
                // Need to find the block in current 'blocks' state to select it
                // We assume blocks state is up to date
                setSelectedBlockId(foundBlockId);
                setSelectedField(foundField ? { field: foundField, timestamp: Date.now() } : null); // Pass the field that was clicked with timestamp
                return;
            }

            if (foundSection) {
                // Clear selected block when switching to a different section
                setSelectedBlockId(null);
                setSelectedField(null);

                console.log('[SiteEditorLayout] Click detected - foundSection:', foundSection, 'foundField:', foundField);

                // If navigating to header section with a specific field, set it
                if (foundSection === "header" && foundField) {
                    console.log('[SiteEditorLayout] Setting header field:', foundField);
                    setSelectedHeaderField({ field: foundField, timestamp: Date.now() });
                } else if (foundSection !== "header") {
                    // Clear header field when switching away from header
                    setSelectedHeaderField(null);
                }

                setSection(foundSection);
                return;
            }

            // If clicked on a link but no section detected, show the alert (or just block)
            if (link) {
                // Optional: Only alert if NOT Click-to-Edit
                // alert(`Modo de Edição: Navegação bloqueada.`);
            }
        };

        // Capture phase ensures we get it before Next.js Link or other handlers
        container.addEventListener("click", handlePreviewClick, { capture: true });

        return () => {
            container.removeEventListener("click", handlePreviewClick, { capture: true });
        };
    }, [blocks, footerBlocks]); // Add dependencies to ensure state setting works if needed (though setters are stable)





    const renderContent = () => {
        const props = { config: activeConfig, onConfigChange: handleConfigChange };

        // Handle Dynamic Section Editing (home-edit:SECTION_ID)
        if (activeSection?.startsWith("home-edit:")) {
            const sectionId = activeSection.split(":")[1];

            // Parse Layout to get current settings
            let layout: any[] = [];
            try {
                const parsed = JSON.parse(activeConfig.homeLayout || "[]");
                if (Array.isArray(parsed)) layout = parsed;
            } catch (e) {
                console.error("Layout parse error", e);
            }

            const currentSection = layout.find((s: any) => s.id === sectionId) || { id: sectionId, label: "Seção", settings: {} };

            return (
                <SiteSectionEditor
                    sectionId={sectionId}
                    currentLabel={currentSection.label}
                    settings={currentSection.settings || {}}
                    allProducts={products || []}
                    onBack={() => setSection("home")}
                    onSave={(newSettings) => {
                        // Update settings in layout array
                        const newLayout = layout.map((s: any) => {
                            if (s.id === sectionId) {
                                return { ...s, settings: { ...s.settings, ...newSettings } };
                            }
                            return s;
                        });

                        // Update Config
                        handleConfigChange("homeLayout", JSON.stringify(newLayout));

                        // Notify user or go back?
                        alert("Configurações da seção atualizadas! Salve o rascunho para persistir.");
                        setSection("home");
                    }}
                />
            );
        }

        // Pass onConfigChange only to forms that support it
        switch (activeSection) {

            case "branding": return <SiteBrandingForm config={activeConfig} onConfigChange={handleConfigChange} onHighlightComponent={highlightComponent} />;
            case "colors": return <SiteColorsForm config={activeConfig} onConfigChange={handleConfigChange} onHighlightComponent={highlightComponent} />;
            case "typography": return <SiteTypographyForm config={activeConfig} onConfigChange={handleConfigChange} onHighlightComponent={highlightComponent} />;
            case "styles": return <SiteStylesForm config={activeConfig} onConfigChange={handleConfigChange} onHighlightComponent={highlightComponent} />;
            case "header": return <SiteHeaderForm config={activeConfig} onConfigChange={handleConfigChange} menus={menus} onHighlightComponent={highlightComponent} focusField={selectedHeaderField} />;
            case "home":
                // REPLACED Legacy Form with Block Layer List
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 mb-2">
                            Gerencie a ordem dos blocos da sua página inicial.
                        </div>
                        <BlockLayerList
                            blocks={blocks}
                            selectedBlockId={selectedBlockId}
                            onSelect={(id) => setSelectedBlockId(id)}
                            onHighlightBlock={highlightBlockById}
                            onMoveUp={(id) => handleMoveBlock(id, 'up')}
                            onMoveDown={(id) => handleMoveBlock(id, 'down')}
                            onReorder={handleReorder}
                            onDelete={handleDeleteBlock}
                        />
                        <Button
                            variant="outline"
                            className="w-full border-dashed gap-2"
                            onClick={() => setIsBlockSidebarOpen(true)}
                        >
                            <Plus className="h-4 w-4" /> Adicionar Novo Bloco
                        </Button>
                    </div>
                );
            case "banners": return <SiteBanners banners={banners} />;
            case "products-list": return <SiteProductListForm config={activeConfig} onConfigChange={handleConfigChange} />;
            case "products-detail": return <SiteProductDetailForm config={activeConfig} onConfigChange={handleConfigChange} />;
            case "cart": return <SiteCartForm config={activeConfig} onConfigChange={handleConfigChange} />;
            case "footer": return <SiteFooterForm config={activeConfig} menus={menus} categories={categories} onConfigChange={handleConfigChange} onHighlightComponent={highlightComponent} selectedBlockId={selectedFooterBlockId} />;
            case "contact": return <SiteContactForm config={activeConfig} onConfigChange={handleConfigChange} onHighlightComponent={highlightComponent} />;
            default: return <SiteBrandingForm config={activeConfig} />;
        }
    };

    return (
        <div className="flex h-full bg-white overflow-hidden relative">
            {/* Toast Notification */}
            {toast && (
                <div
                    className="fixed top-6 left-1/2 z-[9999] pointer-events-none"
                    style={{
                        transform: `translateX(-50%) translateY(${toast.visible ? '0' : '-20px'})`,
                        opacity: toast.visible ? 1 : 0,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    <div className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white",
                        toast.type === 'success' ? "bg-slate-800" : "bg-red-600"
                    )}>
                        {toast.type === 'success' && <Check className="h-4 w-4 text-green-400" />}
                        {toast.message}
                    </div>
                </div>
            )}

            <SiteBlockSidebar
                isOpen={isBlockSidebarOpen}
                onClose={() => setIsBlockSidebarOpen(false)}
                onAddBlock={handleAddBlock}
            />


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
                                    onClick={handleBack}
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

                        {selectedBlockId ? (
                            (() => {
                                const selectedBlock = blocks.find(b => b.id === selectedBlockId);
                                if (!selectedBlock) return <div>Bloco não encontrado</div>;
                                return (
                                    <BlockPropertyEditor
                                        block={selectedBlock}
                                        onUpdate={handleUpdateBlock}
                                        onDelete={handleDeleteBlock}
                                        onBack={() => {
                                            setSelectedBlockId(null);
                                            setSelectedField(null);
                                        }}
                                        focusField={selectedField}
                                        products={products}
                                        categories={categories}
                                        brands={brands}
                                    />
                                );
                            })()
                        ) : activeSection ? (
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
                                        onClick={() => setSection("branding")}
                                    />
                                    <SidebarMenuItem
                                        label="Cores da sua marca"
                                        icon={Palette}
                                        onClick={() => setSection("colors")}
                                    />
                                    <SidebarMenuItem
                                        label="Tipo de Letra"
                                        icon={Type}
                                        onClick={() => setSection("typography")}
                                    />
                                    <SidebarMenuItem
                                        label="Contato e Localização"
                                        icon={MapPin}
                                        onClick={() => setSection("contact")}
                                    />
                                    <SidebarMenuItem
                                        label="Estilos dos Componentes"
                                        icon={Layers}
                                        onClick={() => setSection("styles")}
                                    />
                                </div>

                                <div className="border-t my-1"></div>

                                <div className="px-4 py-3">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Configurações avançadas</h3>
                                    <SidebarMenuItem
                                        label="Cabeçalho"
                                        icon={PanelTop}
                                        onClick={() => {
                                            setSection("header");
                                            setTimeout(() => highlightComponent("header"), 100);
                                        }}
                                    />
                                    <SidebarMenuItem
                                        label="Página inicial"
                                        icon={Home}
                                        onClick={() => {
                                            setSection("home");
                                            setTimeout(() => highlightComponent("home"), 100);
                                        }}
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
                                        onClick={() => setSection("products-list")}
                                    />
                                    <SidebarMenuItem
                                        label="Detalhe do produto"
                                        icon={ShoppingBag}
                                        onClick={() => {
                                            setSection("products-detail");
                                            setPreviewPage("product");
                                            setTimeout(() => highlightComponent("products-detail"), 100);
                                        }}
                                    />
                                    <SidebarMenuItem
                                        label="Carrinho de compras"
                                        icon={ShoppingCart}
                                        onClick={() => setSection("cart")}
                                    />
                                    <SidebarMenuItem
                                        label="Rodapé da página"
                                        icon={PanelBottom}
                                        onClick={() => {
                                            setSection("footer");
                                            setTimeout(() => highlightComponent("footer"), 100);
                                        }}
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
                fullScreenPreview ? "p-0" : "p-4"
            )}>
                {!fullScreenPreview && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        {/* Page Selector */}
                        <div className="bg-white/80 backdrop-blur rounded-lg border shadow-sm flex items-center p-1 gap-1">
                            <Button
                                variant={previewPage === 'home' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 text-xs gap-1.5"
                                onClick={() => setPreviewPage('home')}
                                title="Página Inicial"
                            >
                                <Home className="h-3.5 w-3.5" />
                                Início
                            </Button>
                            <Button
                                variant={previewPage === 'product' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 text-xs gap-1.5"
                                onClick={() => setPreviewPage('product')}
                                title="Página de Produto"
                            >
                                <ShoppingBag className="h-3.5 w-3.5" />
                                Produto
                            </Button>
                        </div>

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
                        "shadow-2xl overflow-auto border border-slate-200 origin-top transform transition-all duration-500",
                        fullScreenPreview ? "w-full h-full rounded-none scale-100 border-0" : "min-h-[800px] max-h-[90vh] rounded-lg",
                        /* Width override based on device */
                        !fullScreenPreview && previewDevice === 'mobile' ? "w-[375px] border-slate-300 border-8 rounded-[3rem]" : (!fullScreenPreview && "w-full")
                    )}
                >
                    {/* Preview Styles Injection */}
                    <style jsx global>{`
                            /* Component Highlight Animation */
                            @keyframes highlightPulse {
                                0% {
                                    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
                                    outline: 3px solid rgba(99, 102, 241, 0.9);
                                    outline-offset: 0px;
                                }
                                50% {
                                    box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
                                    outline: 3px solid rgba(99, 102, 241, 0.5);
                                    outline-offset: 4px;
                                }
                                100% {
                                    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
                                    outline: 3px solid rgba(99, 102, 241, 0);
                                    outline-offset: 0px;
                                }
                            }

                            .component-highlight {
                                animation: highlightPulse 1s ease-out 2;
                                position: relative;
                                z-index: 50;
                            }

                            .preview-scope {
                                --background: ${activeConfig.backgroundColor || "#ffffff"};
                                --foreground: ${activeConfig.bodyColor || "#334155"};
                                --primary: ${activeConfig.themeColor || "#db2777"};
                                --secondary: ${activeConfig.secondaryColor || "#fce7f3"};
                                --ring: ${activeConfig.themeColor || "#db2777"};
                                
                                --brand-accent: ${(activeConfig as any).accentColor || (activeConfig as any).themeColor || "#db2777"};
                                --price-color: ${(activeConfig as any).priceColor || (activeConfig as any).accentColor || (activeConfig as any).themeColor || "#db2777"};
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
                                --font-sans: ${activeConfig.bodyFont || "Inter"}, sans-serif;
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

                    <div className="preview-scope font-sans antialiased text-foreground" style={{ color: "var(--foreground)" }}>



                        {/* Check if Cardápio theme - render CardapioPreview instead */}
                        {activeConfig?.siteType === "cardapio" ? (
                            <CardapioPreview config={activeConfig} deliveryCategories={deliveryCategories} />
                        ) : (
                            <>
                                {/* Header Preview */}
                                <Header
                                    config={activeConfig}
                                    categories={categories}
                                    editorMode={activeSection === "header"}
                                    onFieldClick={(field) => setSelectedHeaderField({ field, timestamp: Date.now() })}
                                />

                                {/* Page Content Preview - Based on selected preview page */}
                                <div className="min-h-screen" data-section={previewPage === 'product' ? 'products-detail' : 'home'}>
                                    {previewPage === 'product' ? (
                                        <ProductDetailPreview
                                            config={activeConfig}
                                            product={products?.[0]}
                                            onSectionClick={(section) => setSection(section)}
                                        />
                                    ) : (
                                        (() => {
                                            const useBlockRenderer = blocks && blocks.length > 0 && blocks[0] && typeof blocks[0].type === 'string';
                                            console.log('Preview Mode:', { useBlockRenderer, blocksCount: blocks.length, firstBlock: blocks[0] });

                                            return useBlockRenderer ? (
                                                <BlockRenderer
                                                    blocks={blocks}
                                                    isAdmin={true}
                                                    products={products || []}
                                                    categories={categories || []}
                                                    brands={brands || []}
                                                    config={activeConfig}
                                                />
                                            ) : (
                                                <ModernHome
                                                    products={products || []}
                                                    banners={banners}
                                                    categories={categories || []}
                                                    brands={brands || []}
                                                    config={activeConfig}
                                                />
                                            );
                                        })()
                                    )}
                                </div>

                                {/* Footer Preview - Use EditableFooter when editing footer section */}
                                {activeSection === "footer" ? (
                            <EditableFooter
                                config={activeConfig}
                                menus={menus}
                                blocks={footerBlocks}
                                bottomBlocks={footerBottomBlocks}
                                selectedBlockId={selectedFooterBlockId}
                                onBlockSelect={(id) => setSelectedFooterBlockId(id)}
                                onBlocksReorder={(newBlocks) => {
                                    setFooterBlocks(newBlocks);
                                    // Update activeConfig.footerBlocks for persistence
                                    handleConfigChange("footerBlocks", JSON.stringify({ blocks: newBlocks, bottomBlocks: footerBottomBlocks }));
                                }}
                                onBlockUpdate={(block) => {
                                    const updated = footerBlocks.map(b => b.id === block.id ? block : b);
                                    setFooterBlocks(updated);
                                    handleConfigChange("footerBlocks", JSON.stringify({ blocks: updated, bottomBlocks: footerBottomBlocks }));
                                }}
                                onBlockDelete={(id) => {
                                    const filtered = footerBlocks.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i }));
                                    setFooterBlocks(filtered);
                                    setSelectedFooterBlockId(null);
                                    handleConfigChange("footerBlocks", JSON.stringify({ blocks: filtered, bottomBlocks: footerBottomBlocks }));
                                }}
                                onBottomBlocksChange={(newBottomBlocks) => {
                                    setFooterBottomBlocks(newBottomBlocks);
                                    handleConfigChange("footerBlocks", JSON.stringify({ blocks: footerBlocks, bottomBlocks: newBottomBlocks, bottomAlignment: footerBottomAlignment }));
                                }}
                                bottomAlignment={footerBottomAlignment}
                                onBottomAlignmentChange={(alignment) => {
                                    setFooterBottomAlignment(alignment);
                                    handleConfigChange("footerBlocks", JSON.stringify({ blocks: footerBlocks, bottomBlocks: footerBottomBlocks, bottomAlignment: alignment }));
                                }}
                                onMenuItemReorder={async (menuId, itemId, direction) => {
                                    const result = await moveMenuItem(menuId, itemId, direction);
                                    if (result.success) {
                                        // Force refresh to get updated menu order
                                        router.refresh();
                                    }
                                }}
                            />
                        ) : (
                            <Footer config={activeConfig} menus={menus} />
                        )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
