import { NextResponse } from "next/server";

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";
const REFRESH_COOKIE_NAME = "TRACKIFY_REFRESH_TOKEN";

const getCookieSecure = (): boolean => {
  return (
    process.env.TRACKIFY_JWT_COOKIE_SECURE === "true" ||
    process.env.TRACKIFY_COOKIE_SECURE === "true"
  );
};

export async function POST() {
  const response = NextResponse.json({ ok: true });

  const cookieOptions = {
    httpOnly: true,
    secure: getCookieSecure(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set(ACCESS_COOKIE_NAME, "", cookieOptions);
  response.cookies.set(REFRESH_COOKIE_NAME, "", cookieOptions);

  return response;
}
