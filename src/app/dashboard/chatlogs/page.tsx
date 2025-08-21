"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, User, Loader2, Trash2, Volume2, Info, Smile, Meh, Frown } from "lucide-react"
import useGet from "@/lib/hooks/useGet"
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface SentimentMessage extends ChatMessage {
  sentiment: "positive" | "neutral" | "negative"
  score: number
}

interface ChatLog {
  id: string
  userId: string
  botId: string
  botName: string
  chatHistory: ChatMessage[]
  createdAt: Date
}

interface SentimentLog {
  _id: string
  botId: string
  botName: string
  overallSentiment: string
  createdAt: string
  messages: SentimentMessage[]
}

export default function ChatlogsPage() {
  const { data, loading, error } = useGet({ url: "/api/dashboard/chatlogs" }) as {
    data: { chatlogs: any[] } | null
    loading: boolean
    error: any
  }

  const [chatlogs, setChatlogs] = useState<ChatLog[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sentimentLog, setSentimentLog] = useState<SentimentLog | null>(null)
  const [loadingSentiment, setLoadingSentiment] = useState(false)

  // Load chatlogs normally
  useEffect(() => {
    if (data && data.chatlogs) {
      const logs = data.chatlogs.map((log: any) => ({
        id: log._id,
        userId: log.userId,
        botId: log.botId,
        botName: log.botName || 'Unknown Bot',
        chatHistory: log.chatHistory || [],
        createdAt: log.createdAt ? new Date(log.createdAt) : new Date(),
      }))
      setChatlogs(logs)
      if (logs.length > 0 && !selectedId) setSelectedId(logs[0].id)
    }
  }, [data])

  // Fetch sentiment for selected chatlog
  useEffect(() => {
    if (!selectedId) return
    const fetchSentiment = async () => {
      setLoadingSentiment(true)
      try {
        const res = await fetch("http://127.0.0.1:8000/sentiment-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatlogs: chatlogs
              .filter(c => c.id === selectedId)
              .map(c => ({
                _id: c.id,
                botId: c.botId,
                botName: c.botName,
                createdAt: c.createdAt.toISOString(),
                chatHistory: c.chatHistory
              }))
          }),
        })
        const json = await res.json()
        if (json.status === "success" && json.results.length > 0) {
          setSentimentLog(json.results[0])
        } else {
          setSentimentLog(null)
          toast.error("Failed to analyze sentiment")
        }
      } catch {
        setSentimentLog(null)
        toast.error("Failed to analyze sentiment")
      }
      setLoadingSentiment(false)
    }
    fetchSentiment()
  }, [selectedId, chatlogs])

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
  if (error) return <div className="p-8 text-center text-red-500">Error loading chat logs.</div>
  if (!chatlogs || chatlogs.length === 0) return <div className="p-8 text-center">No chat logs found.</div>

  // Use sentimentLog if available, fallback to original chatHistory without sentiments
  const selectedLog:any = sentimentLog || chatlogs.find((log) => log.id === selectedId)

  function renderMessageContent(content: string) {
    let html = ''
    try {
      // @ts-ignore
      html = marked(content)
    } catch {
      html = content
    }
    return <span className="break-words whitespace-pre-line" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
  }

  function stripMarkdownLinksAndImages(markdown: string): string {
    let text = markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    text = text.replace(/https?:\/\/\S+/g, '')
    return text
  }

  function speak(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utter = new window.SpeechSynthesisUtterance(text)
      utter.rate = 1
      utter.pitch = 1
      window.speechSynthesis.speak(utter)
    }
  }

  
  // Type guard to check if selectedLog is a SentimentLog
  function isSentimentLog(log: any): log is SentimentLog {
    return log && Array.isArray(log.messages);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center bg-primary/10 rounded-full p-2">
          {/* Use MessageSquare icon */}
          <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4.28 1.07A1 1 0 013 19.07V17.6c0-.29.13-.56.35-.74A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Chat Logs</h1>
      </div>
      <div className="border-b border-muted mb-8" />
      <div className="flex items-center mb-4">
        <Button
          variant="destructive"
          size="sm"
          className="ml-auto"
          disabled={loading || !chatlogs || chatlogs.length === 0}
          onClick={async () => {
            if (!window.confirm('Delete ALL chatlogs? This cannot be undone.')) return;
            const res = await fetch('/api/dashboard/chatlogs?all=true', { method: 'DELETE' });
            if (res.ok) {
              setChatlogs([]);
              setSelectedId(null);
              setSentimentLog(null);
              toast.success('All chatlogs deleted.');
            } else {
              toast.error('Failed to delete all chatlogs.');
            }
          }}
        >
          Delete All Chatlogs
        </Button>
      </div>
      <div className=" mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sidebar: Sessions List */}
        <div className="col-span-1 pr-2">
          <h2 className="text-base font-semibold mb-3">Sessions</h2>
          <ScrollArea className="h-[70vh]">
            <div className="space-y-1">
              {chatlogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded-lg cursor-pointer transition-colors text-sm flex flex-col gap-0.5 relative ${selectedId === log.id ? 'bg-primary/10' : 'hover:bg-muted'}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="truncate font-medium flex-1"
                      onClick={() => setSelectedId(log.id)}
                    >
                      {log.botName}
                    </span>
                    <Badge variant="secondary" className="ml-auto text-xs">{String(log.botId)}</Badge>
                    <button
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Delete chatlog"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm('Delete this chatlog?')) return;
                        const res = await fetch(`/api/dashboard/chatlogs?id=${log.id}`, { method: 'DELETE' });
                        if (res.ok) {
                          setChatlogs((prev) => prev.filter((c) => c.id !== log.id));
                          if (selectedId === log.id) setSelectedId(null);
                          setSentimentLog(null);
                          toast.success('Chatlog deleted.');
                        } else {
                          toast.error('Failed to delete chatlog.');
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{log.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        {/* Main: Conversation */}
        <div className="col-span-2">
          {selectedLog ? (
            <div className="rounded-xl bg-card">
              <div className="p-4">
                <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="font-semibold text-base flex items-center gap-2">
                      <span className="truncate">{selectedLog.botName}</span>
                      <Badge variant="secondary" className="text-xs">{String(selectedLog.botId)}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>Created: {selectedLog.createdAt instanceof Date ? selectedLog.createdAt.toLocaleDateString() : new Date(selectedLog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {loadingSentiment ? (
                    <Badge><Info className="w-3 h-3 mr-1" />Analyzing...</Badge>
                  ) : sentimentLog ? (
                    <Badge  className={
                      "flex items-center gap-1 " +
                      (selectedLog.overallSentiment === "positive"
                        ? "bg-gray-100 text-green-700 border border-green-200"
                        : selectedLog.overallSentiment === "neutral"
                        ? "bg-gray-100 text-gray-600 border border-gray-300"
                        : selectedLog.overallSentiment === "negative"
                        ? "bg-gray-100 text-red-700 border border-red-200"
                        : "bg-gray-100 text-gray-600 border border-gray-300")
                    }>
                      {selectedLog.overallSentiment === "positive" && <Smile className="w-3 h-3 text-green-600" />}
                      {selectedLog.overallSentiment === "neutral" && <Meh className="w-3 h-3 text-yellow-500" />}
                      {selectedLog.overallSentiment === "negative" && <Frown className="w-3 h-3 text-red-600" />}
                      Overall client sentiment: {selectedLog.overallSentiment}
                    </Badge>
                  ) : null}
                </div>
                <ScrollArea className="h-[60vh] rounded-lg p-3 bg-muted/40">
                  <div className="space-y-3">
                    {(isSentimentLog(selectedLog) ? selectedLog.messages : (selectedLog as ChatLog).chatHistory).map((msg, idx) => {
                      // If sentimentLog present, messages have sentiment; otherwise fallback
                      const sentiment = (msg as SentimentMessage).sentiment || null
                      const score = (msg as SentimentMessage).score || 0
                      return (
                        <div
                          key={idx}
                          className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.role === "assistant" && (
                            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0 relative">
                              <Bot className="w-4 h-4 text-primary-foreground" />
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
                          <div className={`max-w-[70%] ${msg.role === "user" ? "order-2" : ""}`}>
                            <div
                              className={`rounded-xl px-3 py-2 text-sm ${
                                msg.role === "user"
                                  ? "bg-muted text-foreground ml-auto"
                                  : "bg-gray-100 text-foreground"
                              }`}
                            >
                              {msg.role === 'assistant' ? renderMessageContent(msg.content) : <span className="break-words whitespace-pre-line">{msg.content}</span>}
                            </div>
                            {/* Sentiment badge for each message (only if sentiment available) */}
                            {sentiment && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant={
                                        sentiment === "positive" ? "default" :
                                        sentiment === "neutral" ? "secondary" :
                                        "destructive"
                                      }
                                      className={`mt-1 text-xs flex items-center gap-1 ${msg.role === "user" ? "self-end" : ""} ` +
                                        (sentiment === "positive"
                                          ? "bg-gray-100 text-green-700 border border-green-200"
                                          : sentiment === "neutral"
                                          ? "bg-gray-100 text-gray-600 border border-gray-300"
                                          : sentiment === "negative"
                                          ? "bg-gray-100 text-red-700 border border-red-200"
                                          : "bg-gray-100 text-gray-600 border border-gray-300")
                                      }
                                    >
                                      {sentiment === "positive" && <Smile className="w-3 h-3 text-green-600" />}
                                      {sentiment === "neutral" && <Meh className="w-3 h-3 text-yellow-500" />}
                                      {sentiment === "negative" && <Frown className="w-3 h-3 text-red-600" />}
                                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Sentiment score: {(score * 100).toFixed(1)}%
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          {msg.role === "user" && (
                            <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center flex-shrink-0 order-3">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">Select a session to view conversation.</div>
          )}
        </div>
      </div>
    </div>
  )
}
