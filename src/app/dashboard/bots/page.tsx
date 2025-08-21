"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import useGet from '@/lib/hooks/useGet'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import {
  Search,
  Bot,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  Download,
  Share,
  Eye,
  MessageSquare,
  Brain,
  Zap,
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  SortAsc,
  SortDesc,
  Plug,
} from "lucide-react"

interface TrainedBot {
  id: string
  name: string
  description: string
  image?: string // Optional image URL
  status: "active" | "inactive" | "training" | "error"
  model: string
  provider: string
  personality: string
  trainingData: {
    type: "text" | "files" | "web"
    size: string
    sources: number
  }
  metrics: {
    requests: number
    messages: number
    users: number
    accuracy: number
  }
  createdAt: Date
  lastUsed?: Date
  lastTrained?: Date
  version: string
  tags: string[]
  modelId?: string
}

export default function BotsPage() {
  const router = useRouter();
  const { data, loading, error } = useGet({ url: "/api/dashboard/bots" }) as {
    data: { bots: any[] } | null;
    loading: boolean;
    error: any;
  };

  const [bots, setBots] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedBot, setSelectedBot] = useState<TrainedBot | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editBot, setEditBot] = useState<TrainedBot | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', status: 'active', modelId: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [credentials, setCredentials] = useState<any[]>([])
  const [instruction, setInstruction] = useState('')

  useEffect(() => {
    if (data && data.bots) {
      // Convert date strings to Date objects and fill missing fields for compatibility
      const botsWithDates: TrainedBot[] = data.bots.map((bot: any) => ({
        id: bot.id || bot._id,
        name: bot.name,
        image: bot.image || '',
        description: bot.description,
        status: bot.status || "active",
        model: bot.model ? bot.model.model : bot.modelId || "",
        provider: bot.model ? bot.model.provider : "",
        personality:  bot.instruction,
        trainingData: bot.dataset
          ? {
              type: bot.dataset.type || "text",
              size: "-",
              sources: 0,
            }
          : { type: "text", size: "-", sources: 0 },
        metrics: {
          requests: bot.requests || 0,
          messages: 0,
          users: 0,
          accuracy: 0,
        },
        createdAt: bot.createdAt ? new Date(bot.createdAt) : new Date(),
        lastUsed: bot.lastActive ? new Date(bot.lastActive) : undefined,
        lastTrained: undefined,
        version: "v1.0",
        tags: [],
        modelId: bot.modelId,
      }));
      setBots(botsWithDates);
    }
  }, [data]);

  // Fetch credentials for provider/model select
  useEffect(() => {
    fetch('/api/dashboard/credentials')
      .then(res => res.json())
      .then(data => setCredentials(data.credentials || []));
  }, []);

  // Filter and search logic
  const filteredAndSortedBots = useMemo(() => {
    const filtered = bots.filter((bot) => {
      const matchesSearch =
        bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.tags.some((tag:any) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === "all" || bot.status === statusFilter
      const matchesProvider = providerFilter === "all" || bot.provider === providerFilter

      return matchesSearch && matchesStatus && matchesProvider
    })

    // Sort logic
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "createdAt":
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        case "lastUsed":
          aValue = a.lastUsed?.getTime() || 0
          bValue = b.lastUsed?.getTime() || 0
          break
        case "conversations":
          aValue = a.metrics.requests
          bValue = b.metrics.requests
          break
        case "accuracy":
          aValue = a.metrics.accuracy
          bValue = b.metrics.accuracy
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [bots, searchQuery, statusFilter, providerFilter, sortBy, sortOrder])

  const getStatusIcon = (status: TrainedBot["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "inactive":
        return <AlertCircle className="w-4 h-4 text-gray-500" />
      case "training":
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: TrainedBot["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "training":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Training</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "openai":
        return <Brain className="w-4 h-4" />
      case "anthropic":
        return <Zap className="w-4 h-4" />
      case "google":
        return <Database className="w-4 h-4" />
      default:
        return <Bot className="w-4 h-4" />
    }
  }

  const handleBotAction = (action: string, bot: TrainedBot) => {
    switch (action) {
      case "activate":
        setBots((prev) => prev.map((b) => (b.id === bot.id ? { ...b, status: "active" as const } : b)))
        break
      case "deactivate":
        setBots((prev) => prev.map((b) => (b.id === bot.id ? { ...b, status: "inactive" as const } : b)))
        break
      case "delete":
        setBots((prev) => prev.filter((b) => b.id !== bot.id))
        break
      case "duplicate":
        const duplicatedBot = {
          ...bot,
          id: Date.now().toString(),
          name: `${bot.name} (Copy)`,
          status: "inactive" as const,
          createdAt: new Date(),
          lastUsed: undefined,
          metrics: { requests: 0, messages: 0, users: 0, accuracy: 0 },
        }
        setBots((prev) => [duplicatedBot, ...prev])
        break
    }
  }

  const stats = {
    total: bots.length,
    active: bots.filter((b) => b.status === "active").length,
    inactive: bots.filter((b) => b.status === "inactive").length,
    training: bots.filter((b) => b.status === "training").length,
  }

  const openEditModal = (bot: TrainedBot) => {
    setEditBot(bot);
    setEditForm({ name: bot.name, description: bot.description, status: bot.status, modelId: bot.modelId || '' });
    setFile(null);
    setInstruction(bot.personality || '');
    setIsEditOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    if (!editBot) return;
    setEditLoading(true);
    let newDatasetId = null;
    try {

      const patchBody: any = { ...editForm, instruction };
      if (editForm.modelId) patchBody.modelId = editForm.modelId;
      const res = await fetch(`/api/dashboard/bots/${editBot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchBody),
      });
      if (res.ok) {
        setBots((prev) => prev.map((b) => (b.id === editBot.id ? { ...b, ...editForm, status: editForm.status as TrainedBot['status'], personality: instruction } : b)));
        setIsEditOpen(false);
        toast.success('Bot updated successfully.');
      } else {
        toast.error('Failed to update bot.');
      }
    } catch (err) {
      toast.error('Error updating bot.');
    }
    setEditLoading(false);
  };

  const handleDelete = async (bot: TrainedBot) => {
    const res = await fetch(`/api/dashboard/bots/${bot.id}`, { method: 'DELETE' });
    if (res.ok) {
      setBots((prev) => prev.filter((b) => b.id !== bot.id));
      toast.success('Bot deleted successfully.');
    } else {
      toast.error('Failed to delete bot.');
    }
  };

  // If loading, show a loading state
  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>;
  }

  // If error, show an error state
  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading bots.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center justify-center bg-primary/10 rounded-full p-2">
            <Bot className="w-7 h-7 text-primary" />
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My AI Bots</h1>
        </div>
        <div className="border-b border-muted mb-8" />
        {/* Create New Bot Button */}
        <div className="flex justify-end mb-4">
          <Button onClick={() => router.push("/dashboard/bots/create")} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create New Bot
          </Button>
        </div>
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search bots by name, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={providerFilter} onValueChange={setProviderFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastUsed">Last Used</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="conversations">Requests</SelectItem>
                    <SelectItem value="accuracy">Accuracy</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bots List - now flex layout, no top cards */}
        <div className="flex flex-wrap gap-6">
          {filteredAndSortedBots.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bots found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || providerFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first AI bot to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedBots.map((bot) => (
              <Card
                key={bot.id}
                className="hover:shadow-md transition-shadow flex flex-col justify-between basis-[340px] max-w-[360px] min-w-[320px] cursor-pointer"
              >
                <CardContent className="p-6 flex flex-col ">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-primary/10 rounded-lg self-start">
                                            {bot.image ?   (
                                        <img src={bot.image} alt={bot.name} className="w-7 h-7 rounded-full object-cover" />
                                      ):(                    <Bot className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg truncate">{bot.name}</h3>
                          {getStatusBadge(bot.status)}
                          <Badge variant="outline" className="text-xs">
                            {bot.version}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-3">{bot.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                          <div>
                            <p className="text-muted-foreground">Model</p>
                            <div className="flex items-center gap-1">
                              {getProviderIcon(bot.provider)}
                              <span className="font-medium truncate">{bot.model}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Requests</p>
                            <p className="font-medium">{(bot.metrics.requests || 0).toLocaleString()}</p>
                          </div>
                        
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {bot.tags.map((tag:any) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 justify-end">
                    {getStatusIcon(bot.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedBot(bot);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <Plug className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(bot)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(bot)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Bot Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                {selectedBot?.name}
              </DialogTitle>
            </DialogHeader>
           
            {selectedBot && (
              <div className="py-8 flex flex-col items-center justify-center">
                <Label className="text-base font-semibold mb-2">Embed this widget on your website</Label>
                <div className="w-full flex items-center gap-2">
                  <Textarea
                    readOnly
                    value={`<script src="http://localhost:3000//widget.js" botId="${selectedBot.id}\"></script>`}
                    className="w-full font-mono text-xs bg-muted/50 resize-none"
                    rows={2}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`<script src="http://localhost:3000//widget.js" botId="${selectedBot.id}\"></script>`);
                      toast.success('Embed code copied!');
                    }}
                    title="Copy embed code"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">Paste this code into your website's HTML where you want the chat widget to appear.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-3xl p-0 bg-background/95 max-h-[80vh] overflow-y-auto rounded-2xl shadow-xl border-0">
            <form onSubmit={e => { e.preventDefault(); handleEditSubmit(); }}>
              <div className="p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold mb-2">Edit Bot</DialogTitle>
                  <p className="text-muted-foreground text-sm mb-6">Update your bot's details, provider, and instructions below.</p>
                </DialogHeader>
                <div className="gap-10 mb-8">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Bot Details</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-1">Name</Label>
                          <Input name="name" value={editForm.name} onChange={handleEditChange} className="h-11 text-base mt-2" />
                        </div>
                        <div>
                          <Label className="mb-1">Description</Label>
                          <Input name="description" value={editForm.description} onChange={handleEditChange} className="h-11 text-base mt-2" />
                        </div>
                        <div>
                          <Label className="mb-1">Status</Label>
                          <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full border rounded px-3 py-3 mt-2 text-base">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="training">Training</option>
                            <option value="error">Error</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t">
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Provider & Dataset</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-1">Provider/Model</Label>
                          <select name="modelId" value={editForm.modelId || ''} onChange={handleEditChange} className="w-full border rounded px-3 py-3 mt-2 text-base">
                            <option value="">Select Provider/Model</option>
                            {credentials.map((cred) => (
                              <option key={cred._id} value={cred._id}>{cred.provider} - {cred.model}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Instructions</h3>
                    <div className="flex-1 bg-muted/50 rounded-lg p-6 shadow-inner flex flex-col">
                      <Label className="mb-3">Instruction</Label>
                      <Textarea 
                        value={instruction} 
                        onChange={e => setInstruction(e.target.value)} 
                        rows={16} 
                        className="min-h-[220px] overflow-y-auto max-h-[400px] resize-y  w-full text-base bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-muted pt-6 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="h-10 px-6">Cancel</Button>
                  <Button type="submit" disabled={editLoading} className="h-10 px-8 font-semibold bg-primary text-primary-foreground">
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      
      </div>
    </div>
  )
}
