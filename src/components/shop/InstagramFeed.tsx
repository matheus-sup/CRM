import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import Link from "next/link";

export function InstagramFeed() {
    // Mock data to simulate the feed visual
    const posts = [
        { id: 1, image: "/assets/insta1.jpg" }, // We will handle missing images gracefully
        { id: 2, image: "/assets/insta2.jpg" },
        { id: 3, image: "/assets/insta3.jpg" },
        { id: 4, image: "/assets/insta4.jpg" },
        { id: 5, image: "/assets/insta5.jpg" },
        { id: 6, image: "/assets/insta6.jpg" },
    ];

    return (
        <section className="container mx-auto px-4 py-16">
            <div className="flex flex-col items-center justify-center mb-8 gap-2 text-center">
                <div className="bg-pink-50 p-3 rounded-full mb-2">
                    <Instagram className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">@minhaloja</h2>
                <p className="text-slate-500 max-w-md">
                    Siga nosso Instagram e fique por dentro das novidades, tutoriais de make e promoções exclusivas!
                </p>
                <Button variant="outline" className="mt-4 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8" asChild>
                    <Link href="https://instagram.com" target="_blank">Seguir</Link>
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 md:gap-2">
                {posts.map((post) => (
                    <div key={post.id} className="relative aspect-square group overflow-hidden bg-slate-100 cursor-pointer">
                        {/* Placeholder for actual image */}
                        <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-500">
                            <Instagram className="h-8 w-8 opacity-20" />
                        </div>
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Instagram className="h-8 w-8" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
