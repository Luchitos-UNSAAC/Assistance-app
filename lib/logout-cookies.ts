"use server"

import {cookies} from "next/headers";

export const LogoutCookies = async () => {
  try {
    const cookieStore = cookies()
    const userEmail = cookieStore.get("userEmail")?.value
    if (userEmail) {
      cookieStore.delete('userEmail');
    }
  } catch (e) {
    console.error("[ERROR_LOGOUT_COOKIES]", e);
  }
}
