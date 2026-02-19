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
    | "promo";

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
