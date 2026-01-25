
import { getDraftStoreConfig } from "@/lib/actions/settings";
import { getBanners } from "@/lib/actions/banner";
import { SiteEditorLayout } from "@/components/admin/site/SiteEditorLayout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FullscreenEditorPage() {
    const config = await getDraftStoreConfig();
    const banners = await getBanners();
    const products = await prisma.product.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: { images: true }
    });
    const menus = await prisma.menu.findMany({
        include: { items: true }
    });

    // Serialize Decimal types for Client Components
    const serializedConfig = {
        ...config,
        menus: menus, // Attach menus to config for Header
        minPurchaseValue: config?.minPurchaseValue ? Number(config.minPurchaseValue) : 0,
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden">
            {/* Minimal Header for Fullscreen Mode */}
            <div className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-xs z-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild className="gap-2 text-slate-500 hover:text-slate-900">
                        <Link href="/admin/site">
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Link>
                    </Button>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <span className="font-bold text-slate-800">Editor Visual</span>
                </div>
            </div>

            {/* Main Editor Area - Fill remaining space */}
            <div className="flex-1 overflow-hidden relative">
                <SiteEditorLayout config={serializedConfig} banners={banners as any} products={JSON.parse(JSON.stringify(products))} />
            </div>
        </div>
    );
}
