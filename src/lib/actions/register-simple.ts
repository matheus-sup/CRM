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

  if (!name || !email || !password) {
    return { success: false, message: "Preencha todos os campos obrigatórios." };
  }

  if (password.length < 6) {
    return { success: false, message: "A senha deve ter pelo menos 6 caracteres." };
  }

  try {
    // Verifica se tem assinatura ativa
    const userPlan = await prisma.userPlan.findUnique({
      where: { email }
    });

    if (!userPlan || !userPlan.isActive) {
      return {
        success: false,
        message: "É necessário adquirir um plano antes de criar sua conta.",
        requiresSubscription: true,
        redirectTo: "/landing/planos"
      };
    }

    // Verifica se usuário já existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, message: "Este email já está cadastrado." };
    }

    const hashedPassword = await hash(password, 12);
    const verificationToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Cria usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(), // Já verifica automaticamente por enquanto
        verificationToken,
        verificationTokenExpiry: tokenExpiry,
      },
    });

    // Vincula ao UserPlan
    await prisma.userPlan.update({
      where: { email },
      data: { userId: user.id }
    });

    return {
      success: true,
      message: "Conta criada com sucesso! Você já pode fazer login.",
    };

  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, message: "Erro ao criar conta: " + (error.message || "Tente novamente.") };
  }
}
