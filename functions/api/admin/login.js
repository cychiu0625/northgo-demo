import { json, readJson } from "../../_lib/json.js";
import {
  issueSession,
  passwordsMatch,
  sessionCookie
} from "../../_lib/auth.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await readJson(request);
  if (!body) return json({ error: "invalid json" }, 400);

  const password = String(body.password || "");
  if (!(await passwordsMatch(env, password))) {
    return json({ error: "invalid credentials" }, 401);
  }

  try {
    const token = await issueSession(env);
    const secure = new URL(request.url).protocol === "https:";
    return json(
      { ok: true },
      200,
      { "set-cookie": sessionCookie(token, secure) }
    );
  } catch (err) {
    return json({ error: "server misconfigured" }, 503);
  }
}
