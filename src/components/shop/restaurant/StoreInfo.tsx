"use client";

import { Clock, DollarSign, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreInfoProps {
    config?: any;
    compact?: boolean;
}

export function RestaurantStoreInfo({ config, compact = false }: StoreInfoProps) {
    const themeColor = config?.themeColor || "#ef4444";
    const storeName = config?.storeName || config?.headerText || "Restaurante";
    const description = config?.storeDescription || config?.headerSubtext || "";
    const deliveryTime = config?.deliveryTime || "30-45 min";
    const minOrder = config?.minOrderValue || config?.minPurchaseValue || 0;
    const rating = config?.storeRating || null;
    const isOpen = config?.isOpen !== false;

    if (compact) {
        return (
            <div className="bg-white px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    {minOrder > 0 && (
                        <>
                            <span>Min. R$ {Number(minOrder).toFixed(2).replace(".", ",")}</span>
                            <span className="text-gray-300">•</span>
                        </>
                    )}
                    <span>{deliveryTime}</span>
                    {rating && (
                        <>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                {rating}
                            </span>
                        </>
                    )}
                </div>
                {description && (
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Store Header with Background */}
            <div
                className="relative h-32 sm:h-40 bg-gradient-to-r"
                style={{
                    background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`
                }}
            >
                {config?.bannerUrl && (
                    <img
                        src={config.bannerUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Store Logo */}
                <div className="absolute -bottom-10 left-4 sm:left-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white shadow-lg overflow-hidden border-4 border-white">
                        {config?.logoUrl ? (
                            <img
                                src={config.logoUrl}
                                alt={storeName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-3xl"
                                style={{ backgroundColor: `${themeColor}20` }}
                            >
                                🍔
                            </div>
                        )}
                    </div>
                </div>

                {/* Open/Closed Badge */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        isOpen
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                    )}>
                        {isOpen ? "Aberto" : "Fechado"}
                    </span>
                </div>
            </div>

            {/* Store Info */}
            <div className="pt-14 sm:pt-16 px-4 sm:px-6 pb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {storeName}
                </h1>

                {description && (
                    <p className="text-sm sm:text-base text-gray-500 mt-1">
                        {description}
                    </p>
                )}

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 text-sm">
                    {rating && (
                        <div className="flex items-center gap-1.5 text-gray-700">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{rating}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-4 h-4" style={{ color: themeColor }} />
                        <span>{deliveryTime}</span>
                    </div>

                    {minOrder > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <DollarSign className="w-4 h-4" style={{ color: themeColor }} />
                            <span>Min. R$ {Number(minOrder).toFixed(2).replace(".", ",")}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
