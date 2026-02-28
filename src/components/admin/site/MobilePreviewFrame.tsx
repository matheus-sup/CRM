"use client";

import { useEffect, useRef } from "react";
import { PageBlock } from "@/types/page-builder";

interface MobilePreviewFrameProps {
    activeConfig: any;
    blocks: PageBlock[];
    footerBlocks: any[];
    footerBottomBlocks: any[];
    previewPage: string;
    products: any[];
    categories: any[];
    brands: any[];
    menus: any[];
    banners: any[];
    deliveryCategories: any[];
    onBlockClick?: (blockId: string) => void;
    onSectionClick?: (section: string) => void;
}

export function MobilePreviewFrame({
    activeConfig,
    blocks,
    footerBlocks,
    footerBottomBlocks,
    previewPage,
    products,
    categories,
    brands,
    menus,
    banners,
    deliveryCategories,
    onBlockClick,
    onSectionClick,
}: MobilePreviewFrameProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const iframeReadyRef = useRef(false);
    const iframeSrc = useRef(`/admin/editor/preview?t=${Date.now()}`);

    // Keep latest data in refs so the message handler always has current values
    const dataRef = useRef({ activeConfig, blocks, footerBlocks, footerBottomBlocks, previewPage, products, categories, brands, menus, banners, deliveryCategories });
    dataRef.current = { activeConfig, blocks, footerBlocks, footerBottomBlocks, previewPage, products, categories, brands, menus, banners, deliveryCategories };

    const callbacksRef = useRef({ onBlockClick, onSectionClick });
    callbacksRef.current = { onBlockClick, onSectionClick };

    const sendToIframe = (type: string, payload: any) => {
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow) return;
        iframe.contentWindow.postMessage({ type, payload }, window.location.origin);
    };

    // Listen for iframe messages (ready signal + click forwarding)
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const msg = event.data;
            if (!msg?.type) return;

            if (msg.type === "preview-ready") {
                iframeReadyRef.current = true;
                const d = dataRef.current;
                sendToIframe("preview-init", {
                    config: d.activeConfig,
                    blocks: d.blocks,
                    footerBlocks: d.footerBlocks,
                    footerBottomBlocks: d.footerBottomBlocks,
                    previewPage: d.previewPage,
                    products: d.products,
                    categories: d.categories,
                    brands: d.brands,
                    menus: d.menus,
                    banners: d.banners,
                    deliveryCategories: d.deliveryCategories,
                });
            }

            if (msg.type === "preview-block-click" && msg.blockId) {
                callbacksRef.current.onBlockClick?.(msg.blockId);
            }

            if (msg.type === "preview-section-click" && msg.section) {
                callbacksRef.current.onSectionClick?.(msg.section);
            }
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    // Send updates when dynamic data changes
    useEffect(() => {
        if (!iframeReadyRef.current) return;
        sendToIframe("preview-update", {
            config: activeConfig,
            blocks,
            footerBlocks,
            footerBottomBlocks,
            previewPage,
        });
    }, [activeConfig, blocks, footerBlocks, footerBottomBlocks, previewPage]);

    return (
        <iframe
            ref={iframeRef}
            src={iframeSrc.current}
            className="w-full h-full border-0"
            title="Mobile Preview"
        />
    );
}
