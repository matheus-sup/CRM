"use client";

import { Star, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

// Mock data reflecting "Google Reviews" style (Top Rating Only)
const reviews = [
    {
        id: 1,
        name: "Ana Clara Silva",
        rating: 5,
        text: "Simplesmente apaixonada pelos produtos! A entrega foi super rápida e veio tudo muito bem embalado. Recomendo demais!",
        date: "2 semanas atrás"
    },
    {
        id: 2,
        name: "Juliana Costa",
        rating: 5,
        text: "O atendimento pelo WhatsApp foi incrível, tiraram todas as minhas dúvidas sobre qual tom de base escolher. Aprovadíssimo!",
        date: "1 mês atrás"
    },
    {
        id: 3,
        name: "Amanda Oliveira",
        rating: 5,
        text: "Melhor loja de makes! Os preços são ótimos e sempre tem novidade. Virei cliente fiel.",
        date: "3 semanas atrás"
    },
    {
        id: 4,
        name: "Fernanda Lima",
        rating: 5,
        text: "Comprei um perfume e a fixação é maravilhosa. Chegou antes do prazo. Parabéns pelo serviço!",
        date: "5 dias atrás"
    }
];

export function Testimonials() {
    return (
        <section className="bg-slate-50 py-16 border-y border-slate-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full">
                        Depoimentos
                    </span>
                    <h2 className="text-3xl font-bold text-slate-800 mt-4 mb-2">O que elas dizem?</h2>
                    <div className="flex items-center justify-center gap-2 text-yellow-400 text-lg">
                        <Star className="fill-current" />
                        <Star className="fill-current" />
                        <Star className="fill-current" />
                        <Star className="fill-current" />
                        <Star className="fill-current" />
                        <span className="text-slate-400 text-sm ml-2">(4.9/5.0 no Google)</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.slice(0, 3).map((review) => (
                        <Card key={review.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{review.name}</h4>
                                        <div className="flex text-yellow-400 h-3 w-3 gap-0.5">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <Star key={i} className="fill-current h-3 w-3" />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="ml-auto text-xs text-slate-400">{review.date}</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed italic">
                                    "{review.text}"
                                </p>
                                <div className="mt-4 flex items-center gap-1.5 opacity-50">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="h-4 w-4" />
                                    <span className="text-[10px] font-medium text-slate-500">Avaliação verificada</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
