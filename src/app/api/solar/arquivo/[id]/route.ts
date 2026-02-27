import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar arquivo no banco
    const arquivo = await prisma.solarArquivo.findUnique({
      where: { id },
    });

    if (!arquivo) {
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    // Caminho do arquivo
    const filePath = path.join(
      process.cwd(),
      "data",
      "uploads",
      "solar",
      arquivo.orcamentoId.toString(),
      arquivo.nomeArmazenado
    );

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "Arquivo não encontrado no servidor" },
        { status: 404 }
      );
    }

    // Ler e retornar o arquivo
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": arquivo.tipo,
        "Content-Disposition": `inline; filename="${arquivo.nome}"`,
        "Content-Length": arquivo.tamanho.toString(),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar arquivo:", error);
    return NextResponse.json(
      { error: "Erro ao buscar arquivo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { unlink } = await import("fs/promises");

    // Buscar arquivo no banco
    const arquivo = await prisma.solarArquivo.findUnique({
      where: { id },
    });

    if (!arquivo) {
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    // Caminho do arquivo
    const filePath = path.join(
      process.cwd(),
      "data",
      "uploads",
      "solar",
      arquivo.orcamentoId.toString(),
      arquivo.nomeArmazenado
    );

    // Deletar arquivo do sistema de arquivos
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Deletar registro do banco
    await prisma.solarArquivo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return NextResponse.json(
      { error: "Erro ao deletar arquivo" },
      { status: 500 }
    );
  }
}
