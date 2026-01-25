"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createPage } from "@/lib/actions/page";

export default function NewPagePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError("");

        const res = await createPage(formData);

        if (res.success && res.redirectTo) {
            router.push(res.redirectTo);
        } else {
            setError(res.message || "Erro desconhecido");
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/paginas">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-slate-800">Nova Página</h1>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-6">
                <form action={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="ex: Sobre Nós"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">URL (Slug)</Label>
                            <div className="flex items-center">
                                <span className="bg-slate-100 border border-r-0 rounded-l-md px-3 py-2 text-slate-500 text-sm">/</span>
                                <Input
                                    id="slug"
                                    name="slug"
                                    className="rounded-l-none"
                                    placeholder="sobre-nos"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Conteúdo (HTML Simples)</Label>
                        <textarea
                            name="content"
                            id="content"
                            className="w-full min-h-[300px] p-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="<p>Escreva o conteúdo da sua página aqui...</p>"
                        ></textarea>
                        <p className="text-xs text-slate-500">
                            Em breve: Editor visual rico. Por enquanto, suporte a HTML básico.
                        </p>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? "Criando..." : "Criar Página"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
