import { json, readJson } from "../../../_lib/json.js";
import { requireAdmin } from "../../../_lib/auth.js";
import {
  ENQUIRY_STATUSES,
  getEnquiry,
  validateEnquiryInput
} from "../../../_lib/enquiries.js";

export async function onRequestGet(context) {
  const { request, env, params } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const row = await getEnquiry(env.DB, params.id);
  if (!row) return json({ error: "not found" }, 404);
  return json({ item: row });
}

/**
 * U＝更新：只改 status、note，不改客戶原文。
 * 路徑 /api/admin/enquiries/:id；若 body 帶 id 必須與路徑一致，避免改到別筆。
 */
export async function onRequestPatch(context) {
  const { request, env, params } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const body = await readJson(request);
  if (!body) return json({ error: "invalid json" }, 400);

  const pathId = String(params.id || "");
  if (
    Object.prototype.hasOwnProperty.call(body, "id") &&
    String(body.id || "") !== pathId
  ) {
    return json({ error: "id mismatch" }, 400);
  }

  const existing = await getEnquiry(env.DB, pathId);
  if (!existing) return json({ error: "not found" }, 404);

  let status = existing.status;
  let note = existing.note || "";

  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    let next = String(body.status || "").trim();
    const legacy = { new: "新進", read: "處理中", done: "已回覆" };
    if (legacy[next]) next = legacy[next];
    if (ENQUIRY_STATUSES.indexOf(next) < 0) {
      return json({ error: "validation", fields: ["status"] }, 400);
    }
    status = next;
  }

  if (Object.prototype.hasOwnProperty.call(body, "note")) {
    note = String(body.note || "").slice(0, 2000);
  }

  const result = await env.DB.prepare(
    `UPDATE enquiries
     SET status = ?, note = ?
     WHERE id = ? AND deleted_at IS NULL`
  )
    .bind(status, note, pathId)
    .run();

  if (!result.meta || result.meta.changes === 0) {
    return json({ error: "not found" }, 404);
  }

  return json({ item: await getEnquiry(env.DB, pathId) });
}

/** U（完整）：後台可改詢問全文 + 狀態／備註。 */
export async function onRequestPut(context) {
  const { request, env, params } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const body = await readJson(request);
  if (!body) return json({ error: "invalid json" }, 400);

  const existing = await getEnquiry(env.DB, params.id);
  if (!existing) return json({ error: "not found" }, 404);

  const parsed = validateEnquiryInput(
    Object.assign({}, existing, body, {
      status: body.status != null ? body.status : existing.status,
      note: body.note != null ? body.note : existing.note
    }),
    false
  );
  if (!parsed.ok) return json({ error: "validation", fields: parsed.errors }, 400);

  const v = parsed.value;
  const result = await env.DB.prepare(
    `UPDATE enquiries SET
      given_name = ?, family_name = ?, company = ?, email = ?, phone = ?,
      country = ?, services = ?, message = ?, ship_date = ?,
      status = ?, note = ?, lang = ?
     WHERE id = ? AND deleted_at IS NULL`
  )
    .bind(
      v.given_name,
      v.family_name || "",
      v.company || "",
      v.email,
      v.phone || "",
      v.country || "",
      v.services || "",
      v.message || "",
      v.ship_date || "",
      v.status || existing.status,
      v.note != null ? v.note : existing.note || "",
      v.lang || existing.lang || "zh-tw",
      params.id
    )
    .run();

  if (!result.meta || result.meta.changes === 0) {
    return json({ error: "not found" }, 404);
  }

  return json({ item: await getEnquiry(env.DB, params.id) });
}

/**
 * D＝刪除（軟刪）：寫入 deleted_at，不從資料表抹掉列。
 * 清單 GET 預設 deleted_at IS NULL，故確認後清單看不到這筆。需已登入。
 */
export async function onRequestDelete(context) {
  const { request, env, params } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const result = await env.DB.prepare(
    `UPDATE enquiries SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL`
  )
    .bind(new Date().toISOString(), params.id)
    .run();

  if (!result.meta || result.meta.changes === 0) return json({ error: "not found" }, 404);
  return json({ ok: true, soft_deleted: true });
}
