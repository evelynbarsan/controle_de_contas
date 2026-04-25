"use server";

import { redirect } from "next/navigation";
import bcrypt       from "bcryptjs";
import { z }        from "zod";
import { findByEmail } from "@/models/user";
import { getSession }  from "@/lib/session";

// ── Validação de entrada ───────────────────────────────────────────────────────
const LoginSchema = z.object({
  email: z
    .string()
    .email("E-mail inválido")
    .max(255)
    .transform((v) => v.toLowerCase().trim()),
  senha: z
    .string()
    .min(6, "Senha deve ter ao menos 6 caracteres")
    .max(128),
});

export type LoginState = {
  error?: string;
};

// ── Server Action — chamada pelo formulário via action= ───────────────────────
export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  // 1. Valida formato
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, senha } = parsed.data;

  // 2. Busca usuário — mensagem genérica para não revelar se o e-mail existe
  const user = await findByEmail(email);
  const GENERIC_ERROR = "E-mail ou senha inválidos";

  if (!user) {
    // Executa bcrypt mesmo sem usuário para evitar timing attack
    await bcrypt.compare(senha, "$2b$12$invalidhashinvalidhashinvalidhas");
    return { error: GENERIC_ERROR };
  }

  // 3. Verifica senha
  const valid = await bcrypt.compare(senha, user.senha_hash);
  if (!valid) return { error: GENERIC_ERROR };

  // 4. Cria sessão criptografada
  const session = await getSession();
  session.userId  = user.id;
  session.nome    = user.nome;
  session.email   = user.email;
  session.loggedIn = true;
  await session.save();

  // 5. Redireciona para dashboard
  redirect("/dashboard");
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
