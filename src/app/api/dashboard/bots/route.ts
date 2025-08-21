import { NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import cloudinary from '@/lib/cloudinary';
import streamifier from 'streamifier';

interface JwtPayloadWithId {
  id: string;
  [key: string]: any;
}
async function uploadImageToCloudinary(file: File): Promise<any> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'botprofiles',
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}
export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token) as JwtPayloadWithId | null;
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;
    const formData = await req.formData();

    const file = formData.get('file');
    const sourceUrl = formData.get('sourceUrl');
    const name = formData.get('name')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const type = formData.get('type')?.toString() || '';
    const collection = formData.get('collection')?.toString() || '';
    const vectorDb = formData.get('vectorDb')?.toString() || '';
    const modelId = formData.get('modelId')?.toString();
    const instruction = formData.get('instruction')?.toString() || '';
    const status = formData.get('status')?.toString() || '';
    const createdAt = formData.get('createdAt')?.toString();
    const image: File | null = formData.get('image') as File;

    const db = await getDB();
    const bots = db.collection('bots');
    const datasets = db.collection('datasets');
    const models = db.collection('model');

    let uploadedImage: any = null;

    if (image && typeof image !== 'string') {
      uploadedImage = await uploadImageToCloudinary(image);
    }

    const botDoc = {
      name,
      description,
      userId: new ObjectId(userId),
      modelId: modelId ? new ObjectId(modelId) : undefined,
      instruction,
      status: 'active',
      image: uploadedImage ? uploadedImage.secure_url : '',
      lastActive: new Date(),
      createdAt: new Date(),
      requests: 0,
      actions: [],
    };

    const botResult = await bots.insertOne(botDoc);
    const botId = botResult.insertedId;

    // Prepare request to Python API
    const pythonForm = new FormData();
    pythonForm.append('bot_id', botId.toString());

    if (sourceUrl && typeof sourceUrl === 'string') {
      pythonForm.append('url', sourceUrl);
      pythonForm.append('max_depth', '4');
    } else if (file && typeof file !== 'string') {
      pythonForm.append('file', file);
    } else {
      return NextResponse.json({ error: 'Either file or sourceUrl must be provided' }, { status: 400 });
    }

    // Send to Python API
    const pythonRes = await fetch('http://127.0.0.1:8000/embedding', {
      method: 'POST',
      body: pythonForm,
    });

    if (!pythonRes.ok) {
      const text = await pythonRes.text();
      console.error('Python API error:', text);
      return NextResponse.json({ error: 'Python API failed', details: text }, { status: 500 });
    }

    const pythonData = await pythonRes.json();
    const collection_name = pythonData.collection_name;
    const scraped_urls = pythonData.scraped_urls || null;

    // Save dataset
    const datasetDoc = {
      userId: new ObjectId(userId),
      description,
      botId,
      type,
      collection,
      urls: scraped_urls ? [scraped_urls] : [],
      vectorDb,
      status,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
      collection_name,
    };

    const datasetResult = await datasets.insertOne(datasetDoc);
    const dataset = await datasets.findOne({ _id: datasetResult.insertedId });
    const model = modelId ? await models.findOne({ _id: new ObjectId(modelId) }) : null;

    return NextResponse.json({
      success: true,
      bot: {
        ...botDoc,
        _id: botId,
        dataset,
        model,
      },
    });
  } catch (err: any) {
    console.error('Server error:', err);

    return NextResponse.json(
      {
        error: 'Server error',
        details:
          typeof err === 'string'
            ? err
            : err?.message || JSON.stringify(err),
      },
      { status: 500 }
    );
  }
}
export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as JwtPayloadWithId | null;

    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDB();

    // Get bots of the user
    const bots = await db.collection('bots')
      .find({ userId: new ObjectId(payload.id) })
      .toArray();

    const botIds = bots.map(bot => bot._id);
    const modelIds = bots
      .map(bot => bot.modelId)
      .filter(id => id)  // filter null or undefined
      .map(id => new ObjectId(id));

    // Get datasets related to these bots
    const datasets = await db.collection('datasets')
      .find({ botId: { $in: botIds } })
      .toArray();

    // Get all models used by these bots
    const models = await db.collection('model')
      .find({ _id: { $in: modelIds } })
      .toArray();

    // Index datasets and models for fast lookup
    const datasetsByBot: Record<string, any[]> = {};
    for (const ds of datasets) {
      const botId = ds.botId?.toString();
      if (!botId) continue;
      if (!datasetsByBot[botId]) datasetsByBot[botId] = [];
      datasetsByBot[botId].push(ds);
    }

    const modelsById: Record<string, any> = {};
    for (const model of models) {
      modelsById[model._id.toString()] = model;
    }

    // Build final bot list
    const botsWithDetails = bots.map((bot: any) => ({
      ...bot,
      id: bot._id.toString(),
      datasets: datasetsByBot[bot._id.toString()] || [],
      model: bot.modelId ? modelsById[bot.modelId.toString()] || null : null,
    }));

    return NextResponse.json({ bots: botsWithDetails });

  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}