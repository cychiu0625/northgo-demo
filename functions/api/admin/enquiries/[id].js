import { json, readJson } from "../../../_lib/json.js";
import { requireAdmin } from "../../../_lib/auth.js";

export async function onRequestGet(context) {
  const { request, env, params } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const row = await env.DB.prepare(
    `SELECT id, created_at, name, email, service, message, lang, status, note
     FROM enquiries WHERE id = ?`
  )
    .bind(params.id)
    .first();

  if (!row) return json({ error: "not found" }, 404);
  return json({ item: row });
}

export async function onRequestPatch(context) {
  const { request, env, params } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const body = await readJson(request);
  if (!body) return json({ error: "invalid json" }, 400);

  const existing = await env.DB.prepare("SELECT id, status, note FROM enquiries WHERE id = ?")
    .bind(params.id)
    .first();
  if (!existing) return json({ error: "not found" }, 404);

  let status = existing.status;
  let note = existing.note;
  if (typeof body.status === "string") {
    if (["new", "read", "done"].indexOf(body.status) < 0) {
      return json({ error: "invalid status" }, 400);
    }
    status = body.status;
  }
  if (typeof body.note === "string") {
    note = body.note.slice(0, 2000);
  }

  await env.DB.prepare("UPDATE enquiries SET status = ?, note = ? WHERE id = ?")
    .bind(status, note, params.id)
    .run();

  const item = await env.DB.prepare(
    `SELECT id, created_at, name, email, service, message, lang, status, note
     FROM enquiries WHERE id = ?`
  )
    .bind(params.id)
    .first();

  return json({ item });
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const result = await env.DB.prepare("DELETE FROM enquiries WHERE id = ?")
    .bind(params.id)
    .run();

  if (!result.meta || result.meta.changes === 0) return json({ error: "not found" }, 404);
  return json({ ok: true });
}
