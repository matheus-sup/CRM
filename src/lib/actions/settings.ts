"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==============================================================================
// READ ACTIONS
// ==============================================================================

/**
 * Returns the LIVE configuration. Used by the storefront.
 */
export async function getStoreConfig() {
    const config = await prisma.storeConfig.upsert({
        where: { id: "store-config" },
        update: {},
        create: {
            id: "store-config",
            storeName: "Gut Cosméticos",
            themeColor: "#db2777"
        }
    });

    return config;
}

/**
 * Returns the DRAFT configuration. Used by the CMS/Editor.
 * If draft doesn't exist, it clones the LIVE config.
 */
export async function getDraftStoreConfig() {
    let draft = await prisma.storeConfig.findUnique({
        where: { id: "store-config-draft" }
    });

    if (!draft) {
        // Clone from Live
        const live = await getStoreConfig();
        const { id, createdAt, updatedAt, ...dataToClone } = live;

        // Try to create, if fails gracefully recover (upsert logic somewhat manual here because we need dynamic defaults)
        try {
            draft = await prisma.storeConfig.create({
                data: {
                    ...dataToClone,
                    id: "store-config-draft"
                }
            });
        } catch (e) {
            // Race condition hit: just fetch it again
            draft = await prisma.storeConfig.findUniqueOrThrow({
                where: { id: "store-config-draft" }
            });
        }
    }

    return draft;
}

// ==============================================================================
// WRITE ACTIONS
// ==============================================================================

/**
 * Updates the DRAFT configuration.
 */
export async function updateStoreConfig(prevState: any, formData: FormData) {
    try {
        const data: any = {};

        console.log("DEBUG: updateStoreConfig called. Form keys:", Array.from(formData.keys()));

        const addIfPresent = (key: string) => {
            if (formData.has(key)) data[key] = formData.get(key) as string;
        };

        // Identity
        addIfPresent("storeName");
        addIfPresent("description");
        addIfPresent("logoUrl");
        addIfPresent("bannerUrl");
        addIfPresent("cnpj");
        addIfPresent("legalName");

        // Colors
        addIfPresent("themeColor");
        addIfPresent("accentColor");
        addIfPresent("priceColor");
        addIfPresent("secondaryColor");
        addIfPresent("backgroundColor");
        addIfPresent("bodyColor");
        addIfPresent("sectionTitleColor");

        // Specific Buttons
        addIfPresent("headerBtnBg");
        addIfPresent("headerBtnText");
        addIfPresent("productBtnBg");
        addIfPresent("productBtnText");

        addIfPresent("headingColor");
        addIfPresent("headerColor");
        addIfPresent("menuColor");

        // Fonts
        addIfPresent("bodyFont");
        addIfPresent("headingFont");
        addIfPresent("menuFont");

        // Sizes
        addIfPresent("bodyFontSize");
        addIfPresent("headingFontSize");
        addIfPresent("menuFontSize");

        // Header Specifics
        addIfPresent("cartCountBg");
        addIfPresent("cartCountText");
        addIfPresent("searchBtnBg");
        addIfPresent("searchBtnBg");
        addIfPresent("searchIconColor");

        // Contact Info
        addIfPresent("whatsapp");
        addIfPresent("phone");
        addIfPresent("email");
        addIfPresent("address");
        addIfPresent("mapUrl");

        // Social Media
        addIfPresent("instagram");
        addIfPresent("facebook");
        addIfPresent("youtube");
        addIfPresent("tiktok");
        addIfPresent("twitter");
        addIfPresent("pinterest");

        // Footer Colors
        addIfPresent("footerBg");
        addIfPresent("footerText");

        // Analytics
        addIfPresent("facebookPixelId");
        addIfPresent("googleTagId");

        // Booleans
        const addBoolIfPresent = (key: string) => {
            if (formData.has(key)) {
                data[key] = formData.get(key) === "true";
            }
        };

        addBoolIfPresent("footerLogo");
        addBoolIfPresent("newsletterEnabled");
        addBoolIfPresent("showPaymentMethods");
        addBoolIfPresent("showSocialIcons");

        // Product List Config
        addIfPresent("categoryDefaultImage");
        addIfPresent("paginationType"); // String

        // Int fields
        const addIntIfPresent = (key: string) => {
            if (formData.has(key)) {
                data[key] = parseInt(formData.get(key) as string, 10);
            }
        };
        addIntIfPresent("mobileColumns");
        addIntIfPresent("desktopColumns");

        // Boolean features
        addBoolIfPresent("showInstallments");
        addBoolIfPresent("enableQuickBuy");
        addBoolIfPresent("showColorVariations");
        addBoolIfPresent("showHoverImage");
        addBoolIfPresent("showCardCarousel");
        addBoolIfPresent("showLowStockWarning");

        // Product Detail Config
        addBoolIfPresent("showProductSold");
        addBoolIfPresent("showPromoPrice");
        addBoolIfPresent("showDiscountPayment");
        addBoolIfPresent("showInstallmentsDetail");
        addBoolIfPresent("showVariations");
        addBoolIfPresent("showMeasurements");
        addBoolIfPresent("showSKU");
        addBoolIfPresent("showStockQuantity");
        addBoolIfPresent("showShippingSimulator");
        addBoolIfPresent("showBuyInfo");
        addBoolIfPresent("showRelatedProducts");

        // Cart Config
        addBoolIfPresent("enableQuickCart");
        addBoolIfPresent("showCartRecommendations");
        addBoolIfPresent("showShippingCalculator");
        addIfPresent("cartAction");

        if (formData.has("minPurchaseValue")) {
            data["minPurchaseValue"] = parseFloat(formData.get("minPurchaseValue") as string);
        }

        if (Object.keys(data).length === 0) {
            return { success: true, message: "Nada para atualizar." };
        }

        // ALWAYS UPDATE DRAFT
        await prisma.storeConfig.update({
            where: { id: "store-config-draft" },
            data
        });

        revalidatePath("/admin/site");

        return { success: true, message: "Rascunho salvo!" };
    } catch (error) {
        console.error("Erro ao salvar rascunho:", error);
        return { success: false, message: "Erro ao salvar rascunho." };
    }
}

/**
 * Publishes the DRAFT configuration to LIVE.
 */
export async function publishStoreConfig() {
    try {
        let draft = await prisma.storeConfig.findUnique({ where: { id: "store-config-draft" } });

        // If no draft exists, create one from Live (even though it means no changes to publish, it fixes the error)
        if (!draft) {
            draft = await getDraftStoreConfig();
        }

        // Exclude internal fields
        const { id, createdAt, updatedAt, ...dataToPublish } = draft;

        console.log("DEBUG: Publishing Data:", dataToPublish);

        await prisma.storeConfig.update({
            where: { id: "store-config" }, // LIVE ID
            data: dataToPublish
        });

        revalidatePath("/", "layout"); // Force layout refresh
        revalidatePath("/(shop)", "layout"); // Just in case route group needs it

        return { success: true, message: "Loja publicada com sucesso!" };

    } catch (error) {
        console.error("Erro ao publicar:", error);
        return { success: false, message: "Erro ao publicar." };
    }
}

/**
 * Discards the DRAFT and resets it to match LIVE.
 */
export async function discardDraft() {
    try {
        const live = await getStoreConfig();
        if (!live) return { success: false, message: "Erro ao buscar versão publicada." };

        const { id, createdAt, updatedAt, ...dataToClone } = live;

        // Start fresh draft
        await prisma.storeConfig.upsert({
            where: { id: "store-config-draft" },
            create: {
                ...dataToClone,
                id: "store-config-draft"
            },
            update: dataToClone
        });

        revalidatePath("/admin/site");
        return { success: true, message: "Alterações descartadas. Voltamos para a versão publicada." };
    } catch (error) {
        console.error("Erro ao descartar:", error);
        return { success: false, message: "Erro ao descartar alterações." };
    }
}

/**
 * Saves the draft configuration from a JSON object (used by the Visual Editor).
 */
export async function saveDraftConfig(data: any) {
    try {
        // Remove ID/Dates to avoid conflicts
        const { id, createdAt, updatedAt, ...cleanData } = data;

        // Ensure decimals are handled
        if (cleanData.minPurchaseValue) cleanData.minPurchaseValue = Number(cleanData.minPurchaseValue);

        await prisma.storeConfig.update({
            where: { id: "store-config-draft" },
            data: cleanData
        });

        revalidatePath("/admin/site");
        return { success: true, message: "Rascunho salvo com sucesso!" };
    } catch (error) {
        console.error("Erro ao salvar rascunho JSON:", error);
        return { success: false, message: "Erro ao salvar rascunho." };
    }
}
