import { json } from "../../_lib/json.js";
import { clearSessionCookie } from "../../_lib/auth.js";

export async function onRequestPost(context) {
  const { request } = context;
  const secure = new URL(request.url).protocol === "https:";
  return json({ ok: true }, 200, { "set-cookie": clearSessionCookie(secure) });
}
