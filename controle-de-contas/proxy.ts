import { NextRequest, NextResponse } from "next/server";
import { getIronSession, type SessionOptions } from "iron-session";
import { type SessionData } from "@/lib/session";

// Rotas que não exigem autenticação
const PUBLIC_ROUTES = ["/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignora assets estáticos e rotas internas do Next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|svg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Lê a sessão do cookie (sem banco de dados — stateless)
  const res  = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, {
    cookieName: "cc_session",
    password  : process.env.APP_SECRET as string,
    cookieOptions: { secure: process.env.NODE_ENV === "production" },
  } satisfies SessionOptions);

  const loggedIn = session.loggedIn === true;

  // Usuário autenticado tentando acessar /login → manda pro dashboard
  if (loggedIn && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Usuário não autenticado tentando acessar rota protegida → manda pro login
  if (!loggedIn && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  // Aplica o middleware em todas as rotas exceto arquivos estáticos
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
