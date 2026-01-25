"use client";

import { SiteHomeForm } from "../site/sections/SiteHomeForm";
import { SiteBanners } from "../site/SiteBanners";
import { SiteHeaderForm } from "../site/sections/SiteHeaderForm";
import { SiteFooterForm } from "../site/sections/SiteFooterForm";
import { SiteProductListForm } from "../site/sections/SiteProductListForm";
import { SiteProductDetailForm } from "../site/sections/SiteProductDetailForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LayoutSettings({ config, banners }: { config: any, banners: any[] }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-slate-800">Layout da Loja</h2>
                <p className="text-slate-500 text-sm">Personalize a estrutura de todas as páginas.</p>
            </div>

            <Tabs defaultValue="home" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-lg flex-wrap h-auto">
                    <TabsTrigger value="home">Página Inicial</TabsTrigger>
                    <TabsTrigger value="banners">Banners</TabsTrigger>
                    <TabsTrigger value="header">Cabeçalho</TabsTrigger>
                    <TabsTrigger value="footer">Rodapé</TabsTrigger>
                    <TabsTrigger value="products">Listagem</TabsTrigger>
                    <TabsTrigger value="product-detail">Detalhe do Produto</TabsTrigger>
                </TabsList>

                <TabsContent value="home" className="mt-6">
                    <SiteHomeForm config={config} />
                </TabsContent>

                <TabsContent value="banners" className="mt-6">
                    <SiteBanners banners={banners} />
                </TabsContent>

                <TabsContent value="header" className="mt-6">
                    <SiteHeaderForm config={config} />
                </TabsContent>

                <TabsContent value="footer" className="mt-6">
                    <SiteFooterForm config={config} />
                </TabsContent>

                <TabsContent value="products" className="mt-6">
                    <SiteProductListForm config={config} />
                </TabsContent>

                <TabsContent value="product-detail" className="mt-6">
                    <SiteProductDetailForm config={config} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
