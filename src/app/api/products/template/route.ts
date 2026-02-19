import { PRODUCT_CSV_HEADERS, generateCsv } from "@/lib/csv-helper";

export async function GET() {
    const csv = generateCsv([], PRODUCT_CSV_HEADERS);

    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": "attachment; filename=modelo-importacao-produtos.csv",
        },
    });
}
