"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateStoreConfig } from "@/lib/actions/settings";
import { StatusFeedback } from "@/components/admin/StatusFeedback";
import { useState, useTransition } from "react";
import { Loader2, Lock } from "lucide-react";

const authSchema = z.object({
    googleClientId: z.string().optional(),
    googleClientSecret: z.string().optional(),
    appleClientId: z.string().optional(),
    appleKeyId: z.string().optional(),
    appleTeamId: z.string().optional(),
    applePrivateKey: z.string().optional(),
});

export function SocialAuthForm({ config }: { config: any }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const form = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            googleClientId: config?.googleClientId || "",
            googleClientSecret: config?.googleClientSecret || "",
            appleClientId: config?.appleClientId || "",
            appleKeyId: config?.appleKeyId || "",
            appleTeamId: config?.appleTeamId || "",
            applePrivateKey: config?.applePrivateKey || "",
        },
    });

    function onSubmit(values: z.infer<typeof authSchema>) {
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
            <div className="flex items-center gap-3 border-b pb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Lock className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold">Login Social com Apple e Google</h2>
                    <p className="text-sm text-slate-500">Configure as chaves de API para permitir login social.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Google */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <span className="font-medium text-slate-800">Configurações do Google</span>
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">OAuth 2.0</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="googleClientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client ID</FormLabel>
                                        <FormControl><Input placeholder="Ex: 123456...apps.googleusercontent.com" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="googleClientSecret"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client Secret</FormLabel>
                                        <FormControl><Input type="password" placeholder="Ex: GOCSPX-..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Apple */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <span className="font-medium text-slate-800">Configurações da Apple</span>
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">Sign in with Apple</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="appleClientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Services ID (Client ID)</FormLabel>
                                        <FormControl><Input placeholder="Ex: com.loja.app" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="appleTeamId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Team ID</FormLabel>
                                        <FormControl><Input placeholder="Ex: A1B2C3D4E5" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="appleKeyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Key ID</FormLabel>
                                        <FormControl><Input placeholder="Ex: ABC123DEF4" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="applePrivateKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Private Key (.p8)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                                            className="font-mono text-xs h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Cole todo o conteúdo do arquivo .p8 gerado no Apple Developer Portal.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <StatusFeedback status={status} />
                        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar chaves de acesso
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
