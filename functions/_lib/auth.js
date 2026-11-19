const COOKIE = "ng_admin";
const MAX_AGE_SEC = 60 * 60 * 12;

function b64url(bytes) {
  let bin = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i += 1) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64url(text) {
  const pad = "=".repeat((4 - (text.length % 4)) % 4);
  const b64 = (text + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(secret, payload) {
  const key = await hmacKey(secret);
  const data = new TextEncoder().encode(payload);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  return b64url(sig);
}

export async function issueSession(env) {
  const secret = env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET missing");
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ exp, role: "admin" })));
  const sig = await sign(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySession(env, token) {
  if (!token || !env.SESSION_SECRET) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = await sign(env.SESSION_SECRET, payload);
  if (sig.length !== expected.length) return false;
  let ok = 0;
  for (let i = 0; i < sig.length; i += 1) ok |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (ok !== 0) return false;
  try {
    const raw = new TextDecoder().decode(fromB64url(payload));
    const data = JSON.parse(raw);
    if (!data || data.role !== "admin" || typeof data.exp !== "number") return false;
    return data.exp > Math.floor(Date.now() / 1000);
  } catch (err) {
    return false;
  }
}

export function readCookie(request, name = COOKIE) {
  const header = request.headers.get("cookie") || "";
  const parts = header.split(";");
  for (let i = 0; i < parts.length; i += 1) {
    const piece = parts[i].trim();
    if (piece.startsWith(name + "=")) return decodeURIComponent(piece.slice(name.length + 1));
  }
  return "";
}

export function sessionCookie(token, secure) {
  const flags = [
    `${COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE_SEC}`
  ];
  if (secure) flags.push("Secure");
  return flags.join("; ");
}

export function clearSessionCookie(secure) {
  const flags = [
    `${COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ];
  if (secure) flags.push("Secure");
  return flags.join("; ");
}

export async function requireAdmin(request, env) {
  const token = readCookie(request);
  return verifySession(env, token);
}

export async function passwordsMatch(env, password) {
  const expected = env.ADMIN_PASSWORD || "";
  if (!expected || typeof password !== "string") return false;
  const a = new TextEncoder().encode(password);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) return false;
  let ok = 0;
  for (let i = 0; i < a.length; i += 1) ok |= a[i] ^ b[i];
  return ok === 0;
}
