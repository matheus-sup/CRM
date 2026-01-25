"use server";

import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "gut_shop_session";

export async function register(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const document = formData.get("document") as string; // CPF

    if (!name || !email || !password) {
        return { success: false, message: "Preencha todos os campos obrigatórios." };
    }

    try {
        const existing = await prisma.customer.findUnique({ where: { email } });
        if (existing) {
            return { success: false, message: "Este email já está cadastrado." };
        }

        const hashedPassword = await hash(password, 10);

        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                document
            }
        });

        // Set Login Cookie (Simple ID storage for MVP)
        // In production: Use JWT or iron-session
        (await cookies()).set(SESSION_COOKIE, customer.id, { httpOnly: true, path: "/" });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Erro ao criar conta." };
    }
}

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { success: false, message: "Email e senha são obrigatórios." };
    }

    try {
        const customer = await prisma.customer.findUnique({ where: { email } });

        if (!customer || !customer.password) {
            return { success: false, message: "Credenciais inválidas." };
        }

        const isValid = await compare(password, customer.password);
        if (!isValid) {
            return { success: false, message: "Credenciais inválidas." };
        }

        (await cookies()).set(SESSION_COOKIE, customer.id, { httpOnly: true, path: "/" });

        return { success: true };

    } catch (error) {
        console.error(error);
        return { success: false, message: "Erro ao fazer login." };
    }
}

export async function logout() {
    (await cookies()).delete(SESSION_COOKIE);
    redirect("/");
}

export async function getCurrentUser() {
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!sessionId) return null;

    return prisma.customer.findUnique({
        where: { id: sessionId },
        select: { id: true, name: true, email: true }
    });
}
