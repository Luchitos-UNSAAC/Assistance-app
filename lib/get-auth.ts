import { verifyJWT } from "@/lib/jwt";

export async function getAuthPayload(req: Request) {
  console.log("[Authorization]", req.headers.get("authorization"))
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("NO_TOKEN");
  }

  const token = authHeader.split(" ")[1];

  // 🔐 Verify JWT
  return await verifyJWT(token);
}
