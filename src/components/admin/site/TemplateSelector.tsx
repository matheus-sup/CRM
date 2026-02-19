"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
    id: string;
    name: string;
    description: string;
    preview: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
    };
    config: any;
}

const templates: Template[] = [
    {
        id: "classic",
        name: "Clássico Elegante",
        description: "Design tradicional e sofisticado, perfeito para lojas de cosméticos premium",
        preview: "/templates/classic-preview.jpg",
        colors: {
            primary: "#db2777",
            secondary: "#fce7f3",
            background: "#ffffff"
        },
        config: {
            theme: "modern",
            themeColor: "#db2777",
            secondaryColor: "#fce7f3",
            backgroundColor: "#ffffff",
            headerColor: "#ffffff",
            footerBg: "#0f172a",
            footerText: "#a3a3a3",
            headingColor: "#111827",
            bodyColor: "#334155",
            menuColor: "#334155",
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
                    id: "brands-classic",
                    type: "brands",
                    content: {
                        title: "Marcas Parceiras",
                        selectionMode: "auto",
                        limit: 6
                    },
                    styles: {
                        headingColor: "#111827",
                        fullWidth: true
                    }
                },
                {
                    id: "categories-classic",
                    type: "categories",
                    content: {
                        title: "Categorias em Destaque",
                        selectionMode: "auto",
                        limit: 8
                    },
                    styles: {
                        headingColor: "#111827",
                        cardTextColor: "#ffffff",
                        fullWidth: true
                    }
                },
                {
                    id: "products-classic",
                    type: "product-grid",
                    content: {
                        collectionType: "featured",
                        title: "Produtos em Destaque",
                        limit: 4
                    },
                    styles: {
                        backgroundColor: "#f8fafc",
                        textColor: "#111827",
                        accentColor: "#db2777",
                        fullWidth: true,
                        paddingTop: "5rem",
                        paddingBottom: "5rem"
                    }
                },
                {
                    id: "newsletter-classic",
                    type: "newsletter",
                    content: {
                        title: "Entre para o Clube",
                        description: "Receba novidades, dicas de beleza e ofertas exclusivas",
                        placeholder: "Seu melhor e-mail",
                        buttonText: "Inscrever"
                    },
                    styles: {
                        backgroundColor: "#0f172a",
                        titleColor: "#ffffff",
                        textColor: "#ffffff",
                        iconColor: "#db2777",
                        buttonColor: "#db2777",
                        buttonTextColor: "#ffffff",
                        fullWidth: true
                    }
                }
            ])
        }
    },
    {
        id: "minimal",
        name: "Minimalista Moderno",
        description: "Design limpo e minimalista, focado na experiência do usuário",
        preview: "/templates/minimal-preview.jpg",
        colors: {
            primary: "#000000",
            secondary: "#f5f5f5",
            background: "#ffffff"
        },
        config: {
            theme: "modern",
            themeColor: "#000000",
            secondaryColor: "#f5f5f5",
            backgroundColor: "#ffffff",
            headerColor: "#ffffff",
            footerBg: "#000000",
            footerText: "#ffffff",
            headingColor: "#000000",
            bodyColor: "#404040",
            menuColor: "#000000",
            menuLinkColor: "#000000",
            menuLinkHoverColor: "#666666",
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
                        minHeight: "85vh",
                        background: "#f5f5f5",
                        textColor: "#000000",
                        titleColor: "#000000",
                        textAlign: "left",
                        buttonColor: "#000000",
                        buttonTextColor: "#ffffff",
                        fullWidth: true,
                        paddingLeft: "5%",
                        paddingRight: "5%"
                    }
                },
                {
                    id: "text-minimal",
                    type: "text",
                    content: {
                        html: `<div style="max-width: 800px; margin: 0 auto; text-align: center; padding: 4rem 1rem;">
                            <h2 style="font-size: 2.5rem; font-weight: 300; margin-bottom: 1rem; letter-spacing: -0.02em; color: #000000;">
                                Simplicidade e Qualidade
                            </h2>
                            <p style="font-size: 1.125rem; color: #666; line-height: 1.8;">
                                Cada produto é cuidadosamente selecionado para proporcionar resultados excepcionais com ingredientes puros e naturais.
                            </p>
                        </div>`
                    },
                    styles: {
                        backgroundColor: "#ffffff",
                        fullWidth: true
                    }
                },
                {
                    id: "products-minimal",
                    type: "product-grid",
                    content: {
                        collectionType: "featured",
                        title: "Essenciais",
                        limit: 6
                    },
                    styles: {
                        backgroundColor: "#ffffff",
                        textColor: "#000000",
                        accentColor: "#000000",
                        fullWidth: true,
                        paddingTop: "3rem",
                        paddingBottom: "5rem"
                    }
                },
                {
                    id: "categories-minimal",
                    type: "categories",
                    content: {
                        title: "Categorias",
                        selectionMode: "auto",
                        limit: 4
                    },
                    styles: {
                        headingColor: "#000000",
                        cardTextColor: "#ffffff",
                        fullWidth: true,
                        paddingBottom: "5rem"
                    }
                },
                {
                    id: "newsletter-minimal",
                    type: "newsletter",
                    content: {
                        title: "Newsletter",
                        description: "Novidades e lançamentos exclusivos direto na sua caixa de entrada",
                        placeholder: "seu@email.com",
                        buttonText: "→"
                    },
                    styles: {
                        backgroundColor: "#000000",
                        titleColor: "#ffffff",
                        textColor: "#ffffff",
                        iconColor: "#666666",
                        buttonColor: "#ffffff",
                        buttonTextColor: "#000000",
                        fullWidth: true
                    }
                }
            ])
        }
    },
    {
        id: "vibrant",
        name: "Vibrante & Ousado",
        description: "Cores vivas e design ousado para marcas jovens e modernas",
        preview: "/templates/vibrant-preview.jpg",
        colors: {
            primary: "#ff6b6b",
            secondary: "#4ecdc4",
            background: "#ffe66d"
        },
        config: {
            theme: "modern",
            themeColor: "#ff6b6b",
            secondaryColor: "#4ecdc4",
            backgroundColor: "#ffffff",
            headerColor: "#ffe66d",
            footerBg: "#2c3e50",
            footerText: "#ecf0f1",
            headingColor: "#2c3e50",
            bodyColor: "#34495e",
            menuColor: "#2c3e50",
            menuLinkColor: "#2c3e50",
            menuLinkHoverColor: "#ff6b6b",
            homeLayout: JSON.stringify([
                {
                    id: "hero-vibrant",
                    type: "hero",
                    content: {
                        slides: [
                            {
                                id: "slide-1",
                                title: "Brilhe com Cor",
                                subtitle: "Expresse sua personalidade com nossa coleção vibrante",
                                buttonText: "Descobrir Agora",
                                buttonLink: "/produtos"
                            },
                            {
                                id: "slide-2",
                                title: "Novidade da Semana",
                                subtitle: "Produtos frescos e tendências que você vai amar",
                                buttonText: "Ver Novidades",
                                buttonLink: "/produtos?filter=new"
                            }
                        ],
                        autoplay: true,
                        autoplayInterval: 5
                    },
                    styles: {
                        minHeight: "75vh",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        textColor: "#ffffff",
                        titleColor: "#ffffff",
                        textAlign: "center",
                        buttonColor: "#ff6b6b",
                        buttonTextColor: "#ffffff",
                        fullWidth: true
                    }
                },
                {
                    id: "promo-vibrant",
                    type: "promo",
                    content: {
                        title: "🎉 Super Desconto de Lançamento!",
                        subtitle: "Até 50% OFF em produtos selecionados - Por tempo limitado!"
                    },
                    styles: {
                        backgroundColor: "#4ecdc4",
                        textColor: "#ffffff",
                        fullWidth: true
                    }
                },
                {
                    id: "categories-vibrant",
                    type: "categories",
                    content: {
                        title: "Explore por Categoria",
                        selectionMode: "auto",
                        limit: 6
                    },
                    styles: {
                        headingColor: "#2c3e50",
                        cardTextColor: "#ffffff",
                        fullWidth: true,
                        paddingTop: "4rem",
                        paddingBottom: "4rem"
                    }
                },
                {
                    id: "products-vibrant",
                    type: "product-grid",
                    content: {
                        collectionType: "featured",
                        title: "🔥 Produtos Mais Amados",
                        limit: 8
                    },
                    styles: {
                        backgroundColor: "#fff8e1",
                        textColor: "#2c3e50",
                        accentColor: "#ff6b6b",
                        fullWidth: true,
                        paddingTop: "4rem",
                        paddingBottom: "4rem"
                    }
                },
                {
                    id: "brands-vibrant",
                    type: "brands",
                    content: {
                        title: "✨ Marcas Incríveis",
                        selectionMode: "auto",
                        limit: 8
                    },
                    styles: {
                        headingColor: "#2c3e50",
                        fullWidth: true
                    }
                },
                {
                    id: "newsletter-vibrant",
                    type: "newsletter",
                    content: {
                        title: "💌 Não Perca Nada!",
                        description: "Inscreva-se para receber ofertas exclusivas, lançamentos e muito mais",
                        placeholder: "Digite seu e-mail aqui",
                        buttonText: "Quero Receber!"
                    },
                    styles: {
                        backgroundColor: "#2c3e50",
                        titleColor: "#ffe66d",
                        textColor: "#ecf0f1",
                        iconColor: "#4ecdc4",
                        buttonColor: "#ff6b6b",
                        buttonTextColor: "#ffffff",
                        fullWidth: true
                    }
                }
            ])
        }
    }
];

interface TemplateSelectorProps {
    currentConfig: any;
    onApplyTemplate: (template: Template) => void;
}

export function TemplateSelector({ currentConfig, onApplyTemplate }: TemplateSelectorProps) {
    const [open, setOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const handleApply = () => {
        const template = templates.find(t => t.id === selectedTemplate);
        if (template) {
            if (confirm(`Aplicar o template "${template.name}"?\n\nIsso substituirá as configurações atuais de cores, layout e blocos da página inicial.`)) {
                onApplyTemplate(template);
                setOpen(false);
            }
        }
    };

    return (
        <>
            <div
                onClick={() => setOpen(true)}
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 hover:text-blue-600 group"
            >
                <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Escolher Template</span>
                </div>
                <svg className="h-4 w-4 text-slate-300 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <Palette className="h-6 w-6 text-blue-600" />
                            Escolher Template
                        </DialogTitle>
                        <DialogDescription>
                            Escolha um template para seu site. Você poderá personalizar todas as cores e configurações depois.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => setSelectedTemplate(template.id)}
                                className={cn(
                                    "relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-xl",
                                    selectedTemplate === template.id
                                        ? "border-blue-600 shadow-lg ring-4 ring-blue-100"
                                        : "border-slate-200 hover:border-blue-300"
                                )}
                            >
                                {/* Preview Colors */}
                                <div className="h-32 flex">
                                    <div className="flex-1" style={{ backgroundColor: template.colors.primary }} />
                                    <div className="flex-1" style={{ backgroundColor: template.colors.secondary }} />
                                    <div className="flex-1" style={{ backgroundColor: template.colors.background }} />
                                </div>

                                {/* Template Info */}
                                <div className="p-4 bg-white">
                                    <h3 className="font-bold text-lg mb-1 flex items-center justify-between">
                                        {template.name}
                                        {selectedTemplate === template.id && (
                                            <Check className="h-5 w-5 text-blue-600" />
                                        )}
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {template.description}
                                    </p>

                                    {/* Color Swatches */}
                                    <div className="flex gap-2 mt-3">
                                        <div
                                            className="h-6 w-6 rounded-full border-2 border-white shadow"
                                            style={{ backgroundColor: template.colors.primary }}
                                            title="Cor Principal"
                                        />
                                        <div
                                            className="h-6 w-6 rounded-full border-2 border-white shadow"
                                            style={{ backgroundColor: template.colors.secondary }}
                                            title="Cor Secundária"
                                        />
                                        <div
                                            className="h-6 w-6 rounded-full border-2 border-slate-200 shadow"
                                            style={{ backgroundColor: template.colors.background }}
                                            title="Cor de Fundo"
                                        />
                                    </div>
                                </div>

                                {/* Selection Overlay */}
                                {selectedTemplate === template.id && (
                                    <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleApply}
                            disabled={!selectedTemplate}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            Aplicar Template
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
