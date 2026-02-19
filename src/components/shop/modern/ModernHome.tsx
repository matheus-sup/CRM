import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Star, TrendingUp } from "lucide-react";

export function ModernHome({ products, banners, categories, brands = [], config }: { products: any[], banners: any[], categories: any[], brands?: any[], config: any }) {

    // Default Layout if none exists
    const DEFAULT_LAYOUT = [
        { id: "hero", enabled: true },
        { id: "brands-list", enabled: true },
        { id: "categories-main", enabled: true },
        { id: "products-featured", enabled: true },
        { id: "newsletter", enabled: true }
    ];

    // Parse Layout
    let layout = DEFAULT_LAYOUT;
    try {
        // Only try to parse if it looks like JSON (starts with '[')
        if (config.homeLayout && typeof config.homeLayout === 'string' && config.homeLayout.trim().startsWith('[')) {
            const parsed = JSON.parse(config.homeLayout);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Determine if it's old legacy layout or new page builder blocks
                // Legacy usually has simple objects {id, enabled}
                // PageBuilder has {type, content, styles}
                // For this component we ONLY support the legacy config style or our default.
                // If the user has saved PageBuilder blocks, this component shouldn't be rendered anyway (handled in page.tsx).
                // But just in case:
                if ("id" in parsed[0]) {
                    layout = parsed;
                }
            }
        }
    } catch (e) {
        console.error("Layout parse error", e);
    }

    // Dynamic Styles Helpers
    const styles = {
        primaryColor: config.themeColor || "#db2777",
        backgroundColor: config.backgroundColor || "#ffffff",
        headingColor: config.headingColor || "#111827",
        bodyColor: config.bodyColor || "#334155",
        heroTextColor: config.bannerTextColor || "#ffffff",
        footerBg: config.footerBg || "#171717",
        footerText: config.footerText || "#ffffff"
    };

    // Helper Components Config
    const heroBanner = banners.find(b => b.position === "hero") || (banners.length > 0 ? banners[0] : null);

    const renderSection = (section: any) => {
        if (!section.enabled) return null;

        switch (section.id) {
            case "hero":
                return <div data-block-id="hero" className="cursor-pointer hover:ring-2 hover:ring-primary/50 relative"><HeroSection key="hero" banner={heroBanner} config={config} styles={styles} /></div>;
            case "brands-list":
                return <div data-block-id="brands-list" className="cursor-pointer hover:ring-2 hover:ring-primary/50 relative"><BrandsSection key="brands" brands={brands} styles={styles} /></div>;
            case "categories-main":
                return <div data-block-id="categories-main" className="cursor-pointer hover:ring-2 hover:ring-primary/50 relative"><CategoriesSection key="categories" categories={categories} styles={styles} /></div>;
            case "products-featured":
            case "products-new":
            case "products-offers":
                // We can reuse the same grid for different IDs, maybe filtering products differently if we implemented that logic
                // For now, just show the same grid with different titles
                const titleMap: Record<string, string> = {
                    "products-featured": "Os Queridinhos do Momento",
                    "products-new": "Lançamentos",
                    "products-offers": "Ofertas Imperdíveis"
                };
                return <div data-block-id={section.id} className="cursor-pointer hover:ring-2 hover:ring-primary/50 relative"><ProductGridSection key={section.id} products={products} title={titleMap[section.id]} styles={styles} /></div>;
            case "newsletter":
                return <div data-block-id="newsletter" className="cursor-pointer hover:ring-2 hover:ring-primary/50 relative"><NewsletterSection key="newsletter" styles={styles} /></div>;
            case "instagram":
                return (
                    <div key="insta" data-block-id="instagram" className="py-10 text-center container mx-auto text-slate-400 border-2 border-dashed rounded-lg my-10 cursor-pointer hover:ring-2 hover:ring-primary/50 relative">
                        Instagram Feed (Configurar Integracão)
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div data-section="home" className="flex flex-col min-h-screen" style={{ backgroundColor: styles.backgroundColor }}>
            {layout.map((section: any, i: number) => (
                <div key={section.id || `section-${i}`}>
                    {renderSection(section)}
                </div>
            ))}
        </div>
    );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

function HeroSection({ banner, config, styles }: { banner: any, config: any, styles: any }) {
    return (
        <section className="relative flex items-center justify-center overflow-hidden text-white" style={{ minHeight: '80vh' }}>
            {banner ? (
                <>
                    <img
                        src={banner.imageUrl || banner.desktopUrl}
                        alt="Hero"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </>
            ) : (
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(to bottom right, ${styles.primaryColor}, #4c1d95)`,
                        opacity: 0.95
                    }}
                />
            )}

            <div className="relative z-10 container mx-auto px-4 text-center space-y-6 py-20">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight" style={{ color: styles.heroTextColor || '#ffffff' }}>
                    {config.storeName || "Sua Loja Aqui"}
                </h1>
                <p className="text-lg md:text-xl md:max-w-2xl mx-auto" style={{ color: styles.heroTextColor || '#ffffff', opacity: 0.9 }}>
                    {config.description || "Configure o nome e a descrição da sua loja no painel administrativo."}
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Button
                        size="lg"
                        className="rounded-full px-8 h-14 text-lg font-bold transition-all hover:scale-105"
                        style={{
                            backgroundColor: styles.primaryColor,
                            color: "#ffffff"
                        }}
                    >
                        Ver Coleção
                    </Button>
                </div>
            </div>
        </section>
    );
}

function BrandsSection({ brands, styles }: { brands: any[], styles: any }) {
    if (!brands || brands.length === 0) return null;
    return (
        <section className="py-10 border-b bg-slate-50/50">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-6">Nossas Marcas Parceiras</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {brands.slice(0, 6).map((brand) => (
                        <div key={brand.id} className="text-xl font-bold font-serif" style={{ color: styles.headingColor }}>
                            {brand.name}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function CategoriesSection({ categories, styles }: { categories: any[], styles: any }) {
    return (
        <section className="py-20 container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold tracking-tight" style={{ color: styles.headingColor }}>Categorias em Destaque</h2>
                <Link href="/categorias" className="text-sm font-medium hover:underline flex items-center gap-1 opacity-70" style={{ color: styles.bodyColor }}>Ver todas <ArrowRight className="h-4 w-4" /></Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-auto min-h-[400px]">
                {categories.length > 0 ? (
                    categories.map((cat, index) => {
                        const isLarge = index === 0;
                        const gridClass = isLarge ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square";
                        return (
                            <Link
                                href={`/search?category=${cat.slug}`}
                                key={cat.id}
                                className={`relative group rounded-2xl overflow-hidden bg-gray-100 ${gridClass}`}
                            >
                                {cat.imageUrl ? (
                                    <img src={cat.imageUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="absolute inset-0 bg-slate-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-slate-400 font-bold text-lg">{cat.name.charAt(0)}</div>
                                )}

                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                    <span className={`text-white font-bold block ${isLarge ? "text-2xl" : "text-lg"}`}>{cat.name}</span>
                                    {isLarge && <span className="text-white/80 text-sm mt-1 inline-block">Explorar &rarr;</span>}
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-20 text-slate-400">
                        Nenhuma categoria encontrada
                    </div>
                )}
            </div>
        </section>
    );
}

function ProductGridSection({ products, title, styles }: { products: any[], title: string, styles: any }) {
    return (
        <section className="py-20 bg-slate-50/50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="font-semibold tracking-wider text-sm uppercase" style={{ color: styles.primaryColor }}>Curadoria Especial</span>
                    <h2 className="text-4xl font-bold tracking-tight mt-2 mb-4" style={{ color: styles.headingColor }}>{title}</h2>
                    <p style={{ color: styles.bodyColor }}>Produtos selecionados a dedo que estão definindo tendências.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {products.slice(0, 4).map((p, i) => (
                        <ModernProductCard key={p.id || i} product={p} primaryColor={styles.primaryColor} headingColor={styles.headingColor} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function NewsletterSection({ styles }: { styles: any }) {
    return (
        <section className="py-24 text-white" style={{ backgroundColor: styles.footerBg }}>
            <div className="container mx-auto px-4 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-6 opacity-80" style={{ color: styles.primaryColor }} />
                <h2 className="text-4xl font-bold mb-4" style={{ color: styles.footerText }}>Entre para o Clube</h2>
                <p className="max-w-md mx-auto mb-8 opacity-70" style={{ color: styles.footerText }}>Receba novidades, dicas de beleza e ofertas exclusivas diretamente no seu e-mail.</p>

                <div className="max-w-md mx-auto flex gap-2">
                    <input
                        type="email"
                        placeholder="Seu melhor e-mail"
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-full h-12 px-6 focus:outline-none focus:ring-2"
                        style={{}}
                    />
                    <Button className="rounded-full h-12 px-8 font-bold" style={{ backgroundColor: styles.primaryColor, color: "#ffffff" }}>
                        Inscrever
                    </Button>
                </div>
            </div>
        </section>
    );
}

function ModernProductCard({ product, primaryColor, headingColor }: { product: any, primaryColor: string, headingColor: string }) {
    return (
        <div className="group relative">
            <div className="aspect-[3/4] rounded-2xl bg-gray-200 relative overflow-hidden mb-4">
                {product.images?.[0]?.url ? (
                    <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">Sem Foto</div>
                )}

                {/* Overlay Buttons */}
                <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
                    <Link href={`/produtos/${product.slug || product.id}`} className="w-full">
                        <Button
                            className="w-full text-white hover:opacity-90 shadow-lg font-bold rounded-full"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Ver Detalhes
                        </Button>
                    </Link>
                </div>
                {/* Badges */}
                {product.compareAtPrice && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-red-600">
                        -{Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)}%
                    </div>
                )}
            </div>

            <h3 className="font-medium text-lg transition-colors line-clamp-1" style={{ color: headingColor }}>{product.name}</h3>
            <div className="flex items-center gap-2 mt-1">
                <span className="font-bold" style={{ color: primaryColor }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}</span>
                {product.compareAtPrice && (
                    <span className="text-sm text-slate-400 line-through">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.compareAtPrice))}</span>
                )}
            </div>
        </div>
    )
}
