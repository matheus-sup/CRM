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
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export function PageEditor({ page }: { page: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState(page.content || "");
    const [title, setTitle] = useState(page.title || "");
    const [slug, setSlug] = useState(page.slug || "");
    const [published, setPublished] = useState(page.published || false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("slug", slug);
        formData.append("content", content);
        formData.append("published", published ? "on" : "");

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

            <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Conteúdo</Label>
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Escreva o conteúdo da sua página aqui..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar Settings */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
                            <h3 className="font-bold text-slate-800">Publicação</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="slug">URL (Slug)</Label>
                                    <div className="flex items-center">
                                        <span className="bg-slate-100 border border-r-0 rounded-l-md px-3 py-2 text-slate-500 text-sm">/</span>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            className="rounded-l-none"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t pt-4">
                                    <Label htmlFor="published" className="cursor-pointer">Publicado?</Label>
                                    <Switch
                                        id="published"
                                        name="published"
                                        checked={published}
                                        onCheckedChange={setPublished}
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
