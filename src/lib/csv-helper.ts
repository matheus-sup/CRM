export function generateCsv(rows: any[], headers: string[]): string {
    const headerRow = headers.join(";") + "\\n";
    const dataRows = rows.map(row => {
        return headers.map(header => {
            const val = row[header] ?? "";
            // Escape semi-colons and quotes
            if (typeof val === "string" && (val.includes(";") || val.includes('"') || val.includes("\\n"))) {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(";");
    }).join("\\n");

    return headerRow + dataRows;
}

export function parseCsv(content: string): any[] {
    const lines = content.split(/\\r?\\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) return [];

    const headers = lines[0].split(";").map(h => h.trim().replace(/^"|"$/g, ""));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(";");
        const row: any = {};

        headers.forEach((header, index) => {
            let val = values[index]?.trim() || "";
            // Remove wrapping quotes if present
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1).replace(/""/g, '"');
            }
            row[header] = val;
        });

        if (Object.keys(row).length > 0) {
            data.push(row);
        }
    }

    return data;
}

export const PRODUCT_CSV_HEADERS = [
    "name",
    "description",
    "price",
    "stock",
    "sku",
    "barcode",
    "costPerItem"
];

export const PRODUCT_CSV_DISPLAY_HEADERS = {
    name: "Nome do Produto",
    description: "Descrição",
    price: "Preço (Venda)",
    stock: "Estoque",
    sku: "SKU (Código Interno)",
    barcode: "Código de Barras (EAN)",
    costPerItem: "Custo (R$)"
};
