// Cloudflare Pages Function. Deploys with the GitHub-connected Pages project.
// Configure KEITARO_POSTBACK_URL as an encrypted Pages secret in Cloudflare.
// Public code never contains the private Keitaro postback URL or token.
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    return new Response("Forbidden", { status: 403 });
  }
  const base = env.KEITARO_POSTBACK_URL;
  if (!base) return new Response("Not configured", { status: 503 });
  let body;
  try { body = await request.json(); } catch (_) {
    return new Response("Bad request", { status: 400 });
  }
  const subid = body && body.subid;
  if (typeof subid !== "string" || !/^[a-zA-Z0-9._-]{1,128}$/.test(subid) || subid === "subid") {
    return new Response("Invalid subid", { status: 400 });
  }
  // The Keitaro postback URL can contain existing query parameters.
  let url;
  try { url = new URL(base); } catch (_) {
    return new Response("Configuration error", { status: 503 });
  }
  if (url.protocol !== "https:") return new Response("Configuration error", {status: 503});
  url.searchParams.set("subid", subid);
  url.searchParams.set("status", "lead");
  url.searchParams.set("tid", crypto.randomUUID());
  try {
    const response = await fetch(url.toString(), { method: "GET", redirect: "error" });
    if (!response.ok) {
      console.error("Keitaro postback: upstream HTTP status", response.status);
      return new Response("Upstream error", { status: 502 });
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    // Log only the error class: exception messages can contain the secret postback URL.
    console.error("Keitaro postback: fetch failed", error?.name || "UnknownError");
    return new Response("Upstream unavailable", { status: 502 });
  }
}
