"use client";

import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [error, setError] = useState("");

    async function handleSubmit(formData: FormData) {
        setError("");
        startTransition(async () => {
            const res = await login(formData);
            if (res.success) {
                router.push("/loja/minha-conta");
                router.refresh();
            } else {
                setError(res.message || "Erro ao entrar.");
            }
        });
    }

    return (
        <div className="container mx-auto px-4 pt-32 pb-20 flex justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Faça seu Login</h1>
                    <p className="text-slate-500">Bem-vindo de volta!</p>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input name="email" type="email" placeholder="seu@email.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input name="password" type="password" placeholder="••••••" required />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button className="w-full" size="lg" disabled={isPending}>
                        {isPending ? "Entrando..." : "Entrar"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Ainda não tem conta?{" "}
                    <Link href="/loja/cadastro" className="text-primary font-medium hover:underline">
                        Cadastre-se
                    </Link>
                </div>
            </div>
        </div>
    );
}
