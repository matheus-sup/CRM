"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import crypto from "crypto";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function registerSimple(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string || "";
  const cpfCnpj = (formData.get("cpfCnpj") || formData.get("document")) as string || "";

  if (!name || !email || !password) {
    return { success: false, message: "Preencha todos os campos obrigatórios." };
  }

  if (password.length < 6) {
    return { success: false, message: "A senha deve ter pelo menos 6 caracteres." };
  }

  try {
    // Verifica se usuário já existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Verifica se tem plano ativo
      const userPlan = await prisma.userPlan.findUnique({ where: { email } });
      if (userPlan?.isActive) {
        return { success: false, message: "Este email já está cadastrado. Faça login." };
      }
      // Usuário existe mas não tem plano ativo - redireciona para checkout
      // Usa os dados do formulário atual (prioridade) ou do banco
      const params = new URLSearchParams();
      params.set("email", email);
      params.set("name", existing.name || name);
      const phoneToUse = phone || userPlan?.phone;
      const cpfCnpjToUse = cpfCnpj || userPlan?.cpfCnpj;
      if (phoneToUse) params.set("phone", phoneToUse);
      if (cpfCnpjToUse) params.set("cpfCnpj", cpfCnpjToUse);

      return {
        success: true,
        message: "Conta já existe!\nVocê será redirecionado para escolher seu plano.",
        requiresSubscription: true,
        redirectTo: `/landing/checkout?${params.toString()}`
      };
    }

    const hashedPassword = await hash(password, 12);
    const verificationToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Cria usuário (ainda sem plano ativo)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(),
        verificationToken,
        verificationTokenExpiry: tokenExpiry,
      },
    });

    // Cria UserPlan pendente (sem assinatura ainda)
    await prisma.userPlan.upsert({
      where: { email },
      create: {
        email,
        name,
        phone,
        cpfCnpj,
        plan: "STARTER",
        priceMonthly: 0,
        status: "PENDING",
        isActive: false,
        userId: user.id
      },
      update: {
        name,
        phone,
        cpfCnpj,
        userId: user.id
      }
    });

    // Redireciona para escolha e pagamento do plano
    const params = new URLSearchParams();
    params.set("email", email);
    params.set("name", name);
    if (phone) params.set("phone", phone);
    if (cpfCnpj) params.set("cpfCnpj", cpfCnpj);

    return {
      success: true,
      message: "Conta criada com sucesso!\nVocê será redirecionado para escolher seu plano.",
      requiresSubscription: true,
      redirectTo: `/landing/checkout?${params.toString()}`
    };

  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, message: "Erro ao criar conta: " + (error.message || "Tente novamente.") };
  }
}
