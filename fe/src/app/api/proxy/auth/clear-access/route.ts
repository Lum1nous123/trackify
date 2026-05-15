import { NextResponse } from "next/server";

const ACCESS_COOKIE_NAME = "TRACKIFY_ACCESS_TOKEN";

const getCookieSecure = (): boolean => {
  return (
    process.env.TRACKIFY_JWT_COOKIE_SECURE === "true" ||
    process.env.TRACKIFY_COOKIE_SECURE === "true"
  );
};

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: getCookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
