import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/actions/product";
import { getActiveBanners } from "@/lib/actions/banner";
import { getStoreConfig } from "@/lib/actions/settings";
import { HeroBanner } from "@/components/shop/HeroBanner";
import { NewArrivals } from "@/components/shop/NewArrivals";
import { Testimonials } from "@/components/shop/Testimonials";
import { InstagramFeed } from "@/components/shop/InstagramFeed";
import { GoogleReviews } from "@/components/shop/GoogleReviews";
import { CategoriesSection } from "@/components/shop/CategoriesSection";

export default async function HomePage() {
    const products = await getProducts();
    const banners = await getActiveBanners();
    const config = await getStoreConfig();

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
    const renderSection = (id: string, index: number) => {
        switch (id) {
            case "hero":
                return <HeroBanner key={`hero-${index}`} banners={banners} />;
            case "products-new":
            case "new-arrivals": // Legacy support
                const newArrivals = products.filter((p: any) => p.isNewArrival);
                if (newArrivals.length === 0) return null; // Don't show if empty
                return <NewArrivals key={`new-${index}`} products={newArrivals} />;
            case "testimonials":
                return <Testimonials key={`test-${index}`} />;
            case "instagram":
                return <InstagramFeed key={`insta-${index}`} />;
            case "google-reviews":
                return <GoogleReviews key={`google-${index}`} />;

            case "categories-main":
                return <CategoriesSection key={`cats-${index}`} />;
            case "products-featured":
                return <NewArrivals key={`feat-${index}`} products={products.filter((p: any) => p.isFeatured).slice(0, 4)} />;
            case "brands":
                return <div key={id} className="container mx-auto p-8 text-center border-dashed border-2 rounded-xl text-slate-400">Carrossel de Marcas (Em breve)</div>;
            case "banners-categories":
                return <div key={id} className="container mx-auto p-8 text-center border-dashed border-2 rounded-xl text-slate-400">Banners de Categorias (Em breve)</div>;
            case "products-offers":
                return <NewArrivals key={`offer-${index}`} products={products.slice(2, 6)} />; // Reuse for now
            case "info-shipping":
                return <div key={id} className="container mx-auto p-8 text-center border-dashed border-2 rounded-xl text-slate-400">Barra de Informações (Frete/Pagamento)</div>;
            case "newsletter":
                return <div key={id} className="container mx-auto p-8 text-center border-dashed border-2 rounded-xl text-slate-400">Newsletter (Em breve)</div>;
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
                .map((section: any, index: number) => renderSection(section.id, index))}
        </div>
    );
}
