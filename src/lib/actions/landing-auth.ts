"use server";

import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5001";
const CRM_SESSION = "crm_session";

// Generate a random token
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Register new CRM user
export async function registerCrmUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const company = formData.get("company") as string;
  const phone = formData.get("phone") as string;

  if (!name || !email || !password) {
    return { success: false, message: "Preencha todos os campos obrigatórios." };
  }

  if (password.length < 6) {
    return { success: false, message: "A senha deve ter pelo menos 6 caracteres." };
  }

  try {
    // Check if email has active subscription (local database only - no external API call)
    const userPlan = await prisma.userPlan.findUnique({
      where: { email }
    });

    if (!userPlan || !userPlan.isActive) {
      return {
        success: false,
        message: "É necessário adquirir um plano antes de criar sua conta. Realize o pagamento e tente novamente.",
        requiresSubscription: true,
        redirectTo: "/landing/planos"
      };
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, message: "Este email já está cadastrado." };
    }

    const hashedPassword = await hash(password, 12);
    const verificationToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with verification token
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: null,
        verificationToken,
        verificationTokenExpiry: tokenExpiry,
      },
    });

    // Link user to their UserPlan
    await prisma.userPlan.update({
      where: { email },
      data: { userId: user.id }
    });

    // Send verification email
    const verificationUrl = `${APP_URL}/landing/verificar-email?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: "NA Automation <noreply@automacao.art>",
        to: email,
        subject: "Confirme seu email - NA Automation",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <tr>
                <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #5BB5E0 0%, #4AA5D0 100%);">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                    <span style="color: #000;">N</span><span style="color: #fff;">A</span> Automation
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Olá, ${name}!</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Bem-vindo ao NA Automation! Para começar a usar sua conta, confirme seu email clicando no botão abaixo:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: center; padding: 30px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background-color: #5BB5E0; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 50px;">
                          Confirmar Email
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    Este link expira em 24 horas. Se você não solicitou esta conta, ignore este email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">
                    © 2026 NA Automation. Todos os direitos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail registration if email fails - user can request new verification
    }

    return {
      success: true,
      message: "Conta criada! Verifique seu email para ativar sua conta.",
      requiresVerification: true,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Erro ao criar conta. Tente novamente." };
  }
}

// Login CRM user
export async function loginCrmUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email e senha são obrigatórios." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return { success: false, message: "Email ou senha incorretos." };
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return { success: false, message: "Email ou senha incorretos." };
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        success: false,
        message: "Por favor, verifique seu email antes de fazer login.",
        requiresVerification: true,
        email: user.email,
      };
    }

    // Set session cookie
    (await cookies()).set(CRM_SESSION, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { success: true, redirectTo: "/admin" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Erro ao fazer login. Tente novamente." };
  }
}

// Verify email
export async function verifyEmail(token: string) {
  if (!token) {
    return { success: false, message: "Token inválido." };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return { success: false, message: "Token inválido ou expirado." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return { success: true, message: "Email verificado com sucesso! Você já pode fazer login." };
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, message: "Erro ao verificar email." };
  }
}

// Request password reset
export async function requestPasswordReset(email: string) {
  if (!email) {
    return { success: false, message: "Email é obrigatório." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true, message: "Se este email estiver cadastrado, você receberá um link de recuperação." };
    }

    const resetToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: tokenExpiry,
      },
    });

    const resetUrl = `${APP_URL}/landing/redefinir-senha?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: "NA Automation <noreply@automacao.art>",
        to: email,
        subject: "Redefinir senha - NA Automation",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <tr>
                <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #5BB5E0 0%, #4AA5D0 100%);">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                    <span style="color: #000;">N</span><span style="color: #fff;">A</span> Automation
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Redefinir Senha</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: center; padding: 30px 0;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background-color: #5BB5E0; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 50px;">
                          Redefinir Senha
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    Este link expira em 1 hora. Se você não solicitou esta redefinição, ignore este email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">
                    © 2026 NA Automation. Todos os direitos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error("Error sending reset email:", emailError);
    }

    return { success: true, message: "Se este email estiver cadastrado, você receberá um link de recuperação." };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { success: false, message: "Erro ao solicitar redefinição de senha." };
  }
}

// Reset password with token
export async function resetPassword(token: string, newPassword: string) {
  if (!token || !newPassword) {
    return { success: false, message: "Dados inválidos." };
  }

  if (newPassword.length < 6) {
    return { success: false, message: "A senha deve ter pelo menos 6 caracteres." };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return { success: false, message: "Token inválido ou expirado." };
    }

    const hashedPassword = await hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { success: true, message: "Senha redefinida com sucesso! Você já pode fazer login." };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, message: "Erro ao redefinir senha." };
  }
}

// Resend verification email
export async function resendVerificationEmail(email: string) {
  if (!email) {
    return { success: false, message: "Email é obrigatório." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: true, message: "Se este email estiver cadastrado, você receberá um novo link." };
    }

    if (user.emailVerified) {
      return { success: false, message: "Este email já foi verificado. Faça login." };
    }

    const verificationToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry: tokenExpiry,
      },
    });

    const verificationUrl = `${APP_URL}/landing/verificar-email?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: "NA Automation <noreply@automacao.art>",
        to: email,
        subject: "Confirme seu email - NA Automation",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <tr>
                <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #5BB5E0 0%, #4AA5D0 100%);">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                    <span style="color: #000;">N</span><span style="color: #fff;">A</span> Automation
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Olá, ${user.name}!</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Para ativar sua conta, confirme seu email clicando no botão abaixo:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: center; padding: 30px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background-color: #5BB5E0; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 50px;">
                          Confirmar Email
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    Este link expira em 24 horas.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">
                    © 2026 NA Automation. Todos os direitos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error("Error resending email:", emailError);
    }

    return { success: true, message: "Email de verificação reenviado!" };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { success: false, message: "Erro ao reenviar email." };
  }
}

// Logout
export async function logoutCrmUser() {
  (await cookies()).delete(CRM_SESSION);
  return { success: true };
}

// Get current CRM user
export async function getCurrentCrmUser() {
  const sessionId = (await cookies()).get(CRM_SESSION)?.value;
  if (!sessionId) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: sessionId },
      select: { id: true, name: true, email: true, role: true },
    });
  } catch {
    return null;
  }
}
