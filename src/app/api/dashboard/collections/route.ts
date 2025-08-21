import { NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';


interface JwtPayloadWithId {
    id: string;
    [key: string]: any;
  }
export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const db = await getDB();
    const bots = await db.collection('bots').find({ userId: new ObjectId(payload.id) }).toArray();
    const datasets = await db.collection('datasets').find({ userId: new ObjectId(payload.id) }).toArray();
    // Group datasets by botId
    const datasetsByBot: Record<string, any[]> = {};
    for (const ds of datasets) {
      const botId = ds.botId?.toString();
      if (!botId) continue;
      if (!datasetsByBot[botId]) datasetsByBot[botId] = [];
      datasetsByBot[botId].push(ds);
    }
    // Attach datasets to each bot
    const botsWithDatasets = bots.map((bot: any) => ({
      ...bot,
      id: bot._id.toString(),
      datasets: datasetsByBot[bot._id.toString()] || [],
    }));
    return NextResponse.json({ bots: botsWithDatasets });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}



export async function POST(req: Request) {
    try {
      // Get userId from JWT token
      const cookieStore = cookies();
      const token = (await cookieStore).get('token')?.value;
      if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const payload = verifyToken(token) as JwtPayloadWithId | null;
      if (!payload || typeof payload !== 'object' || !payload.id) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      const userId = payload.id;
  
      const formData = await req.formData();
      const file = formData.get('file');
      const sourceUrl = formData.get('sourceUrl');
      const collection = formData.get('collection');

      // Extract other fields
      const bot_id:any = formData.get('bot_id');
      const modelId = formData.get('modelId');
      const modelName = formData.get('modelName');
      const instruction = formData.get('instruction');
      const type = formData.get('type');
      const createdAt = formData.get('createdAt');
     
      // Send file or sourceUrl to Python API
      let pythonData, collection_name;
      try {
        const pythonForm = new FormData();
        pythonForm.append('bot_id',bot_id); // Pass botId to python API


        if (sourceUrl && typeof sourceUrl === 'string') {
          pythonForm.append('url', sourceUrl);
          pythonForm.append('max_depth', '2');
          // Optional, or set from frontend
        } else if (file && typeof file !== 'string') {
          pythonForm.append('file', file);
        } else {
          return NextResponse.json({ error: 'Either file or sourceUrl must be provided' }, { status: 400 });
        }
        const pythonRes = await fetch('http://127.0.0.1:8000/embedding', {
          method: 'POST',
          body: pythonForm,
        });
        if (!pythonRes.ok) {
          const text = await pythonRes.text();
          console.error('Python API error:', text);
          return NextResponse.json({ error: 'Failed to process with Python API', details: text }, { status: 500 });
        }
        pythonData = await pythonRes.json();
        collection_name = pythonData.collection_name;

      } catch (err) {
        console.error('Error calling Python API:', err);
        return NextResponse.json({ error: 'Python API call failed', details: String(err) }, { status: 500 });
      }
  
      // Insert into MongoDB
      try {
        const db = await getDB();
        const datasets = db.collection('datasets');
        const scraped_urls = pythonData.scraped_urls || null;

        // 1. Insert dataset
        const datasetDoc = {
          userId: new ObjectId(userId),
          botId: bot_id ? new ObjectId(bot_id) : undefined,
          type,
          collection:collection,
          modelId: modelId ? new ObjectId(modelId.toString()) : undefined,
          instruction,
          
          urls: scraped_urls ? [scraped_urls] : [],

          status: 'active',
          createdAt: createdAt ? new Date(createdAt.toString()) : new Date(),
          collection_name,
        };
        const datasetResult = await datasets.insertOne(datasetDoc);
  
        // Populate dataset and model info for response
        const dataset = await datasets.findOne({ _id: datasetResult.insertedId });
        const models = db.collection('model');
        const model = modelId ? await models.findOne({ _id: new ObjectId(modelId.toString()) }) : null;
        return NextResponse.json({
          success: true,
          bot: {
            dataset,
          },
        });
      } catch (err) {
        console.error('MongoDB insert error:', err);
        return NextResponse.json({ error: 'MongoDB insert failed', details: String(err) }, { status: 500 });
      }
    } catch (err) {
      console.error('General server error:', err);
      return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
    }
  }
  