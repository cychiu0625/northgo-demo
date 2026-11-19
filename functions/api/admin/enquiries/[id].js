import { json, readJson } from "../../../_lib/json.js";
import { requireAdmin } from "../../../_lib/auth.js";
import { getEnquiry, validateEnquiryInput } from "../../../_lib/enquiries.js";

export async function onRequestGet(context) {
  const { request, env, params } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const row = await getEnquiry(env.DB, params.id);
  if (!row) return json({ error: "not found" }, 404);
  return json({ item: row });
}

export async function onRequestPatch(context) {
  const { request, env, params } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const body = await readJson(request);
  if (!body) return json({ error: "invalid json" }, 400);

  const existing = await getEnquiry(env.DB, params.id);
  if (!existing) return json({ error: "not found" }, 404);

  const parsed = validateEnquiryInput(body, true);
  if (!parsed.ok) return json({ error: "validation", fields: parsed.errors }, 400);

  const next = Object.assign({}, existing, parsed.value);

  await env.DB.prepare(
    `UPDATE enquiries
     SET name = ?, email = ?, service = ?, message = ?, lang = ?, status = ?, note = ?
     WHERE id = ?`
  )
    .bind(
      next.name,
      next.email,
      next.service,
      next.message,
      next.lang,
      next.status,
      next.note || "",
      params.id
    )
    .run();

  return json({ item: await getEnquiry(env.DB, params.id) });
}

export async function onRequestPut(context) {
  return onRequestPatch(context);
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
