import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { TopBar } from "@/components/shop/TopBar";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { ChatWidget } from "@/components/shop/ChatWidget";
import { CartSheet } from "@/components/shop/CartSheet";
import { WhatsAppFloat } from "@/components/shop/WhatsAppFloat";
import { getStoreConfig } from "@/lib/actions/settings";
import { ThemeInjector } from "@/components/theme-injector";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma"; // Added

export const dynamic = "force-dynamic";

export default async function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const config = await getStoreConfig();

    const serializedConfig = {
        ...config,
        minPurchaseValue: (config as any)?.minPurchaseValue ? Number((config as any).minPurchaseValue) : 0,
    };

    // Fetch categories for Header Menu (Universal usage)
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { name: 'asc' },
        take: 20,
    });
    // Generate CSS variables for server-side injection (Prevents Flash of Unstyled Content)
    const cssVariables = `
        :root {
            --primary: ${config?.themeColor || "#db2777"};
            --brand-accent: ${(config as any)?.accentColor || (config as any)?.themeColor || "#db2777"};
            --price-color: ${(config as any)?.priceColor || (config as any)?.accentColor || (config as any)?.themeColor || "#db2777"};
            --secondary: ${config?.secondaryColor || "#fce7f3"};
            --background: ${config?.backgroundColor || "#ffffff"};
            
            --header-bg: ${config?.headerColor || config?.backgroundColor || "#ffffff"};
            --footer-bg: ${config?.footerBg || "#171717"};
            --footer-text: ${config?.footerText || "#a3a3a3"};
            
            --color-menu: ${config?.menuColor || "#334155"};
            --font-menu: ${config?.menuFont || "inherit"};
            
            --color-heading: ${config?.headingColor || "#111827"};
            --color-section-title: ${(config as any)?.sectionTitleColor || config?.headingColor || "#111827"};
            --color-hero-text: ${(config as any)?.bannerTextColor || config?.headingColor || "#111827"};
            
            --btn-header-bg: ${(config as any)?.headerBtnBg || config?.themeColor || "#db2777"};
            --btn-header-text: ${(config as any)?.headerBtnText || "#ffffff"};
            
            --btn-product-bg: ${(config as any)?.productBtnBg || config?.themeColor || "#db2777"};
            --btn-product-text: ${(config as any)?.productBtnText || "#ffffff"};

            --font-heading: ${config?.headingFont || "inherit"};
            
            --color-body: ${config?.bodyColor || "#334155"};
            --font-body: ${config?.bodyFont || "inherit"};
            --font-sans: ${config?.bodyFont || "inherit"};
            
            --color-search-bg: ${config?.searchBtnBg || config?.themeColor || "#db2777"};
            --color-search-icon: ${config?.searchIconColor || "#ffffff"};
            --color-cart-bg: ${config?.cartCountBg || "#22c55e"};
            --color-cart-text: ${config?.cartCountText || "#ffffff"};
            
            --ring: ${config?.themeColor || "#db2777"};
            --foreground: ${config?.bodyColor || "#334155"};
        }
    `;

    const currentTheme = (config as any)?.theme || "modern";
    const isLegacy = currentTheme === "legacy";

    // Fetch Footer Menus (All menus for dynamic blocks)
    const footerMenus = await prisma.menu.findMany({
        include: { items: { orderBy: { order: 'asc' } } }
    });

    return (
        <div className="flex min-h-screen flex-col">
            <style dangerouslySetInnerHTML={{ __html: cssVariables }} />

            {/* ThemeInjector handles client-side updates (if any) and finer details, but server-side style covers initial load */}
            <ThemeInjector config={serializedConfig} />

            {/* Legacy TopBar - Only show if Legacy */}
            {isLegacy && <TopBar />}

            <Header config={serializedConfig} categories={categories} />

            {/* Legacy CategoryNav - Only show if Legacy */}
            {isLegacy && <CategoryNav />}

            <main className={cn("flex-1", isLegacy ? "bg-muted/20" : "bg-white")}>
                {children}
            </main>
            <ChatWidget />
            <CartSheet />
            <WhatsAppFloat whatsapp={serializedConfig.whatsapp} />
            <Footer config={serializedConfig} menus={footerMenus} />
        </div>
    );
}
