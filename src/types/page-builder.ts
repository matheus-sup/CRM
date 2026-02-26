export type BlockType =
    | "hero"
    | "text"
    | "html"
    | "product-grid"
    | "image"
    | "video"
    | "columns"
    | "spacer"
    | "instagram"
    | "map"
    | "promo"
    // Tool Blocks (Loja de Ferramentas)
    | "tool-scheduling"      // Agendamentos Online
    | "tool-menu"            // Cardápio Digital
    | "tool-delivery"        // Delivery Próprio
    | "tool-reservations"    // Reservas de Mesas
    | "tool-orders"          // Comandas Digitais
    | "tool-salon"           // Gestão de Salão
    | "tool-whatsapp-catalog"// Catálogo WhatsApp
    | "tool-quotes"          // Orçamentos Online
    | "tool-gift-cards"      // Gift Cards
    | "tool-wishlist"        // Lista de Presentes
    | "tool-subscriptions"   // Clube de Assinaturas
    | "tool-loyalty"         // Programa de Fidelidade
    | "tool-reviews"         // Avaliações
    | "tool-coupons"         // Cupons e Promoções
    | "tool-digital-showcase"// Vitrine Digital
    | "tool-social-proof"    // Prova Social
    | "tool-chat"            // Chat Online
    | "tool-tracking";       // Rastreamento de Pedidos

export interface BlockStyles {
    backgroundColor?: string;
    backgroundImage?: string;
    textColor?: string;
    paddingTop?: string; // e.g. "4rem"
    paddingBottom?: string;
    marginTop?: string;
    marginBottom?: string;
    fullWidth?: boolean;
    borderRadius?: string;
    customCss?: string; // Advanced User Feature
    textAlign?: "left" | "center" | "right";
    buttonColor?: string;
    buttonTextColor?: string;
}

export interface PageBlock {
    id: string;
    type: BlockType;
    variant?: string; // Style variant for the block (e.g., "default", "minimal", "split")
    label?: string; // internal label for admin
    content: any; // Dynamic based on type
    styles: BlockStyles;
}


// --- Block Specific Props (for content) ---

export interface HeroBlockContent {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    videoUrl?: string; // URL for video background (YouTube, Vimeo, or direct .mp4/.webm)
    buttonText?: string;
    buttonLink?: string;
    layout?: "center" | "left" | "right";
}

export interface TextBlockContent {
    html: string; // Rich text
}

export interface HtmlBlockContent {
    code: string; // Raw HTML/JS
}

export interface ProductGridContent {
    title?: string;
    collectionId?: string; // automatic
    productIds?: string[]; // manual
    limit?: number;
    columns?: number;
}

// --- Tool Block Content Types ---

export interface ToolBlockContent {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    toolSlug: string; // Reference to the tool
    config?: Record<string, unknown>; // Tool-specific configuration
}

export interface SchedulingBlockContent extends ToolBlockContent {
    showCalendar?: boolean;
    professionals?: string[]; // IDs of professionals to show
}

export interface MenuBlockContent extends ToolBlockContent {
    showCategories?: boolean;
    showSearch?: boolean;
    displayMode?: "grid" | "list";
}

export interface DeliveryBlockContent extends ToolBlockContent {
    showCart?: boolean;
    showDeliveryTime?: boolean;
}

export interface ReviewsBlockContent extends ToolBlockContent {
    limit?: number;
    showRating?: boolean;
    showPhotos?: boolean;
}

export interface LoyaltyBlockContent extends ToolBlockContent {
    showPoints?: boolean;
    showRewards?: boolean;
}

export interface ChatBlockContent extends ToolBlockContent {
    position?: "bottom-right" | "bottom-left";
    welcomeMessage?: string;
}
