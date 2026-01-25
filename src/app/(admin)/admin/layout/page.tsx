import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Monitor, Lock } from "lucide-react";

export default function LayoutDashboardPage() {
    return (
        <div className="space-y-8 p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900">Layout</h1>

            {/* Current Layout Card */}
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
                        <h2 className="text-xl font-bold text-slate-900">Morelia</h2>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 rounded-full px-3">Layout atual</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 font-medium">
                            <Link href="/admin/layout/editor">Editar layout atual</Link>
                        </Button>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-5 w-5 text-slate-500" />
                        </Button>
                    </div>
                </div>
            </div>



            {/* Theme Store Banner */}
            <div className="rounded-xl border border-purple-100 bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Mais de 60 temas disponíveis</h2>
                    <p className="text-slate-600 max-w-md">
                        Explore nossa galeria de temas para dar uma nova cara à sua loja. <br />
                        <span className="text-purple-600 font-medium text-sm mt-1 inline-block bg-purple-100 px-2 py-0.5 rounded">Em breve</span>
                    </p>
                </div>
                <div className="relative z-10">
                    <Button variant="outline" className="bg-white/80 hover:bg-white text-slate-700 border-white/50 backdrop-blur-sm gap-2 shadow-sm" disabled>
                        <Lock className="h-4 w-4" /> Ver outros temas
                    </Button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
                <div className="absolute left-1/2 top-0 w-32 h-32 bg-pink-200/20 rounded-full blur-2xl"></div>
            </div>
        </div>
    );
}
