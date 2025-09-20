// src/app/api/contact/route.ts
export async function POST(req: Request) {
    // Read/ignore the body so adapters don’t complain.
    try { await req.json(); } catch { }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
    });
}

// Optional: pick one if you care
// export const runtime = "edge";
// export const runtime = "nodejs";
