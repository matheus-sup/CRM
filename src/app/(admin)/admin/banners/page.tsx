import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getBanners, deleteBanner } from "@/lib/actions/banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Local type definition to avoid Prisma client sync issues during dev
interface Banner {
    id: string;
    label: string | null;
    imageUrl: string;
    active: boolean;
}

export default async function BannersPage() {
    const banners = await getBanners() as Banner[];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
                <Link href="/admin/banners/novo">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Novo Banner
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {banners.map((banner) => (
                    <Card key={banner.id} className="overflow-hidden">
                        <div className="aspect-21/9 w-full relative bg-muted">
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
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base truncate">{banner.label || "Sem título"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex justify-between items-center">
                            <form action={async () => {
                                "use server";
                                await deleteBanner(banner.id);
                            }}>
                                <Button variant="destructive" size="sm" type="submit">Excluir</Button>
                            </form>
                            <Link href={`/admin/banners/${banner.id}`}>
                                <Button variant="outline" size="sm">Editar</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
