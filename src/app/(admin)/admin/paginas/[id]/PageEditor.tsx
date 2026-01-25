"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Trash, ExternalLink } from "lucide-react";
import Link from "next/link";
import { updatePage, deletePage } from "@/lib/actions/page";
import { Switch } from "@/components/ui/switch";

export function PageEditor({ page }: { page: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (formData: FormData) => {
        setLoading(true);
        await updatePage(page.id, null, formData);
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir esta página?")) return;
        const res = await deletePage(page.id);
        if (res.success) router.push("/admin/paginas");
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/paginas">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Editar Página</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/${page.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" /> Ver na Loja
                        </Link>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={handleDelete} title="Excluir Página">
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <form id="edit-form" action={handleUpdate} className="space-y-6">
                        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={page.title}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Conteúdo</Label>
                                <textarea
                                    name="content"
                                    id="content"
                                    defaultValue={page.content}
                                    className="w-full min-h-[500px] p-4 rounded-md border border-slate-200 bg-slate-50 font-mono text-sm leading-relaxed focus:outline-blue-500"
                                    placeholder="<p>Texto...</p>"
                                ></textarea>
                            </div>
                        </div>

                        {/* Hidden submit trigger to update status/sidebar info together if needed, but we keep sidebar outside form or inputs inside */}
                        {/* We need to capture sidebar inputs in the same form submission or use separate calls. 
                             Easiest: One big form wrapping everything. */}
                    </form>
                </div>

                {/* Right: Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
                        <h3 className="font-bold text-slate-800">Publicação</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="slug">URL (Slug)</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={page.slug}
                                    form="edit-form" // Link to main form
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between border-t pt-4">
                                <Label htmlFor="published" className="cursor-pointer">Publicado?</Label>
                                <Switch
                                    id="published"
                                    name="published"
                                    defaultChecked={page.published}
                                    form="edit-form"
                                />
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading} form="edit-form">
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
