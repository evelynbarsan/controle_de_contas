import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId  : number;
  nome    : string;
  email   : string;
  loggedIn: boolean;
}

const sessionOptions: SessionOptions = {
  cookieName: "cc_session",
  password  : process.env.APP_SECRET as string,
  cookieOptions: {
    secure  : process.env.NODE_ENV === "production",
    httpOnly: true,                // inacessível ao JavaScript do browser
    sameSite: "lax",               // proteção contra CSRF
    maxAge  : 60 * 60 * 8,        // 8 horas
    path    : "/",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
