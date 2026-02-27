"use server";

// Função de registro simplificada - sem dependências externas
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

  return {
    success: true,
    message: "DEBUG OK! Email: " + email,
  };
}
