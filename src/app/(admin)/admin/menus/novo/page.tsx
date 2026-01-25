"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createMenu } from "@/lib/actions/menu";

export default function NewMenuPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError("");

        const res = await createMenu(formData);

        if (res.success && res.redirectTo) {
            router.push(res.redirectTo);
        } else {
            setError(res.message || "Erro desconhecido");
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/menus">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-slate-800">Novo Menu</h1>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-6">
                <form action={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título do Menu</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="ex: Menu Principal"
                                required
                            />
                            <p className="text-xs text-slate-500">Nome interno para você identificar este menu.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="handle">Identificador (Handle)</Label>
                            <Input
                                id="handle"
                                name="handle"
                                placeholder="ex: main"
                                required
                            />
                            <p className="text-xs text-slate-500">
                                Use <strong>main</strong> para o cabeçalho principal e <strong>footer</strong> para o rodapé.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? "Criando..." : "Criar Menu"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
