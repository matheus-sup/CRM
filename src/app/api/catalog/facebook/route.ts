import { prisma } from "@/lib/prisma";
import { formatCurrency, sanitizeXml } from "@/lib/xml-helper";
import { getStoreConfig } from "@/lib/actions/settings";

export const dynamic = 'force-dynamic';

export async function GET() {
    const config = await getStoreConfig();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gutcosmeticosemakes.com.br"; // Fallback URL

    const products = await prisma.product.findMany({
        where: {
            status: "ACTIVE",
            price: { gt: 0 }
        },
        include: { images: true }
    });

    const xmlItems = products.map(product => {
        const image = product.images[0]?.url || config.bannerUrl || "";

        return `
        <item>
            <g:id>${product.id}</g:id>
            <g:title>${sanitizeXml(product.name)}</g:title>
            <g:description>${sanitizeXml(product.description || product.name)}</g:description>
            <g:link>${baseUrl}/produtos/${product.slug}</g:link>
            <g:image_link>${image}</g:image_link>
            <g:brand>${sanitizeXml(product.brand || config.storeName)}</g:brand>
            <g:condition>new</g:condition>
            <g:availability>${product.stock > 0 ? "in stock" : "out of stock"}</g:availability>
            <g:price>${formatCurrency(Number(product.price))}</g:price>
            <g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics</g:google_product_category>
        </item>
        `;
    }).join("\n");

    const xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
    <channel>
        <title>${sanitizeXml(config.storeName)}</title>
        <link>${baseUrl}</link>
        <description>Product Feed for Facebook/Instagram</description>
        ${xmlItems}
    </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "max-age=3600, s-maxage=3600"
        }
    });
}
