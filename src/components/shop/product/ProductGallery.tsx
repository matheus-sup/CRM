"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProductGalleryProps {
    images: { url: string; alt: string | null }[];
    productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    // Placeholder if no images
    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                <span className="text-4xl font-bold">{productName.charAt(0)}</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="relative aspect-square overflow-hidden rounded-xl border bg-white shadow-sm cursor-zoom-in group">
                        <img
                            src={images[selectedImage].url}
                            alt={images[selectedImage].alt || productName}
                            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                            <span className="bg-white/90 text-slate-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                Ampliar
                            </span>
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-[80vw] w-[80vw] h-[80vh] p-0 bg-white border-none shadow-2xl flex overflow-hidden rounded-lg gap-0 focus:outline-none">

                    {/* Left Side: Thumbnails */}
                    {images.length > 1 && (
                        <div className="hidden md:flex w-24 flex-col gap-2 p-3 border-r bg-slate-50 overflow-y-auto">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={cn(
                                        "relative aspect-square w-full overflow-hidden rounded-md border-2 bg-white transition-all flex-shrink-0",
                                        selectedImage === index
                                            ? "border-primary ring-2 ring-primary/20"
                                            : "border-slate-200 hover:border-primary/50 opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.alt || `Preview ${index}`}
                                        className="h-full w-full object-contain p-1"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Right Side: Main Image & Content */}
                    <div className="flex-1 flex flex-col relative bg-white min-w-0">

                        {/* Main Image Area - Takes up ALL space */}
                        <div className="w-full h-full relative flex items-center justify-center p-1 bg-white overflow-hidden">

                            {/* Close button overlay */}
                            <DialogClose className="absolute top-3 right-3 rounded-full p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-800 transition-colors cursor-pointer shadow-lg z-30 border border-slate-200">
                                <X className="h-5 w-5" />
                            </DialogClose>
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-full shadow-lg z-20 transition-all border border-slate-200"
                                    >
                                        <ChevronLeft className="h-7 w-7" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-full shadow-lg z-20 transition-all border border-slate-200"
                                    >
                                        <ChevronRight className="h-7 w-7" />
                                    </button>
                                </>
                            )}

                            <img
                                src={images[selectedImage].url}
                                alt={images[selectedImage].alt || productName}
                                className="w-full h-full object-contain select-none"
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>


        </div>
    );
}
