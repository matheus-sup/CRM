import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Monitor, Lock, Share2, Palette } from "lucide-react";
import { getStoreConfig } from "@/lib/actions/settings";
import { SiteContactForm } from "@/components/admin/site/SiteContactForm";

export default async function SitePage() {
    const config = await getStoreConfig();

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
                        <h2 className="text-xl font-bold text-slate-900">{"Tema Personalizado"}</h2>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 rounded-full px-3">Ativo</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 font-medium shadow-md">
                            <Link href="/admin/editor">
                                <Palette className="mr-2 h-4 w-4" />
                                Editar site (Tela Cheia)
                            </Link>
                        </Button>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-5 w-5 text-slate-500" />
                        </Button>
                    </div>
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
                    {/* We can embed the form here or link to it. Embedding is nice for "Dashboard" feel. */}
                    <div className="scale-95 origin-top-left">
                        <SiteContactForm config={serializedConfig} />
                    </div>
                </div>

                {/* Theme Store Banner */}
                <div className="rounded-xl border border-purple-100 bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 flex flex-col justify-between overflow-hidden relative">
                    <div className="relative z-10 space-y-3">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Temas Premium</h2>
                            <p className="text-slate-600 text-sm">
                                Explore nossa galeria de temas para dar uma nova cara à sua loja.
                            </p>
                        </div>
                        <Badge variant="secondary" className="bg-white/80 text-purple-700 backdrop-blur-sm border-purple-200 self-start">
                            Em breve
                        </Badge>
                    </div>
                    <div className="relative z-10 mt-6">
                        <Button variant="outline" className="w-full bg-white/80 hover:bg-white text-slate-700 border-white/50 backdrop-blur-sm gap-2 shadow-sm" disabled>
                            <Lock className="h-4 w-4" /> Ver galeria
                        </Button>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}
