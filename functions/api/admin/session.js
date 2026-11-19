import { json } from "../../_lib/json.js";
import { requireAdmin } from "../../_lib/auth.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const ok = await requireAdmin(request, env);
  if (!ok) return json({ ok: false }, 401);
  return json({ ok: true });
}
