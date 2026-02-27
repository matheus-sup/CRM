import { NextResponse } from "next/server";

// Endpoint de debug para verificar se deploy está funcionando
export async function GET() {
    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "2024-02-27-v2", // Mude esse valor para verificar se o deploy atualizou
        message: "Se você vê essa mensagem, o servidor está rodando código novo"
    });
}
