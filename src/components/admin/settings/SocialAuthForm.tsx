"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { updateStoreConfig } from "@/lib/actions/settings";
import { StatusFeedback } from "@/components/admin/StatusFeedback";
import { useState, useTransition } from "react";
import { Loader2, Lock } from "lucide-react";

const authSchema = z.object({
    // Google
    googleLoginEnabled: z.boolean().default(false),
    googleClientId: z.string().optional(),
    googleClientSecret: z.string().optional(),
    // Apple
    appleLoginEnabled: z.boolean().default(false),
    appleClientId: z.string().optional(),
    appleKeyId: z.string().optional(),
    appleTeamId: z.string().optional(),
    applePrivateKey: z.string().optional(),
    // Facebook
    facebookLoginEnabled: z.boolean().default(false),
    facebookAppId: z.string().optional(),
    facebookAppSecret: z.string().optional(),
});

export function SocialAuthForm({ config }: { config: any }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const form = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            // Google
            googleLoginEnabled: config?.googleLoginEnabled || false,
            googleClientId: config?.googleClientId || "",
            googleClientSecret: config?.googleClientSecret || "",
            // Apple
            appleLoginEnabled: config?.appleLoginEnabled || false,
            appleClientId: config?.appleClientId || "",
            appleKeyId: config?.appleKeyId || "",
            appleTeamId: config?.appleTeamId || "",
            applePrivateKey: config?.applePrivateKey || "",
            // Facebook
            facebookLoginEnabled: config?.facebookLoginEnabled || false,
            facebookAppId: config?.facebookAppId || "",
            facebookAppSecret: config?.facebookAppSecret || "",
        },
    });

    const googleEnabled = form.watch("googleLoginEnabled");
    const appleEnabled = form.watch("appleLoginEnabled");
    const facebookEnabled = form.watch("facebookLoginEnabled");

    function onSubmit(values: z.infer<typeof authSchema>) {
        setStatus("idle");
        startTransition(async () => {
            try {
                const formData = new FormData();
                Object.entries(values).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, typeof value === 'boolean' ? value.toString() : value);
                    }
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
                    <h2 className="text-lg font-semibold">Login Social</h2>
                    <p className="text-sm text-slate-500">Configure as chaves de API para permitir login social com Google, Apple e Facebook.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Google */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between pb-2 border-b">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white border rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                </div>
                                <span className="font-medium text-slate-800">Google</span>
                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">OAuth 2.0</span>
                            </div>
                            <FormField
                                control={form.control}
                                name="googleLoginEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormLabel className="text-sm text-slate-500">
                                            {field.value ? "Ativo" : "Inativo"}
                                        </FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${!googleEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between pb-2 border-b">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                    </svg>
                                </div>
                                <span className="font-medium text-slate-800">Apple</span>
                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">Sign in with Apple</span>
                            </div>
                            <FormField
                                control={form.control}
                                name="appleLoginEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormLabel className="text-sm text-slate-500">
                                            {field.value ? "Ativo" : "Inativo"}
                                        </FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className={`space-y-4 transition-opacity ${!appleEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
                    </div>

                    {/* Facebook */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between pb-2 border-b">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </div>
                                <span className="font-medium text-slate-800">Facebook</span>
                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">Facebook Login</span>
                            </div>
                            <FormField
                                control={form.control}
                                name="facebookLoginEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormLabel className="text-sm text-slate-500">
                                            {field.value ? "Ativo" : "Inativo"}
                                        </FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${!facebookEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                            <FormField
                                control={form.control}
                                name="facebookAppId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>App ID</FormLabel>
                                        <FormControl><Input placeholder="Ex: 123456789012345" {...field} /></FormControl>
                                        <FormDescription>Encontre no Facebook Developers &gt; Seu App &gt; Configurações &gt; Básico</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="facebookAppSecret"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>App Secret</FormLabel>
                                        <FormControl><Input type="password" placeholder="Ex: abc123def456..." {...field} /></FormControl>
                                        <FormDescription>Chave secreta do aplicativo Facebook</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <StatusFeedback status={status} />
                        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar configurações
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
