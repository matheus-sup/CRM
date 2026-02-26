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
import { Loader2, Eye, EyeOff } from "lucide-react";

const maintenanceSchema = z.object({
    maintenanceMode: z.boolean(),
    maintenanceMessage: z.string().optional(),
    maintenancePassword: z.string().optional(),
});

export function MaintenanceForm({ config }: { config: any }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof maintenanceSchema>>({
        resolver: zodResolver(maintenanceSchema),
        defaultValues: {
            maintenanceMode: config?.maintenanceMode || false,
            maintenanceMessage: config?.maintenanceMessage || "Estamos reformando a loja e está ficando incrível. Volte em alguns dias.",
            maintenancePassword: config?.maintenancePassword || "",
        },
    });

    function onSubmit(values: z.infer<typeof maintenanceSchema>) {
        setStatus("idle");
        startTransition(async () => {
            try {
                await updateStoreConfig(values);
                setStatus("success");
            } catch (error) {
                setStatus("error");
            }
        });
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-1">Página em construção</h2>
                <p className="text-sm text-slate-500">Deixe uma mensagem para avisar seus clientes que a loja ainda não está pronta.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-4 border border-blue-100">
                        <FormField
                            control={form.control}
                            name="maintenanceMode"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg w-full space-y-0">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base font-semibold text-blue-900">Habilitar Página em Manutenção</FormLabel>
                                        <FormDescription>
                                            Use esta opção para restringir o acesso à sua loja.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="maintenanceMessage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mensagem que os clientes vão ver</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Estamos em manutenção..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maintenancePassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha de acesso</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Senha para acessar a loja (opcional)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-500" />
                                            )}
                                        </Button>
                                    </div>
                                    <FormDescription>Só quem tiver a senha poderá ver sua loja.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <StatusFeedback status={status} />
                        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
