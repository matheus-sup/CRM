import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Share2, Palette } from "lucide-react";
import { getDraftStoreConfig } from "@/lib/actions/settings";
import { getActiveBanners } from "@/lib/actions/banner";
import { getProducts } from "@/lib/actions/product";
import { prisma } from "@/lib/prisma";
import { SiteEditorLayout } from "@/components/admin/site/SiteEditorLayout";
import { SiteContactForm } from "@/components/admin/site/SiteContactForm";
import { TemplateGallery } from "@/components/admin/site/TemplateGallery";

export default async function SitePage() {
    const config = await getDraftStoreConfig();

    // Serialize Decimal types for Client Components
    const serializedConfig = {
        ...config,
        minPurchaseValue: config?.minPurchaseValue ? Number(config.minPurchaseValue) : 0,
    };

    return (
        <div className="space-y-8 p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900">Editor do Site</h1>

            {/* Main Layout Card */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="h-64 bg-slate-100 relative group overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-linear-to-br from-slate-100 to-slate-200"></div>

                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <Monitor className="h-24 w-24 opacity-10" />
                    </div>
                    {/* Mock Browser UI - Hero Section */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[80%] h-[120%] bg-white shadow-2xl rounded-t-lg border border-slate-200 overflow-hidden transform transition-transform group-hover:-translate-y-2 duration-500">
                        {/* Header Mock */}
                        <div className="h-12 border-b flex items-center justify-between px-6 bg-white">
                            <div className="h-3 w-20 bg-slate-200 rounded-full"></div>
                            <div className="flex gap-2">
                                <div className="h-2 w-8 bg-slate-100 rounded-full"></div>
                                <div className="h-2 w-8 bg-slate-100 rounded-full"></div>
                                <div className="h-2 w-8 bg-slate-100 rounded-full"></div>
                            </div>
                        </div>
                        {/* Hero Mock */}
                        <div className="relative h-64 bg-slate-50 flex items-center">
                            <div className="w-1/2 pl-10 space-y-3">
                                <div className="h-2 w-16 bg-slate-200 rounded-full"></div>
                                <div className="h-6 w-32 bg-slate-800 rounded"></div>
                                <div className="h-3 w-48 bg-slate-300 rounded"></div>
                                <div className="h-8 w-24 bg-blue-600 rounded mt-4"></div>
                            </div>
                            <div className="w-1/2 h-full bg-slate-200/50"></div>
                        </div>
                    </div>
                </div>
                <div className="p-6 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900">{"Tema Personalizado Premium"}</h2>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 rounded-full px-3">Ativo</Badge>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 font-medium shadow-md">
                        <Link href="/admin/editor">
                            <Palette className="mr-2 h-4 w-4" />
                            Editar site (Tela Cheia)
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Social Media Card */}
                <div className="rounded-xl border bg-white shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                            <Share2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Redes Sociais & Contato</h3>
                            <p className="text-sm text-slate-500">Configure seus links de contato.</p>
                        </div>
                    </div>
                    <div className="scale-95 origin-top-left">
                        <SiteContactForm config={serializedConfig} />
                    </div>
                </div>

                {/* Templates Gallery */}
                <div className="rounded-xl border border-purple-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 overflow-hidden relative">
                    <div className="relative z-10 space-y-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Palette className="h-6 w-6 text-purple-600" />
                                Temas Premium
                            </h2>
                            <p className="text-slate-600 text-sm mt-1">
                                Escolha um template e transforme sua loja em segundos.
                            </p>
                        </div>

                        <TemplateGallery currentConfig={serializedConfig} />
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}

