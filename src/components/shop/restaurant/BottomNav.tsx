"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
    config?: any;
}

export function RestaurantBottomNav({ config }: BottomNavProps) {
    const pathname = usePathname();
    const themeColor = config?.themeColor || "#ef4444";

    const navItems = [
        { href: "/", label: "Início", icon: Home },
        { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
        { href: "/minha-conta", label: "Perfil", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                                isActive ? "text-current" : "text-gray-500"
                            )}
                            style={isActive ? { color: themeColor } : undefined}
                        >
                            <div className={cn(
                                "p-1.5 rounded-full transition-colors",
                                isActive && "bg-current/10"
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
