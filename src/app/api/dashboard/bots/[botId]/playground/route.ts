import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();

    // Get the botId from the URL
    // Example pathname: /api/dashboard/bots/123/playground
    const { pathname } = req.nextUrl;
    const pathParts = pathname.split("/");

    // Assuming your route is /api/dashboard/bots/[botId]/playground
    // botId should be at index 4 (0-based): ['', 'api', 'dashboard', 'bots', botId, 'playground']
    const botId = pathParts[4];

    if (!botId || !ObjectId.isValid(botId)) {
      return NextResponse.json({ error: "Invalid botId" }, { status: 400 });
    }

    const bot = await db.collection("bots").findOne({
      _id: new ObjectId(botId),
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const dataset = await db
      .collection("datasets")
      .find({ botId: new ObjectId(botId) })
      .toArray();

    let model = null;
    if (bot.modelId) {
      model = await db.collection("model").findOne({
        _id: new ObjectId(bot.modelId),
      });
    }

    return NextResponse.json({ bot, dataset, model });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load playground info", details: String(err) },
      { status: 500 }
    );
  }
}
