import { verifyJWT } from "@/lib/jwt";
import {headers} from "next/headers";

export async function getAuthPayload(req: Request) {
  const headersList = headers();
  const authHeader = headersList.get("authorization");
  console.log("[Authorization]", authHeader)

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("NO_TOKEN");
  }

  const token = authHeader.split(" ")[1];

  // 🔐 Verify JWT
  return await verifyJWT(token);
}
