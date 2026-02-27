"use server";

import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function loginCrmUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Preencha email e senha." };
  }

  try {
    // Busca usuário
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        success: false,
        message: "Email não encontrado. Crie uma conta primeiro.",
        notRegistered: true
      };
    }

    // Verifica senha
    const validPassword = await compare(password, user.password || "");
    if (!validPassword) {
      return { success: false, message: "Senha incorreta." };
    }

    // Verifica se tem plano ativo
    const userPlan = await prisma.userPlan.findUnique({ where: { email } });

    if (!userPlan || !userPlan.isActive) {
      return {
        success: false,
        message: "Para utilizar o sistema, é necessário contratar um plano.\nVocê será redirecionado para escolher seu plano.",
        requiresSubscription: true,
        redirectTo: `/landing/checkout?email=${encodeURIComponent(email)}&name=${encodeURIComponent(user.name || "")}`
      };
    }

    // TODO: Implementar sessão real quando necessário
    // Por enquanto, apenas retorna sucesso - o admin já tem seu próprio sistema de auth
    return {
      success: true,
      message: "Login realizado com sucesso!",
      redirectTo: "/admin"
    };

  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, message: "Erro ao fazer login. Tente novamente." };
  }
}

export async function requestPasswordReset(email: string) {
  if (!email) {
    return { success: false, message: "Informe seu email." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Por segurança, não revelamos se o email existe
      return { success: true, message: "Se o email existir, enviaremos instruções de recuperação." };
    }

    // Verifica se tem plano ativo
    const userPlan = await prisma.userPlan.findUnique({ where: { email } });
    if (!userPlan || !userPlan.isActive) {
      return {
        success: false,
        message: "Recuperação disponível apenas para assinantes ativos."
      };
    }

    // TODO: Implementar envio de email com token de recuperação
    // Por enquanto, apenas retorna sucesso
    return {
      success: true,
      message: "Instruções de recuperação enviadas para seu email."
    };

  } catch (error: any) {
    console.error("Password reset error:", error);
    return { success: false, message: "Erro ao processar solicitação." };
  }
}

export async function resendVerificationEmail(email: string) {
  return { success: false, message: "Verificação de e-mail não é necessária no momento." };
}
