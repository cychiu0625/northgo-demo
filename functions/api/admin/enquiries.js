import { json } from "../../_lib/json.js";
import { requireAdmin } from "../../_lib/auth.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "";
  let rows;
  if (status && ["new", "read", "done"].indexOf(status) >= 0) {
    rows = await env.DB.prepare(
      `SELECT id, created_at, name, email, service, message, lang, status, note
       FROM enquiries WHERE status = ? ORDER BY created_at DESC LIMIT 200`
    )
      .bind(status)
      .all();
  } else {
    rows = await env.DB.prepare(
      `SELECT id, created_at, name, email, service, message, lang, status, note
       FROM enquiries ORDER BY created_at DESC LIMIT 200`
    ).all();
  }

  return json({ items: rows.results || [] });
}
