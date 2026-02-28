"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { BlockRenderer } from "@/components/shop/pbuilder/BlockRenderer";
import { ModernHome } from "@/components/shop/modern/ModernHome";
import { CardapioPreview } from "@/components/admin/site/CardapioPreview";
import { ProductDetailPreview } from "@/components/admin/site/ProductDetailPreview";
import { PageBlock } from "@/types/page-builder";

interface PreviewState {
    config: any;
    blocks: PageBlock[];
    footerBlocks: any[];
    footerBottomBlocks: any[];
    previewPage: string;
    products: any[];
    categories: any[];
    brands: any[];
    menus: any[];
    banners: any[];
    deliveryCategories: any[];
}

export default function MobilePreviewPage() {
    const [state, setState] = useState<PreviewState | null>(null);

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            const msg = event.data;

            if (msg?.type === "preview-init") {
                setState(msg.payload);
            }

            if (msg?.type === "preview-update" && state) {
                setState(prev => {
                    if (!prev) return prev;
                    return { ...prev, ...msg.payload };
                });
            }
        };

        window.addEventListener("message", handler);
        // Signal to parent that iframe is ready
        window.parent.postMessage({ type: "preview-ready" }, "*");

        return () => window.removeEventListener("message", handler);
    }, []);

    // Also handle updates after init (need separate effect since state ref changes)
    useEffect(() => {
        if (!state) return;

        const handler = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            const msg = event.data;
            if (msg?.type === "preview-update") {
                setState(prev => prev ? { ...prev, ...msg.payload } : prev);
            }
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, [!!state]);

    // Force hero height via JS as fallback (CSS !important should work, but this guarantees it)
    useEffect(() => {
        if (!state) return;
        const applyHeroStyles = () => {
            const heroSections = document.querySelectorAll<HTMLElement>('[data-block-type="hero"]');
            heroSections.forEach((section) => {
                section.style.setProperty('height', '72vh', 'important');
                section.style.setProperty('max-height', '72vh', 'important');
                section.style.setProperty('min-height', '0', 'important');
                section.style.setProperty('overflow', 'hidden', 'important');
                // Also fix the inner div
                const innerDiv = section.querySelector<HTMLElement>('[data-hero-inner], :scope > div:first-child');
                if (innerDiv) {
                    innerDiv.style.setProperty('height', '72vh', 'important');
                    innerDiv.style.setProperty('max-height', '72vh', 'important');
                    innerDiv.style.setProperty('min-height', '0', 'important');
                    innerDiv.style.setProperty('overflow', 'hidden', 'important');
                }
                // Reset all nested div min-heights
                section.querySelectorAll<HTMLElement>('div').forEach(div => {
                    div.style.setProperty('min-height', '0', 'important');
                });
            });
        };
        // Apply immediately and after a short delay (for lazy-loaded content)
        applyHeroStyles();
        const timer = setTimeout(applyHeroStyles, 500);
        return () => clearTimeout(timer);
    }, [state]);

    // Intercept clicks: prevent navigation + forward block/section clicks to parent
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Prevent link navigation
            const anchor = target.closest("a");
            if (anchor && anchor.getAttribute("href") !== "#") {
                e.preventDefault();
                e.stopPropagation();
            }

            // Forward block clicks to parent editor
            const blockEl = target.closest("[data-block-id]") as HTMLElement;
            if (blockEl) {
                e.preventDefault();
                e.stopPropagation();
                window.parent.postMessage({
                    type: "preview-block-click",
                    blockId: blockEl.dataset.blockId,
                }, "*");
                return;
            }

            // Forward header clicks to parent editor
            const headerEl = target.closest("[data-section='header']") as HTMLElement;
            if (headerEl) {
                e.preventDefault();
                e.stopPropagation();
                window.parent.postMessage({
                    type: "preview-section-click",
                    section: "header",
                }, "*");
                return;
            }

            // Forward footer clicks to parent editor
            const footerEl = target.closest("[data-section='footer']") as HTMLElement;
            if (footerEl) {
                e.preventDefault();
                e.stopPropagation();
                window.parent.postMessage({
                    type: "preview-section-click",
                    section: "footer",
                }, "*");
                return;
            }
        };
        document.addEventListener("click", handler, { capture: true });
        return () => document.removeEventListener("click", handler, { capture: true });
    }, []);

    if (!state) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const { config, blocks, previewPage, products, categories, brands, menus, banners, deliveryCategories } = state;
    const configWithMenus = { ...config, menus };
    const useBlockRenderer = blocks && blocks.length > 0 && blocks[0] && typeof blocks[0].type === "string";

    return (
        <>
            {/* Hide floating elements from root layout + Mobile optimizations */}
            <style>{`
                ${!config.whatsapp ? `[class*="whatsapp"], .whatsapp-float, [data-whatsapp-button], a[href*="wa.me"], a[href*="whatsapp"] { display: none !important; }` : ''}
                [data-cart-sync] { display: none !important; }

                /* Mobile hero height - 60% of viewport */
                section[data-block-type="hero"] {
                    max-height: 72vh !important;
                    min-height: 0 !important;
                    height: 72vh !important;
                    overflow: hidden !important;
                }
                section[data-block-type="hero"] > div:first-child,
                [data-hero-inner] {
                    max-height: 72vh !important;
                    min-height: 0 !important;
                    height: 72vh !important;
                    overflow: hidden !important;
                }
                /* All nested divs inside hero - reset min-height */
                section[data-block-type="hero"] div {
                    min-height: 0 !important;
                }
                /* Hero inner content */
                section[data-block-type="hero"] .flex.flex-col {
                    height: 100% !important;
                    min-height: 0 !important;
                    padding-top: 60% !important;
                    padding-bottom: 1.5rem !important;
                    justify-content: flex-start !important;
                }
                section[data-block-type="hero"] h1 {
                    font-size: 1.5rem !important;
                    line-height: 1.8rem !important;
                    margin-bottom: 0.5rem !important;
                }
                section[data-block-type="hero"] p {
                    font-size: 0.85rem !important;
                    line-height: 1.2rem !important;
                }
                section[data-block-type="hero"] button,
                section[data-block-type="hero"] a > button {
                    margin-top: 0.75rem !important;
                    padding: 0.5rem 1.5rem !important;
                    font-size: 0.8rem !important;
                }

                /* Product grid: force 2 columns on mobile */
                [data-product-grid] {
                    grid-template-columns: repeat(2, 1fr) !important;
                }

                /* Clickable blocks - hover feedback */
                [data-block-id] {
                    cursor: pointer !important;
                    transition: outline 0.15s ease !important;
                }
                [data-block-id]:hover {
                    outline: 2px solid rgba(59, 130, 246, 0.5) !important;
                    outline-offset: -2px !important;
                }

                /* Clickable header/footer */
                [data-section="header"],
                [data-section="footer"] {
                    cursor: pointer !important;
                }
                [data-section="header"]:hover,
                [data-section="footer"]:hover {
                    outline: 2px solid rgba(59, 130, 246, 0.5) !important;
                    outline-offset: -2px !important;
                }
            `}</style>

            {/* CSS Variables */}
            <style>{`
                .preview-scope {
                    --background: ${config.backgroundColor || "#ffffff"};
                    --foreground: ${config.bodyColor || "#334155"};
                    --primary: ${config.themeColor || "#db2777"};
                    --secondary: ${config.secondaryColor || "#fce7f3"};
                    --ring: ${config.themeColor || "#db2777"};
                    --brand-accent: ${config.accentColor || config.themeColor || "#db2777"};
                    --price-color: ${config.priceColor || config.accentColor || config.themeColor || "#db2777"};
                    --primary-foreground: #ffffff;
                    --color-section-title: ${config.sectionTitleColor || config.headingColor || "#111827"};
                    --color-hero-text: ${config.bannerTextColor || config.headingColor || "#111827"};
                    --btn-header-bg: ${config.headerBtnBg || config.themeColor || "#db2777"};
                    --btn-header-text: ${config.headerBtnText || "#ffffff"};
                    --btn-product-bg: ${config.productBtnBg || config.themeColor || "#db2777"};
                    --btn-product-text: ${config.productBtnText || "#ffffff"};
                    --header-bg: ${config.headerColor || config.backgroundColor || "#ffffff"};
                    --footer-bg: ${config.footerBg || "#171717"};
                    --footer-text: ${config.footerText || "#a3a3a3"};
                    --footer-border: ${config.footerBg || "#border"};
                    --color-search-bg: ${config.searchBtnBg || config.themeColor || "#db2777"};
                    --color-search-icon: ${config.searchIconColor || "#ffffff"};
                    --color-cart-bg: ${config.cartCountBg || "#22c55e"};
                    --color-cart-text: ${config.cartCountText || "#ffffff"};
                    --color-menu: ${config.menuColor || "#334155"};
                    --font-heading: ${config.headingFont || "Inter"}, sans-serif;
                    --font-body: ${config.bodyFont || "Inter"}, sans-serif;
                    --font-sans: ${config.bodyFont || "Inter"}, sans-serif;
                    --size-heading: ${config.headingFontSize || "32px"};
                    --size-body: ${config.bodyFontSize || "16px"};
                }
                .preview-scope h1, .preview-scope h2, .preview-scope h3, .preview-scope h4, .preview-scope h5, .preview-scope h6 {
                    font-family: var(--font-heading);
                }
                .preview-scope {
                    font-family: var(--font-body);
                    font-size: var(--size-body);
                }
            `}</style>

            {/* Google Fonts */}
            <link
                href={`https://fonts.googleapis.com/css2?family=${(config.headingFont || "Inter").replace(/ /g, "+")}:wght@400;700&family=${(config.bodyFont || "Inter").replace(/ /g, "+")}:wght@400;500;700&display=swap`}
                rel="stylesheet"
            />

            <div className="preview-scope font-sans antialiased text-foreground" style={{ color: "var(--foreground)" }}>
                {config.siteType === "cardapio" ? (
                    <CardapioPreview config={configWithMenus} deliveryCategories={deliveryCategories} />
                ) : (
                    <>
                        <Header
                            config={configWithMenus}
                            categories={categories}
                            editorMode={false}
                            isPreview={true}
                        />

                        <div className="min-h-screen" data-section={previewPage === "product" ? "products-detail" : "home"}>
                            {previewPage === "product" ? (
                                <ProductDetailPreview config={configWithMenus} product={products?.[0]} />
                            ) : useBlockRenderer ? (
                                <BlockRenderer
                                    blocks={blocks}
                                    isAdmin={false}
                                    products={products || []}
                                    categories={categories || []}
                                    brands={brands || []}
                                    config={configWithMenus}
                                />
                            ) : (
                                <ModernHome
                                    products={products || []}
                                    banners={banners || []}
                                    categories={categories || []}
                                    brands={brands || []}
                                    config={configWithMenus}
                                />
                            )}
                        </div>

                        <Footer config={configWithMenus} menus={menus} />
                    </>
                )}
            </div>
        </>
    );
}
