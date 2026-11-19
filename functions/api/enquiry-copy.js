import { json } from "../_lib/json.js";
import { LANGS, loadCopy } from "../_lib/copy.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const url = new URL(request.url);
  let lang = url.searchParams.get("lang") || "zh-tw";
  if (LANGS.indexOf(lang) < 0) lang = "zh-tw";

  const copy = await loadCopy(env.DB, lang);
  return json({ lang, copy });
}
