import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

// Tipos de arquivo permitidos
const ALLOWED_TYPES = [
  // Imagens
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // Documentos
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Planilhas
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  // Texto
  "text/plain",
];

// Tamanho máximo: 10MB
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const orcamentoId = formData.get("orcamentoId") as string | null;
    const categoria = (formData.get("categoria") as string) || "outros";
    const descricao = formData.get("descricao") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    if (!orcamentoId) {
      return NextResponse.json(
        { error: "ID do orçamento não informado" },
        { status: 400 }
      );
    }

    // Verificar tipo de arquivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido" },
        { status: 400 }
      );
    }

    // Verificar tamanho
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo: 10MB" },
        { status: 400 }
      );
    }

    // Verificar se orçamento existe
    const orcamento = await prisma.solarOrcamento.findUnique({
      where: { id: parseInt(orcamentoId) },
    });

    if (!orcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), "data", "uploads", "solar", orcamentoId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const safeName = file.name
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 50);
    const nomeArmazenado = `${timestamp}_${safeName}${ext}`;

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, nomeArmazenado);
    await writeFile(filePath, buffer);

    // Salvar registro no banco
    const arquivo = await prisma.solarArquivo.create({
      data: {
        nome: file.name,
        nomeArmazenado,
        tipo: file.type,
        tamanho: file.size,
        categoria,
        descricao,
        orcamentoId: parseInt(orcamentoId),
      },
    });

    return NextResponse.json({
      success: true,
      arquivo: {
        id: arquivo.id,
        nome: arquivo.nome,
        tipo: arquivo.tipo,
        tamanho: arquivo.tamanho,
        categoria: arquivo.categoria,
      },
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo" },
      { status: 500 }
    );
  }
}
