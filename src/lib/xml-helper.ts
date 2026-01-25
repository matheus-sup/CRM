export function sanitizeXml(str: string | null | undefined): string {
    if (!str) return "";

    // Remove emojis and control characters
    // Convert special chars to XML entities
    return str
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u7f-\u9fa5]/g, "") // Remove hidden chars/some non-latin if needed
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export function formatCurrency(value: number): string {
    return value.toFixed(2) + " BRL";
}

export function wrapCData(str: string): string {
    return `<![CDATA[${str}]]>`;
}
