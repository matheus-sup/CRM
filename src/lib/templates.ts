export interface Template {
    id: string;
    name: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
    };
    badge?: string;
    features?: string[];
    config: any;
}

export const templates: Template[] = [
    {
        id: "energia-solar",
        name: "Energia Solar",
        description: "Template profissional para empresas de energia solar, painéis fotovoltaicos e sustentabilidade",
        badge: "Novo",
        features: ["Dark theme", "CTA impactante", "Seções de serviços", "Foco em conversão"],
        colors: {
            primary: "#ff6b00",
            secondary: "#111111",
            background: "#0a0a0a"
        },
        config: {
            themeColor: "#ff6b00",
            secondaryColor: "#1a1a1a",
            backgroundColor: "#0a0a0a",
            headerColor: "#111111",
            footerBg: "#111111",
            footerText: "#9ca3af",
            headingColor: "#ffffff",
            bodyColor: "#d1d5db",
            menuColor: "#ffffff",
            priceColor: "#ff6b00",
            productBtnBg: "#ff6b00",
            productBtnText: "#ffffff",
            siteType: "shop",
            headerStyle: "minimal",
            cardStyle: "standard",
            footerStyle: "full",
            homeLayout: JSON.stringify([
                {
                    id: "hero-solar",
                    type: "hero",
                    content: {
                        slides: [{
                            id: "slide-1",
                            title: "Transforme a Luz do Sol em Economia Real",
                            subtitle: "Reduza até 95% da sua conta de energia com nossos sistemas de energia solar. Soluções completas para residências, comércios e indústrias.",
                            buttonText: "Solicitar Orçamento",
                            buttonLink: "/contato"
                        }],
                        autoplay: false
                    },
                    styles: {
                        variant: "default",
                        minHeight: "85vh",
                        background: "linear-gradient(135deg, #111111 0%, #1a1a1a 50%, #0a0a0a 100%)",
                        textColor: "#d1d5db",
                        titleColor: "#ffffff",
                        textAlign: "center",
                        buttonColor: "#ff6b00",
                        buttonTextColor: "#ffffff",
                        fullWidth: true
                    }
                },
                {
                    id: "features-solar",
                    type: "features",
                    content: {
                        title: "Por que escolher Energia Solar?",
                        items: [
                            { icon: "💰", title: "Economia", description: "Reduza até 95% da sua conta de luz" },
                            { icon: "🌱", title: "Sustentável", description: "Energia limpa e renovável" },
                            { icon: "📈", title: "Valorização", description: "Imóvel valoriza até 8%" },
                            { icon: "🔧", title: "Garantia", description: "25 anos de garantia nos painéis" }
                        ]
                    },
                    styles: {
                        backgroundColor: "#1a1a1a",
                        textColor: "#d1d5db",
                        headingColor: "#ffffff",
                        accentColor: "#ff6b00",
                        iconColor: "#ff6b00",
                        fullWidth: true,
                        paddingTop: "3rem",
                        paddingBottom: "3rem"
                    }
                },
                {
                    id: "categories-solar",
                    type: "categories",
                    content: {
                        title: "Nossas Soluções",
                        selectionMode: "auto",
                        limit: 3
                    },
                    styles: {
                        variant: "grid",
                        headingColor: "#ffffff",
                        cardTextColor: "#ffffff",
                        backgroundColor: "#0a0a0a",
                        fullWidth: true,
                        paddingTop: "2rem",
                        paddingBottom: "2rem"
                    }
                },
                {
                    id: "products-solar",
                    type: "product-grid",
                    content: {
                        collectionType: "featured",
                        title: "Kits de Energia Solar",
                        limit: 6
                    },
                    styles: {
                        backgroundColor: "#111111",
                        textColor: "#ffffff",
                        accentColor: "#ff6b00",
                        headingColor: "#ffffff",
                        fullWidth: true,
                        paddingTop: "2rem",
                        paddingBottom: "2rem"
                    }
                },
                {
                    id: "stats-solar",
                    type: "text",
                    content: {
                        html: `<div style="text-align: center; padding: 3rem 1rem;">
                            <h2 style="font-size: 2rem; font-weight: 700; color: #ffffff; margin-bottom: 2rem;">Nossos Números</h2>
                            <div style="display: flex; justify-content: center; gap: 4rem; flex-wrap: wrap;">
                                <div>
                                    <div style="font-size: 3rem; font-weight: 800; color: #ff6b00;">500+</div>
                                    <div style="color: #9ca3af;">Projetos Instalados</div>
                                </div>
                                <div>
                                    <div style="font-size: 3rem; font-weight: 800; color: #ff6b00;">15MW</div>
                                    <div style="color: #9ca3af;">Potência Instalada</div>
                                </div>
                                <div>
                                    <div style="font-size: 3rem; font-weight: 800; color: #ff6b00;">98%</div>
                                    <div style="color: #9ca3af;">Clientes Satisfeitos</div>
                                </div>
                            </div>
                        </div>`
                    },
                    styles: {
                        backgroundColor: "#1a1a1a",
                        fullWidth: true
                    }
                },
                {
                    id: "cta-solar",
                    type: "promo-banner",
                    content: {
                        title: "Comece a Economizar Hoje",
                        subtitle: "Solicite um orçamento gratuito e descubra quanto você pode economizar com energia solar",
                        buttonText: "Falar com Especialista",
                        buttonLink: "/contato",
                        overlayOpacity: 0.7
                    },
                    styles: {
                        backgroundColor: "#ff6b00",
                        textColor: "#ffffff",
                        textAlign: "center",
                        minHeight: "250px",
                        fullWidth: true,
                        paddingTop: "0",
                        paddingBottom: "0"
                    }
                },
                {
                    id: "newsletter-solar",
                    type: "newsletter",
                    content: {
                        title: "Receba Novidades",
                        description: "Fique por dentro das últimas novidades em energia solar e ofertas exclusivas",
                        placeholder: "seu@email.com",
                        buttonText: "Inscrever"
                    },
                    styles: {
                        variant: "full",
                        backgroundColor: "#111111",
                        titleColor: "#ffffff",
                        textColor: "#9ca3af",
                        iconColor: "#ff6b00",
                        buttonColor: "#ff6b00",
                        buttonTextColor: "#ffffff",
                        fullWidth: true
                    }
                }
            ])
        }
    },
    {
        id: "restaurant",
        name: "Restaurante & Delivery",
        description: "Tema otimizado para restaurantes, lanchonetes e delivery de comida",
        badge: "Novo",
        features: ["Cards horizontais", "Categorias fixas", "Carrinho flutuante", "Checkout rápido"],
        colors: {
            primary: "#ef4444",
            secondary: "#fef2f2",
            background: "#ffffff"
        },
        config: {
            themeColor: "#ef4444",
            secondaryColor: "#fef2f2",
            backgroundColor: "#ffffff",
            headerColor: "#ef4444",
            footerBg: "#1f2937",
            footerText: "#9ca3af",
            headingColor: "#111827",
            bodyColor: "#4b5563",
            menuColor: "#ffffff",
            siteType: "restaurant",
            deliveryTime: "30-45 min",
            minPurchaseValue: 15,
            headerStyle: "restaurant",
            cardStyle: "horizontal",
            footerStyle: "restaurant",
            homeLayout: JSON.stringify([
                {
                    id: "hero-restaurant",
                    type: "hero",
                    content: {
                        slides: [{
                            id: "slide-1",
                            title: "Sabor que Encanta",
                            subtitle: "Peça agora e receba em minutos no conforto da sua casa",
                            buttonText: "Ver Cardápio",
                            buttonLink: "/cardapio"
                        }],
                        autoplay: false
                    },
                    styles: {
                        variant: "restaurant",
                        minHeight: "50vh",
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        textColor: "#ffffff",
                        titleColor: "#ffffff",
                        textAlign: "center",
                        buttonColor: "#ffffff",
                        buttonTextColor: "#ef4444",
                        fullWidth: true
                    }
                },
                {
                    id: "categories-restaurant",
                    type: "categories",
                    content: { title: "Nosso Cardápio", selectionMode: "auto", limit: 8 },
                    styles: { variant: "horizontal", headingColor: "#111827", accentColor: "#ef4444", fullWidth: true }
                },
                {
                    id: "products-restaurant",
                    type: "product-grid",
                    content: { collectionType: "featured", title: "Mais Pedidos", limit: 6 },
                    styles: {
                        backgroundColor: "#fef2f2",
                        textColor: "#111827",
                        accentColor: "#ef4444",
                        cardVariant: "horizontal",
                        fullWidth: true,
                        paddingTop: "2rem",
                        paddingBottom: "2rem"
                    }
                },
                {
                    id: "cta-restaurant",
                    type: "newsletter",
                    content: {
                        title: "Peça pelo WhatsApp",
                        description: "Faça seu pedido diretamente pelo WhatsApp e receba ofertas exclusivas",
                        placeholder: "seu@email.com",
                        buttonText: "Fazer Pedido"
                    },
                    styles: {
                        variant: "cta",
                        backgroundColor: "#1f2937",
                        titleColor: "#ffffff",
                        textColor: "#9ca3af",
                        buttonColor: "#ef4444",
                        buttonTextColor: "#ffffff",
                        fullWidth: true
                    }
                }
            ])
        }
    },
    {
        id: "cardapio-direto",
        name: "Cardápio Direto",
        description: "Layout minimalista focado 100% em pedidos. Sem distrações, só cardápio",
        badge: "Novo",
        features: ["Lista simples", "Popup de pedido", "Login rápido", "Sem páginas extras"],
        colors: {
            primary: "#18181b",
            secondary: "#f4f4f5",
            background: "#ffffff"
        },
        config: {
            themeColor: "#18181b",
            secondaryColor: "#f4f4f5",
            backgroundColor: "#ffffff",
            headerColor: "#18181b",
            footerBg: "#18181b",
            footerText: "#a1a1aa",
            headingColor: "#18181b",
            bodyColor: "#52525b",
            menuColor: "#ffffff",
            siteType: "cardapio",
            deliveryTime: "25-40 min",
            minPurchaseValue: 10,
            showAccountButton: true,
            headerStyle: "cardapio",
            cardStyle: "list",
            footerStyle: "minimal",
            homeLayout: JSON.stringify([])
        }
    },
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
            siteType: "shop",
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
                        variant: "default",
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
            siteType: "shop",
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
                        variant: "minimal",
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
            siteType: "shop",
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
                        variant: "split",
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
                    content: { collectionType: "featured", title: "Em Alta", limit: 8 },
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
    },
    {
        id: "optica",
        name: "Ótica",
        description: "Layout sofisticado para óticas e lojas de óculos. Inspirado em grandes marcas do setor",
        badge: "Novo",
        features: ["Header com logo texto", "Carousel de marcas lifestyle", "Blog integrado", "Cards com swatches de cor"],
        colors: {
            primary: "#1a1a1a",
            secondary: "#f5f5f5",
            background: "#ffffff"
        },
        config: {
            themeColor: "#1a1a1a",
            secondaryColor: "#f5f5f5",
            backgroundColor: "#ffffff",
            headerColor: "#ffffff",
            footerBg: "#1a1a1a",
            footerText: "#a3a3a3",
            headingColor: "#1a1a1a",
            bodyColor: "#4a4a4a",
            menuColor: "#1a1a1a",
            priceColor: "#1a1a1a",
            productBtnBg: "#1a1a1a",
            productBtnText: "#ffffff",
            siteType: "shop",
            headerStyle: "optica",
            cardStyle: "optica",
            footerStyle: "full",
            productGalleryLayout: "dots",
            showHoverImage: true,
            showInstallments: true,
            enableQuickBuy: true,
            homeLayout: JSON.stringify([
                {
                    id: "hero-optica",
                    type: "hero",
                    content: {
                        slides: [
                            {
                                id: "slide-1",
                                title: "Estilo que Marca Presença",
                                subtitle: "Conheça armações sofisticadas que unem elegância e personalidade",
                                buttonText: "VER COLEÇÃO",
                                buttonLink: "/produtos"
                            },
                            {
                                id: "slide-2",
                                title: "Lançamentos Exclusivos",
                                subtitle: "Tendências internacionais selecionadas para você",
                                buttonText: "CONFERIR",
                                buttonLink: "/produtos?collection=new"
                            }
                        ],
                        autoplay: true,
                        autoplayInterval: 6
                    },
                    styles: {
                        variant: "default",
                        minHeight: "85vh",
                        background: "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)",
                        textColor: "#ffffff",
                        titleColor: "#ffffff",
                        textAlign: "left",
                        buttonColor: "transparent",
                        buttonTextColor: "#ffffff",
                        fullWidth: true
                    }
                },
                {
                    id: "categories-optica",
                    type: "categories",
                    content: { title: "", selectionMode: "auto", limit: 3 },
                    styles: {
                        variant: "grid",
                        headingColor: "#ffffff",
                        cardTextColor: "#ffffff",
                        fullWidth: true,
                        paddingTop: "1rem",
                        paddingBottom: "1rem"
                    }
                },
                {
                    id: "products-lancamentos",
                    type: "product-grid",
                    content: { collectionType: "new", title: "Lançamentos", limit: 8 },
                    styles: {
                        variant: "carousel",
                        backgroundColor: "#ffffff",
                        textColor: "#1a1a1a",
                        accentColor: "#1a1a1a",
                        headingColor: "#1a1a1a",
                        fullWidth: true,
                        paddingTop: "2.5rem",
                        paddingBottom: "1rem"
                    }
                },
                {
                    id: "promo-banner-optica",
                    type: "promo-banner",
                    content: {
                        title: "Estilo &\nproteção.",
                        subtitle: "",
                        buttonText: "",
                        buttonLink: "",
                        image: "",
                        overlayOpacity: 0.3
                    },
                    styles: {
                        backgroundColor: "#374151",
                        textColor: "#ffffff",
                        textAlign: "left",
                        minHeight: "400px",
                        fullWidth: true,
                        paddingTop: "0",
                        paddingBottom: "0"
                    }
                },
                {
                    id: "products-mais-vendidos",
                    type: "product-grid",
                    content: { collectionType: "featured", title: "Mais vendidos", limit: 8 },
                    styles: {
                        variant: "carousel",
                        backgroundColor: "#ffffff",
                        textColor: "#1a1a1a",
                        accentColor: "#1a1a1a",
                        headingColor: "#1a1a1a",
                        fullWidth: true,
                        paddingTop: "1rem",
                        paddingBottom: "1rem"
                    }
                },
                {
                    id: "brands-optica",
                    type: "brands",
                    content: { title: "Marcas em destaque", selectionMode: "auto", limit: 6 },
                    styles: {
                        variant: "lifestyle",
                        headingColor: "#1a1a1a",
                        fullWidth: true,
                        paddingTop: "1rem",
                        paddingBottom: "1rem"
                    }
                },
                {
                    id: "blog-optica",
                    type: "blog-posts",
                    content: {
                        title: "Últimas do blog",
                        linkText: "Ver tudo",
                        linkUrl: "/blog",
                        columns: 2,
                        posts: []
                    },
                    styles: {
                        headingColor: "#1a1a1a",
                        textColor: "#6b7280",
                        fullWidth: true,
                        paddingTop: "1rem",
                        paddingBottom: "1rem"
                    }
                },
                {
                    id: "reviews-optica",
                    type: "testimonials",
                    content: {
                        title: "O que estão falando da gente",
                        subtitle: "Veja a opinião de quem já comprou conosco",
                        layout: "grid",
                        columns: 3,
                        testimonials: [
                            {
                                id: "1",
                                name: "Maria Silva",
                                role: "Cliente há 2 anos",
                                text: "Ótima loja! Produtos de qualidade e atendimento excelente.",
                                rating: 5
                            },
                            {
                                id: "2",
                                name: "João Santos",
                                role: "Cliente",
                                text: "Sempre encontro o que preciso. Recomendo!",
                                rating: 5
                            },
                            {
                                id: "3",
                                name: "Ana Costa",
                                role: "Cliente há 1 ano",
                                text: "Entrega rápida e produtos originais. Muito satisfeita!",
                                rating: 5
                            }
                        ]
                    },
                    styles: {
                        headingColor: "#1a1a1a",
                        textColor: "#4a4a4a",
                        fullWidth: true,
                        paddingTop: "2rem",
                        paddingBottom: "2rem"
                    }
                },
                {
                    id: "showcase-optica",
                    type: "product-grid",
                    content: { collectionType: "featured", title: "", limit: 10 },
                    styles: {
                        variant: "showcase",
                        backgroundColor: "#ffffff",
                        fullWidth: true,
                        paddingTop: "0",
                        paddingBottom: "1rem"
                    }
                }
            ])
        }
    }
];

export function getTemplateById(id: string): Template | undefined {
    return templates.find(t => t.id === id);
}
