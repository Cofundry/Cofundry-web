'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Bot, BotIcon, Loader2, User, Volume2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useGet from '@/lib/hooks/useGet';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export default function PlaygroundPage() {
  const params = useParams();
  const botId = params?.botId;
  const { data, loading, error } = useGet({ url: `/api/dashboard/bots/${botId}/playground` }) as {
    data: { bot: any, dataset: any, model: any } | null;
    loading: boolean;
    error: any;
  };
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [datasets, setDatasets] = useState<any[]>([]);

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // Scroll on message change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (data && data.dataset) setDatasets(Array.isArray(data.dataset) ? data.dataset : [data.dataset]);
  }, [data]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{String(error)}</div>;
  if (!data) return null;

  const { bot, dataset, model } = data;

  const collectionNames = datasets.map(ds => ds.collection_name).filter(Boolean);

const handleSend = async () => {
  if (!input.trim() || sending) return;

  const userMessage = { role: 'user' as const, content: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput('');
  setSending(true);
try {
  const contextRes = await fetch('http://127.0.0.1:8000/get-context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: bot.userId,
      bot_id: bot._id || bot.id,
      question: userMessage.content,
      collections: collectionNames,
      top_k: 5,
    }),
  });
    const instruction=bot.instruction || 'No specific instructions provided.';
  const contextData = await contextRes.json();
  const { docs, meta } = contextData;

  const contextChunks = docs.map((doc: string, i: number) => {
    const url = meta[i]?.url || 'No URL';
    const image = meta[i]?.images
      ? `🖼️ Image:\n![Image](${meta[i].images})`
      : '';
    return `${doc}\n${image}\n🔗 Source: ${url}`;
  });

  const context = contextChunks.join('\n---\n');

  const historyText = [...messages, userMessage]
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');
const prompt = `
You are a smart, fast-thinking virtual assistant.

## OBJECTIVE
Answer the user's question clearly and helpfully using ONLY the provided **Context** and **Conversation History**.  
Do not use any information outside the given context.

---

## RESPONSE GUIDELINES
- Use information strictly from the provided context.
- If the context contains URLs or images related to your answer, include them naturally.
  - Format images as: 🖼️ Image:\n![Image](image_url)
  - Format URLs as clickable text.
- If information is missing, politely inform the user and suggest where they might find it.
- Keep answers concise, direct, and complete.
- Respond in the user's language.
- Do not mention any internal processes, tools, or system details.
- Use appropriate currency or units if specified in the context or instructions.

---

## TONE AND STYLE
- Friendly, warm, and professional.
- Clear and easy to understand.
- If clarification is needed, ask politely.

---

## AVAILABLE TOOLS
${bot.actions.map((action:any) => `- **${action.name}**: ${action.description}`).join('\n')}

---

## SPECIAL INSTRUCTIONS
${instruction}

---

## CONTEXT
${context}

---

## CONVERSATION HISTORY
${historyText}

---

## USER QUESTION
${userMessage.content}

---

## RESPONSE:
`.trim();


  // === STREAMING FETCH ===
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      botId:bot._id || bot.id,
      apiKey: model.apiKey,
      provider: model.provider,
      model: model.model,
      headers: model.headers,
      actions:bot.actions,
      prompt,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error('No response body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let botMessage = '';
  let firstChunk = true;

  setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    botMessage += chunk;

    if (firstChunk) {
      setSending(false);
      firstChunk = false;
    }

    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { role: 'assistant', content: botMessage };
      return updated;
    });
  }

  // Save chat history
  await fetch('/api/dashboard/chatlogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      botId: bot._id || bot.id,
      chatHistory: [...messages, userMessage, { role: 'assistant', content: botMessage }],
    }),
  });
} catch (err) {
  console.error(err);
  setMessages((prev) => [
    ...prev,
    { role: 'assistant' as const, content: 'Error during bot operation.' },
  ]);
}


  setSending(false);
};


  function renderMessageContent(content: string) {
    // Use marked to parse markdown and DOMPurify to sanitize
    const html = String(marked(content));
    return <span className="break-words whitespace-pre-line animate-stream" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
  }

  // Helper to strip Markdown links and images for TTS
  function stripMarkdownLinksAndImages(markdown: string): string {
    // Remove images: ![alt](url)
    let text = markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
    // Remove links but keep text: [text](url) => text
    text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
    // Remove raw URLs
    text = text.replace(/https?:\/\/\S+/g, '');
    return text;
  }

function speak(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any current speech

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;

    // Define a function to set the voice and speak
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (voice) =>
          voice.lang.startsWith('en') &&
          voice.name.toLowerCase().includes('english')
      );

      if (englishVoice) {
        utter.voice = englishVoice;
      }

      window.speechSynthesis.speak(utter);
    };

    // If voices are already loaded, use them immediately
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      setVoiceAndSpeak();
    } else {
      // Wait for voices to be loaded, then speak
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
      };
    }
  }
}


  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full ">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-muted/40 p-0 overflow-hidden">
        <div className="mb-4">
          <div className="h-[450px] overflow-y-auto p-4 bg-muted/40 rounded" ref={scrollRef}>
            {/* Elegant Bot Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center justify-center bg-primary/10 rounded-full p-2">
                 {bot.image && (
                  <img src={bot.image} alt={bot.name} className="w-7 h-7 rounded-full object-cover" />
                )}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{bot?.name}</h1>
            </div>
            <div className="border-b border-muted mb-8" />
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground">Start the conversation!</div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0 relative">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                        {bot.image ?   (
                  <img src={bot.image} alt={bot.name} className="w-7 h-7 rounded-full object-cover" />
                ):(                    <Bot className="w-4 h-4 text-primary-foreground" />
)}
                      {/* Voice icon at top right of assistant message */}
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-blue-100 transition"
                        title="Read aloud"
                        onClick={() => speak(stripMarkdownLinksAndImages(msg.content))}
                      >
                        <Volume2 className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  )}
                  <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                    <div className={`rounded-xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-white'}`}>
                      {msg.role === 'assistant' ? renderMessageContent(msg.content) : <span className="break-words whitespace-pre-line">{msg.content}</span>}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center flex-shrink-0 order-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                           {bot.image ?   (
                  <img src={bot.image} alt={bot.name} className="w-7 h-7 rounded-full object-cover" />
                ):(                    <Bot className="w-4 h-4 text-primary-foreground" />
)}
                  </div>
                  <div className="max-w-[70%]">
                    <div className="rounded-xl px-3 py-2 text-sm bg-white">
                      <span className="italic text-muted-foreground flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 mr-1 inline-block" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        { bot.name} is typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <form
            className="flex items-center gap-2 border-t p-4 bg-card"
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              className="flex-1 border border-gray-200 px-4 py-3 text-base rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 bg-white placeholder:text-gray-400 transition-all duration-150"
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={sending}
              autoFocus
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition disabled:opacity-50"
              disabled={sending || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 



