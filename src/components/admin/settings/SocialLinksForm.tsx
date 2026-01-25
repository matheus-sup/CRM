"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateStoreConfig } from "@/lib/actions/settings";
import { StatusFeedback } from "@/components/admin/StatusFeedback";
import { useState, useTransition } from "react";
import { Loader2, Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const socialSchema = z.object({
    instagram: z.string().optional(),
    instagramToken: z.string().optional(),
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
    twitter: z.string().optional(),
    pinterest: z.string().optional(),
    pinterestTag: z.string().optional(),
});

export function SocialLinksForm({ config }: { config: any }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const form = useForm<z.infer<typeof socialSchema>>({
        resolver: zodResolver(socialSchema),
        defaultValues: {
            instagram: config?.instagram || "",
            instagramToken: config?.instagramToken || "",
            facebook: config?.facebook || "",
            youtube: config?.youtube || "",
            tiktok: config?.tiktok || "",
            twitter: config?.twitter || "",
            pinterest: config?.pinterest || "",
            pinterestTag: config?.pinterestTag || "",
        },
    });

    function onSubmit(values: z.infer<typeof socialSchema>) {
        setStatus("idle");
        startTransition(async () => {
            try {
                const formData = new FormData();
                Object.entries(values).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) formData.append(key, value);
                });

                await updateStoreConfig(null, formData);
                setStatus("success");
            } catch (error) {
                setStatus("error");
            }
        });
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-1">Links de redes sociais</h2>
                <p className="text-sm text-slate-500">Adicione as redes sociais da sua loja para que apareçam como informação de contato no rodapé.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="instagram"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome de usuário no Instagram</FormLabel>
                                    <FormControl><Input placeholder="@sua.loja" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="instagramToken"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Token do Instagram</FormLabel>
                                    <FormControl><Input placeholder="Token para exibição do feed (opcional)" {...field} /></FormControl>
                                    <FormDescription>Permite mostrar o feed na sua loja.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <FormField
                            control={form.control}
                            name="facebook"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Link da página do Facebook</FormLabel>
                                    <FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="youtube"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Link do canal do YouTube</FormLabel>
                                    <FormControl><Input placeholder="https://youtube.com/..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tiktok"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome de usuário no TikTok</FormLabel>
                                    <FormControl><Input placeholder="@usuario" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="twitter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome de usuário no Twitter</FormLabel>
                                    <FormControl><Input placeholder="@usuario" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="pinterest"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Link da página do Pinterest</FormLabel>
                                    <FormControl><Input placeholder="https://pinterest.com/..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="pinterestTag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Etiqueta do Pinterest</FormLabel>
                                    <FormControl><Input placeholder='<meta name="p:domain_verify" ... />' {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <StatusFeedback status={status} />
                        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar alterações
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
