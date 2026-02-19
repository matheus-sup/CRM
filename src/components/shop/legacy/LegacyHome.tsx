import { HeroBanner } from "@/components/shop/HeroBanner";
import { NewArrivals } from "@/components/shop/NewArrivals";
import { Testimonials } from "@/components/shop/Testimonials";
import { InstagramFeed } from "@/components/shop/InstagramFeed";
import { GoogleReviews } from "@/components/shop/GoogleReviews";
import { CategoriesSection } from "@/components/shop/CategoriesSection";

export function LegacyHome({ products, banners, config }: { products: any[], banners: any[], config: any }) {
    // Default layout matches SiteHomeForm defaults
    const DEFAULT_LAYOUT = [
        { id: "categories-main", label: "Categorias principais", enabled: true },
        { id: "hero", label: "Banners rotativos", enabled: true },
        { id: "products-featured", label: "Produtos em destaque", enabled: true },
        { id: "products-new", label: "Produtos novos", enabled: true },
        { id: "brands", label: "Marcas", enabled: true },
        { id: "banners-categories", label: "Banners de categorias", enabled: true },
        { id: "products-offers", label: "Produtos em oferta", enabled: true },
        { id: "instagram", label: "Postagens do Instagram", enabled: true },
        { id: "google-reviews", label: "Avaliações Google", enabled: true },
        { id: "info-shipping", label: "Informações de frete...", enabled: true },
        { id: "newsletter", label: "Newsletter", enabled: true },
        { id: "banners-promo", label: "Banners promocionais", enabled: true },
        { id: "testimonials", label: "Depoimentos", enabled: false }, // Disabling old testimonials in favor of Google
    ];

    let layout = DEFAULT_LAYOUT;
    try {
        if (config?.homeLayout) {
            layout = JSON.parse(config.homeLayout);
        }
    } catch (e) {
        console.error("Failed to parse home layout", e);
    }

    // Component Registry
    const renderSection = (section: any, index: number) => {
        const id = section.id;
        const settings = section.settings || {};

        const resolveProducts = (allProducts: any[], defaultFilter: (p: any) => boolean) => {
            if (settings.selectionMode === "manual" && settings.productIds && Array.isArray(settings.productIds)) {
                const selected = settings.productIds
                    .map((id: string) => allProducts.find((p: any) => p.id?.toString() === id))
                    .filter(Boolean);
                if (selected.length > 0) return selected;
            }
            return allProducts.filter(defaultFilter);
        };

        const Wrapper = ({ children }: { children: React.ReactNode }) => {
            const hasStyle = settings.backgroundColor || settings.textColor || settings.paddingTop || settings.paddingBottom;
            const style = {
                backgroundColor: settings.backgroundColor || "transparent",
                color: settings.textColor || "inherit",
                paddingTop: settings.paddingTop ? `${settings.paddingTop}rem` : undefined,
                paddingBottom: settings.paddingBottom ? `${settings.paddingBottom}rem` : undefined
            };

            if (!hasStyle) return <>{children}</>;

            return (
                <div style={style}>
                    <div className="container mx-auto px-4">
                        {(settings.title || settings.subtitle) && (
                            <div className="mb-6 space-y-1">
                                {settings.title && <h3 className="text-2xl font-bold" style={{ color: settings.textColor ? "inherit" : undefined }}>{settings.title}</h3>}
                                {settings.subtitle && <p className="text-muted-foreground" style={{ color: settings.textColor ? "inherit" : undefined }}>{settings.subtitle}</p>}
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            );
        };

        switch (id) {
            case "hero":
                return <HeroBanner key={`hero-${index}`} banners={banners} />;
            case "products-new":
            case "new-arrivals":
                const newProducts = resolveProducts(products, (p: any) => p.isNewArrival);
                if (newProducts.length === 0) return null;
                return (
                    <div key={`new-${index}`} style={{ backgroundColor: settings.backgroundColor, paddingTop: settings.paddingTop ? `${settings.paddingTop}rem` : undefined, paddingBottom: settings.paddingBottom ? `${settings.paddingBottom}rem` : undefined }}>
                        <NewArrivals
                            products={newProducts}
                            title={settings.title || "Lançamentos"}
                            subtitle={settings.subtitle}
                        />
                    </div>
                );
            case "products-featured":
                const featProducts = resolveProducts(products, (p: any) => p.isFeatured).slice(0, 4);
                if (featProducts.length === 0) return null;
                return (
                    <div key={`feat-${index}`} style={{ backgroundColor: settings.backgroundColor, paddingTop: settings.paddingTop ? `${settings.paddingTop}rem` : undefined, paddingBottom: settings.paddingBottom ? `${settings.paddingBottom}rem` : undefined }}>
                        <NewArrivals
                            products={featProducts}
                            title={settings.title || "Destaques"}
                            subtitle={settings.subtitle}
                        />
                    </div>
                );
            case "products-offers":
                const offerProducts = resolveProducts(products, (p: any) => true).slice(0, 4);
                if (offerProducts.length === 0) return null;
                return (
                    <div key={`offer-${index}`} style={{ backgroundColor: settings.backgroundColor, paddingTop: settings.paddingTop ? `${settings.paddingTop}rem` : undefined, paddingBottom: settings.paddingBottom ? `${settings.paddingBottom}rem` : undefined }}>
                        <NewArrivals
                            products={offerProducts}
                            title={settings.title || "Ofertas"}
                            subtitle={settings.subtitle}
                        />
                    </div>
                );

            case "testimonials":
                return <Testimonials key={`test-${index}`} />;
            case "instagram":
                return <InstagramFeed key={`insta-${index}`} />;
            case "google-reviews":
                return <GoogleReviews key={`google-${index}`} />;
            case "categories-main":
                return <CategoriesSection key={`cats-${index}`} />;

            case "brands":
                return <div key={id} className="container mx-auto p-8 text-center border-dashed border-2 rounded-xl text-slate-400">Carrossel de Marcas (Em breve)</div>;
            case "banners-categories":
                return <div key={id} className="container mx-auto p-8 text-center border-dashed border-2 rounded-xl text-slate-400">Banners de Categorias (Em breve)</div>;
            case "info-shipping":
                return <div key={id} className="container mx-auto p-8 text-center border-dashed border-2 rounded-xl text-slate-400">Barra de Informações (Frete/Pagamento)</div>;
            case "newsletter":
                return <div key={id} className="container mx-auto p-8 text-center border-dashed border-2 rounded-xl text-slate-400">Newsletter (Em breve/Parcialmente Funcional)</div>;
            case "banners-promo":
                return <div key={id} className="container mx-auto p-8 text-center border-dashed border-2 rounded-xl text-slate-400">Banners Promocionais (Em breve)</div>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {layout
                .filter((section: any) => section.enabled)
                .map((section: any, index: number) => renderSection(section, index))}
        </div>
    );
}
