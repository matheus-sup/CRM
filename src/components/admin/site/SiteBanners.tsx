"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Image as ImageIcon } from "lucide-react";
import { deleteBanner } from "@/lib/actions/banner"; // Ensure this action is accessible
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Banner {
    id: string;
    label: string | null;
    imageUrl: string;
    active: boolean;
}

export function SiteBanners({ banners }: { banners: Banner[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" /> Banners da Home
                    </CardTitle>
                    <CardDescription>Gerencie o carrossel principal da sua loja.</CardDescription>
                </div>
                <Link href="/admin/banners/novo">
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Novo Banner
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {banners.length > 0 ? (
                        banners.map((banner) => (
                            <div key={banner.id} className="group relative rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <div className="aspect-video w-full relative bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.label || "Banner"}
                                        className="object-cover w-full h-full"
                                    />
                                    {!banner.active && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Badge variant="secondary">Inativo</Badge>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 flex items-center justify-between">
                                    <span className="text-sm font-medium truncate max-w-[120px]" title={banner.label || ""}>
                                        {banner.label || "Sem título"}
                                    </span>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/banners/${banner.id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <span className="sr-only">Editar</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                            </Button>
                                        </Link>
                                        <form action={async () => {
                                            await deleteBanner(banner.id);
                                        }}>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0" type="submit">
                                                <span className="sr-only">Excluir</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-muted-foreground border border-dashed rounded-lg bg-slate-50">
                            Nenhum banner cadastrado.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
