"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Local interface to avoid build errors if Prisma Client isn't generated yet
interface Banner {
    id: string;
    imageUrl: string;
    mobileUrl?: string | null;
    link?: string | null;
    label?: string | null;
}

export function HeroBanner({ banners }: { banners: Banner[] }) {
    const [current, setCurrent] = useState(0);

    // Auto-play
    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 5000); // 5 seconds
        return () => clearInterval(timer);
    }, [banners.length]);

    if (!banners || banners.length === 0) {
        return null; // Or a placeholder if preferred
    }

    const next = () => setCurrent((curr) => (curr + 1) % banners.length);
    const prev = () => setCurrent((curr) => (curr === 0 ? banners.length - 1 : curr - 1));

    return (
        <section className="relative w-full overflow-hidden bg-muted/20">
            {/* Aspect Ratio Container: 21:9 for desktop, higher for mobile */}
            <div className="relative aspect-video md:aspect-21/9 lg:aspect-3/1 w-full">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
                            }`}
                    >
                        <Link href={banner.link || "#"} className="block w-full h-full relative">
                            {/* Desktop Image */}
                            <img
                                src={banner.imageUrl}
                                alt={banner.label || "Banner"}
                                className={`w-full h-full object-cover hidden md:block`}
                            />
                            {/* Mobile Image (Fallback to Desktop if missing) */}
                            <img
                                src={banner.mobileUrl || banner.imageUrl}
                                alt={banner.label || "Banner"}
                                className={`w-full h-full object-cover md:hidden`}
                            />
                        </Link>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            {banners.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/50 hover:bg-background text-foreground backdrop-blur-sm"
                        onClick={prev}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/50 hover:bg-background text-foreground backdrop-blur-sm"
                        onClick={next}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`h-2 w-2 rounded-full transition-all ${idx === current ? "bg-primary w-6" : "bg-background/70 hover:bg-background"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
