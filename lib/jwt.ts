import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function generateJWT(payload: {
  userId: string;
  email: string;
  role?: string;
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "7d")
    .sign(secret);
}

export async function verifyJWT(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as {
    userId: string;
    email: string;
    role?: string;
  };
}
