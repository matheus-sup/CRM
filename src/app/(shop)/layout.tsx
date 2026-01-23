import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { TopBar } from "@/components/shop/TopBar";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { ChatWidget } from "@/components/shop/ChatWidget";
import { CartSheet } from "@/components/shop/CartSheet";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <CategoryNav />
            <main className="flex-1 bg-muted/20">
                {children}
            </main>
            <ChatWidget />
            <CartSheet />
            <Footer />
        </div>
    );
}
