import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

interface JwtPayloadWithId {
  id: string;
  [key: string]: any;
}

export async function PATCH(req: NextRequest) {
  try {
     const url = new URL(req.url);
    const pathnameParts = url.pathname.split('/');
    const botId = pathnameParts[pathnameParts.length - 1];
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as JwtPayloadWithId | null;
    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;
    const db = await getDB();
    const bots = db.collection('bots');
    const datasets = db.collection('datasets');
    const body = await req.json();
    const updateFields: any = {};

    if (body.name) updateFields.name = body.name;
    if (body.description) updateFields.description = body.description;
    if (body.status) updateFields.status = body.status;
    if (body.instruction) updateFields.instruction = body.instruction;
    if (body.modelId) updateFields.modelId = new ObjectId(body.modelId);
    if (body.actions) updateFields.actions = body.actions;

    if (body.datasetIds && body.collection) {
      await datasets.updateMany(
        {
          _id: { $in: body.datasetIds.map((id: string) => new ObjectId(id)) },
          userId: new ObjectId(userId),
        },
        { $set: { collection: body.collection } }
      );
      return NextResponse.json({ success: true, updated: body.datasetIds.length });
    }

    if (body.datasetIds) {
      updateFields.datasetIds = body.datasetIds.map((id: string) => new ObjectId(id));
    }

    const result = await bots.updateOne(
      { _id: new ObjectId(botId), userId: new ObjectId(userId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Bot not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update bot', details: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const botId = req.nextUrl.pathname.split("/").at(-2);
    if (!botId || !ObjectId.isValid(botId)) {
      return NextResponse.json({ error: "Invalid botId" }, { status: 400 });
    }

    const isDatasets = req.nextUrl.searchParams.get("datasets") === "true";
    if (!isDatasets) {
      return NextResponse.json({ message: "Default GET handler - no datasets param" });
    }

    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token) as JwtPayloadWithId | null;
    if (!payload || typeof payload !== "object" || !payload.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.id;
    const db = await getDB();
    const bots = db.collection("bots");
    const datasets = db.collection("datasets");

    const bot = await bots.findOne({
      _id: new ObjectId(botId),
      userId: new ObjectId(userId),
    });

    if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404 });

    const datasetObjs = await datasets
      .find({ _id: { $in: bot.datasetIds || [] } })
      .toArray();

    return NextResponse.json({ datasets: datasetObjs });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process request", details: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const pathnameParts = url.pathname.split('/');
    const botId = pathnameParts[pathnameParts.length - 1];
  const isDatasetUpload = url.searchParams.get('datasets') === 'true';

  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token) as JwtPayloadWithId | null;
  if (!payload || typeof payload !== 'object' || !payload.id) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = new ObjectId(payload.id);
  const db = await getDB();
  const bots = db.collection('bots');
  const datasets = db.collection('datasets');

  if (isDatasetUpload) {
    try {
      const bot = await bots.findOne({ _id: new ObjectId(botId), userId });
      if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });

      const contentType = req.headers.get('content-type') || '';
      let type = 'upload';
      let name = '', description = '', content, sourceUrl, collection_name;

      let datasetDoc: any = { userId, createdAt: new Date() };

      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        type = (formData.get('type') as string) || 'upload';
        name = (formData.get('name') as string) || '';
        description = (formData.get('description') as string) || '';

        if (type === 'upload') {
          const file = formData.get('file');
          if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
          }

          const pythonForm = new FormData();
          pythonForm.append('file', file);
          const pythonRes = await fetch('http://127.0.0.1:8000/embedding', {
            method: 'POST',
            body: pythonForm,
          });

          if (!pythonRes.ok) {
            const text = await pythonRes.text();
            return NextResponse.json({ error: 'Failed to process file with Python API', details: text }, { status: 500 });
          }

          const pythonData = await pythonRes.json();
          collection_name = pythonData.collection_name;
        } else if (type === 'text') {
          content = formData.get('content') as string;
          if (!content) return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
        } else if (type === 'webscrape') {
          sourceUrl = formData.get('sourceUrl') as string;
          if (!sourceUrl) return NextResponse.json({ error: 'Source URL is required' }, { status: 400 });

          const res = await fetch(sourceUrl);
          if (!res.ok) return NextResponse.json({ error: 'Failed to fetch content from URL' }, { status: 400 });
          content = await res.text();
        }
      } else {
        const body = await req.json();
        type = body.type || 'text';
        name = body.name || '';
        description = body.description || '';

        if (type === 'text') {
          content = body.content || '';
          if (!content) return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
        } else if (type === 'webscrape') {
          sourceUrl = body.sourceUrl || '';
          if (!sourceUrl) return NextResponse.json({ error: 'Source URL is required' }, { status: 400 });

          const res = await fetch(sourceUrl);
          if (!res.ok) return NextResponse.json({ error: 'Failed to fetch content from URL' }, { status: 400 });
          content = await res.text();
        }
      }

      datasetDoc = {
        ...datasetDoc,
        name,
        description,
        type,
        botId: new ObjectId(botId),
        content: type !== 'upload' ? content : undefined,
        sourceUrl,
        collection_name,
      };

      const datasetResult = await datasets.insertOne(datasetDoc);
      await bots.updateOne({ _id: new ObjectId(botId) }, { $addToSet: { datasetIds: datasetResult.insertedId } });

      return NextResponse.json({ success: true, dataset: { ...datasetDoc, _id: datasetResult.insertedId } });
    } catch (err) {
      return NextResponse.json({ error: 'Failed to upload dataset', details: String(err) }, { status: 500 });
    }
  } else {
    try {
      const body = await req.json();
      const { name, modelId, description = '' } = body;

      if (!name || !modelId) {
        return NextResponse.json({ error: 'Bot name and modelId are required' }, { status: 400 });
      }

      const newBot = {
        name,
        modelId,
        description,
        userId,
        createdAt: new Date(),
        datasetIds: [],
      };

      const botResult = await bots.insertOne(newBot);
      return NextResponse.json({ success: true, bot: { ...newBot, _id: botResult.insertedId } });
    } catch (err) {
      return NextResponse.json({ error: 'Failed to create bot', details: String(err) }, { status: 500 });
    }
  }
}

export async function DELETE(req: NextRequest) {
    const url = new URL(req.url);
    const pathnameParts = url.pathname.split('/');
    const botId = pathnameParts[pathnameParts.length - 1];  const datasetId = new URL(req.url).searchParams.get('datasetId');

  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as JwtPayloadWithId | null;
    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = new ObjectId(payload.id);
    const db = await getDB();
    const bots = db.collection('bots');
    const datasets = db.collection('datasets');

    const botObjectId = new ObjectId(botId);

    if (datasetId) {
      const datasetObjectId:any = new ObjectId(datasetId);

      await bots.updateOne(
        { _id: botObjectId, userId },
        { $pull: { datasetIds: datasetObjectId } }
      );
      await datasets.deleteOne({ _id: datasetObjectId, botId: botObjectId, userId });

      return NextResponse.json({ success: true, message: 'Dataset deleted from bot' });
    }

    const result = await bots.deleteOne({ _id: botObjectId, userId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Bot not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Bot deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error', details: String(err) }, { status: 500 });
  }
}
