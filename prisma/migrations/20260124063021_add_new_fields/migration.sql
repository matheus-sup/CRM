-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "copyright" TEXT,
    "altText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT,
    "imageUrl" TEXT NOT NULL,
    "mobileUrl" TEXT,
    "link" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "menuId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "type" TEXT NOT NULL DEFAULT 'custom',
    "referenceId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("createdAt", "description", "id", "imageUrl", "name", "slug", "updatedAt") SELECT "createdAt", "description", "id", "imageUrl", "name", "slug", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" INTEGER NOT NULL,
    "customerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL NOT NULL,
    "paymentMethod" TEXT,
    "origin" TEXT NOT NULL DEFAULT 'ONLINE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("code", "createdAt", "customerId", "id", "paymentMethod", "status", "total", "updatedAt") SELECT "code", "createdAt", "customerId", "id", "paymentMethod", "status", "total", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "price" DECIMAL NOT NULL,
    "compareAtPrice" DECIMAL,
    "costPerItem" DECIMAL,
    "sku" TEXT,
    "barcode" TEXT,
    "trackQuantity" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "weight" DECIMAL,
    "length" DECIMAL,
    "width" DECIMAL,
    "height" DECIMAL,
    "expiresAt" DATETIME,
    "brand" TEXT,
    "tags" TEXT,
    "videoUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("barcode", "brand", "categoryId", "compareAtPrice", "costPerItem", "createdAt", "description", "expiresAt", "height", "id", "length", "name", "price", "seoDescription", "seoTitle", "sku", "slug", "status", "stock", "tags", "trackQuantity", "updatedAt", "videoUrl", "weight", "width") SELECT "barcode", "brand", "categoryId", "compareAtPrice", "costPerItem", "createdAt", "description", "expiresAt", "height", "id", "length", "name", "price", "seoDescription", "seoTitle", "sku", "slug", "status", "stock", "tags", "trackQuantity", "updatedAt", "videoUrl", "weight", "width" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE TABLE "new_StoreConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'store-config',
    "storeName" TEXT NOT NULL DEFAULT 'Gut Cosméticos & Makes',
    "description" TEXT,
    "bannerUrl" TEXT,
    "logoUrl" TEXT,
    "themeColor" TEXT NOT NULL DEFAULT '#db2777',
    "secondaryColor" TEXT NOT NULL DEFAULT '#fce7f3',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "menuColor" TEXT NOT NULL DEFAULT '#334155',
    "menuFont" TEXT NOT NULL DEFAULT 'Inter',
    "menuFontSize" TEXT NOT NULL DEFAULT '14px',
    "headerColor" TEXT NOT NULL DEFAULT '#ffffff',
    "cartCountBg" TEXT NOT NULL DEFAULT '#22c55e',
    "cartCountText" TEXT NOT NULL DEFAULT '#ffffff',
    "searchBtnBg" TEXT NOT NULL DEFAULT '#db2777',
    "searchIconColor" TEXT NOT NULL DEFAULT '#ffffff',
    "headingColor" TEXT NOT NULL DEFAULT '#111827',
    "headingFont" TEXT NOT NULL DEFAULT 'Inter',
    "headingFontSize" TEXT NOT NULL DEFAULT '2rem',
    "bodyColor" TEXT NOT NULL DEFAULT '#334155',
    "bodyFont" TEXT NOT NULL DEFAULT 'Inter',
    "bodyFontSize" TEXT NOT NULL DEFAULT '1rem',
    "textColor" TEXT NOT NULL DEFAULT '#334155',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "instagram" TEXT,
    "instagramToken" TEXT,
    "facebook" TEXT,
    "youtube" TEXT,
    "tiktok" TEXT,
    "twitter" TEXT,
    "pinterest" TEXT,
    "pinterestTag" TEXT,
    "whatsapp" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "mapUrl" TEXT,
    "footerBg" TEXT NOT NULL DEFAULT '#171717',
    "footerText" TEXT NOT NULL DEFAULT '#a3a3a3',
    "footerLogo" BOOLEAN NOT NULL DEFAULT true,
    "newsletterEnabled" BOOLEAN NOT NULL DEFAULT true,
    "showPaymentMethods" BOOLEAN NOT NULL DEFAULT true,
    "showSocialIcons" BOOLEAN NOT NULL DEFAULT true,
    "categoryDefaultImage" TEXT,
    "mobileColumns" INTEGER NOT NULL DEFAULT 2,
    "desktopColumns" INTEGER NOT NULL DEFAULT 4,
    "paginationType" TEXT NOT NULL DEFAULT 'infinite',
    "showInstallments" BOOLEAN NOT NULL DEFAULT true,
    "enableQuickBuy" BOOLEAN NOT NULL DEFAULT true,
    "showColorVariations" BOOLEAN NOT NULL DEFAULT false,
    "showHoverImage" BOOLEAN NOT NULL DEFAULT true,
    "showCardCarousel" BOOLEAN NOT NULL DEFAULT false,
    "showLowStockWarning" BOOLEAN NOT NULL DEFAULT true,
    "showProductSold" BOOLEAN NOT NULL DEFAULT true,
    "showPromoPrice" BOOLEAN NOT NULL DEFAULT true,
    "showDiscountPayment" BOOLEAN NOT NULL DEFAULT true,
    "showInstallmentsDetail" BOOLEAN NOT NULL DEFAULT true,
    "showVariations" BOOLEAN NOT NULL DEFAULT true,
    "showMeasurements" BOOLEAN NOT NULL DEFAULT false,
    "showSKU" BOOLEAN NOT NULL DEFAULT true,
    "showStockQuantity" BOOLEAN NOT NULL DEFAULT true,
    "showShippingSimulator" BOOLEAN NOT NULL DEFAULT true,
    "showBuyInfo" BOOLEAN NOT NULL DEFAULT true,
    "showRelatedProducts" BOOLEAN NOT NULL DEFAULT true,
    "minPurchaseValue" DECIMAL NOT NULL DEFAULT 0.00,
    "enableQuickCart" BOOLEAN NOT NULL DEFAULT true,
    "cartAction" TEXT NOT NULL DEFAULT 'notification',
    "showCartRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "showShippingCalculator" BOOLEAN NOT NULL DEFAULT true,
    "homeLayout" TEXT NOT NULL DEFAULT '[{"id":"hero","label":"Banners Rotativos","enabled":true},{"id":"new-arrivals","label":"Produtos Novos","enabled":true},{"id":"testimonials","label":"Depoimentos","enabled":true},{"id":"instagram","label":"Instagram","enabled":true}]',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT DEFAULT 'Estamos reformando a loja e está ficando incrível. Volte em alguns dias.',
    "maintenancePassword" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_StoreConfig" ("bannerUrl", "createdAt", "description", "id", "instagram", "logoUrl", "storeName", "themeColor", "updatedAt", "whatsapp") SELECT "bannerUrl", "createdAt", "description", "id", "instagram", "logoUrl", "storeName", "themeColor", "updatedAt", "whatsapp" FROM "StoreConfig";
DROP TABLE "StoreConfig";
ALTER TABLE "new_StoreConfig" RENAME TO "StoreConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_handle_key" ON "Menu"("handle");
