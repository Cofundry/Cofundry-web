import { getDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Tool } from 'langchain/tools';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';


const encoder = new TextEncoder();

/**
 * Create an API tool for LangChain agent
 */
function createApiTool(action: {
  name: string;
  api: string;
  method: string;
  apiKey?: string;
  description: string;
  headers?: string;
}): Tool {
  return new (class extends Tool {
    name = action.name;
    description = action.description;

    async _call(input: string): Promise<string> {
      try {
        let payload: any = {};
        try {
          payload = JSON.parse(input);
        } catch {
          payload = input; // raw string input
        }

        const method = action.method.toUpperCase();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (action.apiKey) {
          const headerName = action.headers || 'Authorization';
          headers[headerName] =
            headerName.toLowerCase() === 'authorization'
              ? `Bearer ${action.apiKey}`
              : action.apiKey;
        }

        let url = action.api;
        const fetchOptions: RequestInit = { method, headers };

        if (method === 'GET') {
          if (typeof payload === 'object' && Object.keys(payload).length > 0) {
            const queryParams = new URLSearchParams(payload).toString();
            url += (url.includes('?') ? '&' : '?') + queryParams;
          }
        } else {
          fetchOptions.body =
            typeof payload === 'string' ? payload : JSON.stringify(payload);
        }

        const res = await fetch(url, fetchOptions);
        const text = await res.text();

        try {
          const json = JSON.parse(text);
          return (
            json?.response?.toString() ||
            JSON.stringify(json) ||
            '✅ Tool executed but returned no response.'
          );
        } catch {
          return text || '✅ Tool executed but returned empty text.';
        }
      } catch (err: any) {
        return `❌ Tool call failed: ${err.message || 'Unknown error'}`;
      }
    }
  })();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider, apiKey, model, botId, actions, prompt } = body;

    if (!['openai', 'google'].includes(provider)) {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    if (!apiKey || !model || !prompt) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const db = await getDB();
    if (botId) {
      db.collection('bots').updateOne(
        { _id: new ObjectId(botId) },
        { $inc: { requests: 1 } }
      );
    }

    const tools =
      Array.isArray(actions) && actions.length > 0
        ? actions.map(createApiTool)
        : [];

    let streamController: ReadableStreamDefaultController<Uint8Array> | null =
      null;
    let tokensStreamed = false;

    // Select the LLM provider
    const llm =
      provider === 'openai'
        ? new ChatOpenAI({
            modelName: model,
            temperature: 0.7,
            streaming: true,
            apiKey,
            callbacks: [
              {
                handleLLMNewToken(token: string) {
                  tokensStreamed = true;
                  streamController?.enqueue(encoder.encode(token));
                },
                handleLLMError(err: Error) {
                  streamController?.error(err);
                },
              },
            ],
          })
        : new ChatGoogleGenerativeAI({
            model: 'gemini-2.0-flash', // e.g. "gemini-pro" or "gemini-1.5-pro"
            temperature: 0.7,
            streaming: true,
            apiKey,
            callbacks: [
              {
                handleLLMNewToken(token: string) {
                  tokensStreamed = true;
                  streamController?.enqueue(encoder.encode(token));
                },
                handleLLMError(err: Error) {
                  streamController?.error(err);
                },
              },
            ],
          });

    const stream = new ReadableStream({
      async start(controller) {
        streamController = controller;

        try {
          if (tools.length > 0) {
            const executor = await initializeAgentExecutorWithOptions(tools, llm, {
              agentType:
                provider === 'openai'
                  ? 'openai-functions'
                  : 'structured-chat-zero-shot-react-description',
              returnIntermediateSteps: false,
              agentArgs: {
                prefix: `You are a helpful assistant. Use tools when needed but answer naturally.`,
              },
            });

            await executor.invoke({ input: prompt });

            if (!tokensStreamed) {
              controller.enqueue(encoder.encode('[⚠️ No tokens were streamed]'));
            }
          } else {
            await llm.invoke(prompt); // streaming handled via callbacks
          }

          controller.close();
        } catch (err: any) {
          const errorMsg = `❌ ${err.message || 'Something went wrong'}`;
          controller.enqueue(encoder.encode(errorMsg));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('POST error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
