"use client";

import { register } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [error, setError] = useState("");

    async function handleSubmit(formData: FormData) {
        setError("");
        startTransition(async () => {
            const res = await register(formData);
            if (res.success) {
                router.push("/minha-conta");
                router.refresh();
            } else {
                setError(res.message || "Erro ao cadastrar.");
            }
        });
    }

    return (
        <div className="container mx-auto px-4 pt-32 pb-20 flex justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Crie sua Conta</h1>
                    <p className="text-slate-500">Acompanhe seus pedidos e ganhe descontos.</p>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input name="name" placeholder="Seu nome" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="document">CPF</Label>
                            <Input name="document" placeholder="000.000.000-00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Celular</Label>
                            <Input name="phone" placeholder="(00) 00000-0000" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input name="email" type="email" placeholder="seu@email.com" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input name="password" type="password" placeholder="Mínimo 6 caracteres" required minLength={6} />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button className="w-full" size="lg" disabled={isPending}>
                        {isPending ? "Criando Conta..." : "Criar Conta"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Já tem conta?{" "}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                        Fazer Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
