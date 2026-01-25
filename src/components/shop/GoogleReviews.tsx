import { Star, MapPin } from "lucide-react";
import Image from "next/image";

export function GoogleReviews() {
    const reviews = [
        {
            id: 1,
            author: "Maria Silva",
            avatar: null, // Placeholder will generate initial
            rating: 5,
            text: "Amei os produtos! Chegaram super rápido e a qualidade é incrível. O batom dura o dia todo!",
            time: "há 2 dias"
        },
        {
            id: 2,
            author: "Ana Julia",
            avatar: null,
            rating: 5,
            text: "Melhor loja de makes da cidade. O atendimento é nota 10 e sempre tem novidades.",
            time: "há 1 semana"
        },
        {
            id: 3,
            author: "Fernanda Costa",
            avatar: null,
            rating: 4,
            text: "Gostei muito da base, cobriu super bem. Só a entrega que atrasou um pouquinho, mas valeu a pena.",
            time: "há 3 semanas"
        },
        {
            id: 4,
            author: "Luiza Melo",
            avatar: null,
            rating: 5,
            text: "Produtos originais e com precinho ótimo. Recomendo demais!",
            time: "há 1 mês"
        }
    ];

    return (
        <section className="bg-card py-16 border-y border-dashed border-border" style={{ backgroundColor: 'var(--background)' }}>
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-card p-2 rounded-lg shadow-sm border">
                            {/* Google Logo Mock */}
                            <div className="w-8 h-8 relative">
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground leading-tight">Gut Cosméticos & Makes</h2>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <span className="font-bold text-primary">4.9</span>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-3 h-3 text-primary fill-primary" />
                                    ))}
                                </div>
                                <span>(128 avaliações)</span>
                            </div>
                        </div>
                    </div>

                    <Button variant="outline" className="gap-2 rounded-full border-border" asChild>
                        <a href="https://google.com/maps" target="_blank" rel="noopener noreferrer">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            Avaliar no Google
                        </a>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-card border border-border p-5 rounded-2xl relative shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                    {review.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{review.author}</p>
                                    <p className="text-[10px] text-muted-foreground">{review.time}</p>
                                </div>
                            </div>
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < review.rating ? "text-primary fill-primary" : "text-muted"}`}
                                    />
                                ))}
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                "{review.text}"
                            </p>

                            {/* Google Icon Watermark */}
                            <div className="absolute top-4 right-4 opacity-5">
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
                                    <path fill="currentColor" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="currentColor" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="currentColor" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="currentColor" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

import { Button } from "@/components/ui/button";
