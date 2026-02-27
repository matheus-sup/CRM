
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlockRenderer } from "@/components/shop/pbuilder/BlockRenderer";
import { getProducts } from "@/lib/actions/product";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    const page = await prisma.page.findUnique({
        where: { slug },
    });

    if (!page) {
        return {
            title: 'Página não encontrada',
        };
    }

    return {
        title: page.title,
    };
}

export default async function DynamicPage({ params }: Props) {
    const { slug } = await params;

    const page = await prisma.page.findUnique({
        where: { slug },
    });

    if (!page || !page.published) {
        notFound();
    }

    // Fetch dependencies for blocks
    const products = await getProducts();
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { name: 'asc' },
        include: { children: true }
    });

    // Parse blocks
    let blocks = [];
    try {
        if (page.layout) {
            blocks = JSON.parse(page.layout);
        }
    } catch (e) {
        console.error("Error parsing page layout", e);
    }

    // If no blocks, but content exists (Legacy), create a text block or html block
    if (blocks.length === 0 && page.content) {
        blocks = [{
            id: 'legacy-content',
            type: 'html',
            content: { code: page.content },
            styles: {
                backgroundColor: '#ffffff',
                paddingTop: '2rem',
                paddingBottom: '2rem',
                fullWidth: false
            }
        }];
    }

    return (
        <main className="min-h-screen">
            <BlockRenderer blocks={blocks} products={products} categories={categories} />
        </main>
    );
}
