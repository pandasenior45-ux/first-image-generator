import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "@cf/black-forest-labs/flux-1-schnell";

export async function POST(request: NextRequest) {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "Server setup incomplete. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in Vercel Environment Variables." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) return NextResponse.json({ error: "Please enter an image prompt." }, { status: 400 });
    if (prompt.length > 2048) return NextResponse.json({ error: "Prompt must be 2048 characters or fewer." }, { status: 400 });

    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`;
    const cfResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, steps: 4 }),
      cache: "no-store"
    });

    const contentType = cfResponse.headers.get("content-type") || "";
    if (!cfResponse.ok) {
      let detail = "";
      try {
        const payload = await cfResponse.json();
        detail = payload?.errors?.map((item: { message?: string }) => item.message).filter(Boolean).join("; ") || payload?.message || "";
      } catch { detail = await cfResponse.text().catch(() => ""); }
      const status = cfResponse.status;
      const friendly = status === 401 || status === 403
        ? "Cloudflare rejected the API token. Check that it is a valid Workers AI API token with Workers AI Read/Write permission."
        : status === 404
        ? "Cloudflare could not find the account or model. Check your Account ID."
        : status === 429
        ? "Cloudflare rate limit or usage limit reached. Please wait and try again."
        : `Cloudflare image generation failed (${status}).`;
      return NextResponse.json({ error: detail ? `${friendly} ${detail}` : friendly }, { status: 502 });
    }

    let imageBase64 = "";
    if (contentType.includes("application/json")) {
      const payload = await cfResponse.json();
      imageBase64 = payload?.result?.image || payload?.result?.dataURI?.split(",")[1] || payload?.image || "";
    } else {
      const buffer = Buffer.from(await cfResponse.arrayBuffer());
      imageBase64 = buffer.toString("base64");
    }
    if (!imageBase64) {
      return NextResponse.json({ error: "Cloudflare responded, but no image was found in the response." }, { status: 502 });
    }

    return NextResponse.json({ image: `data:image/png;base64,${imageBase64}` });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Unexpected server error. Please try again." }, { status: 500 });
  }
}
