"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Trash2, Plus, Database } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function FileIcon() {
  return <FileText className="w-5 h-5 text-blue-500" />;
}

function AddCollectionModal({ botId, onAdded }: { botId: string, onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("upload");
  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // Text
  const [textName, setTextName] = useState("");
  const [textContent, setTextContent] = useState("");
  // Webscrape
  const [webName, setWebName] = useState("");
  const [webUrl, setWebUrl] = useState("");

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    let formData = new FormData();
    formData.append("bot_id", botId);
    if (tab === "upload") {
      const file = fileInputRef.current?.files?.[0];
      if (!file) { toast.error("No file selected"); setUploading(false); return; }
      formData.append("file", file);
      formData.append("collection", file.name);
      formData.append("type", "upload");
    } else if (tab === "text") {
      if (!textName || !textContent) { toast.error("Name and content required"); setUploading(false); return; }
      // For text, send content as a file to the backend so it can embed and get collection_name
      const textBlob = new Blob([textContent], { type: 'text/plain' });
      formData.append("file", textBlob, textName + ".txt");
      formData.append("collection", textName);
      formData.append("type", "text");
    } else if (tab === "webscrape") {
      if (!webName || !webUrl) { toast.error("Name and URL required"); setUploading(false); return; }
      // For webscrape, send the sourceUrl and name directly to the backend
      formData.append("sourceUrl", webUrl);
      formData.append("collection", webName);
      formData.append("type", "webscrape");
    }
    try {
      const res = await fetch(`/api/dashboard/collections`, { method: "POST", body: formData });
      if (res.ok) {
        setOpen(false);
        setTextName(""); setTextContent(""); setWebName(""); setWebUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.success("Collection added.");
        onAdded();
      } else toast.error("Failed to add collection");
    } catch { toast.error("Failed to add collection"); }
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2" title="Add Collection"><Plus className="w-5 h-5" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Collection</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="text">Paste Text</TabsTrigger>
            <TabsTrigger value="webscrape">Web Scrape</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <Input type="file" ref={fileInputRef} />
              <Button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</Button>
            </form>
          </TabsContent>
          <TabsContent value="text">
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <Input placeholder="Name" value={textName} onChange={e => setTextName(e.target.value)} />
              <Textarea placeholder="Paste text here..." value={textContent} onChange={e => setTextContent(e.target.value)} rows={14} style={{ minHeight: '240px', maxHeight: '400px', width: '100%', resize: 'vertical', overflow: 'auto' }} />
              <Button type="submit" disabled={uploading}>{uploading ? "Adding..." : "Add Text"}</Button>
            </form>
          </TabsContent>
          <TabsContent value="webscrape">
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <Input placeholder="Name" value={webName} onChange={e => setWebName(e.target.value)} />
              <Input placeholder="URL to scrape" value={webUrl} onChange={e => setWebUrl(e.target.value)} />
              <Button type="submit" disabled={uploading}>{uploading ? "Adding..." : "Add Web Content"}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function CollectionsPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchBots = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/collections");
      const data = await res.json();
      if (res.ok && data.bots) setBots(data.bots);
      else setError("Failed to load bots");
    } catch { setError("Failed to load bots"); }
    setLoading(false);
  };

  useEffect(() => { fetchBots(); }, []);

  const handleDelete = async (botId: string, datasetId: string) => {
    if (!window.confirm("Delete this file source?")) return;
    try {
      const res = await fetch(`/api/dashboard/bots/${botId}?datasetId=${datasetId}`, { method: "DELETE" });
      if (res.ok) {
        setBots(prev => prev.map(bot => bot.id === botId ? { ...bot, datasets: bot.datasets.filter((d: any) => d._id !== datasetId) } : bot));
        toast.success("Deleted.");
      } else toast.error("Failed to delete.");
    } catch { toast.error("Failed to delete."); }
  };

  // Filtered bots
  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) || bot.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (bot.datasets && bot.datasets.some((ds: any) => ds.status === statusFilter));
    // At least one collection matches the type filter
    const matchesType = typeFilter === "all" || (bot.datasets && bot.datasets.some((ds: any) => (ds.type || "upload") === typeFilter));
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">    
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center justify-center bg-primary/10 rounded-full p-2">
            <Database className="w-7 h-7 text-primary" />
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Collections</h1>
        </div>
        <div className="border-b border-muted mb-8" />

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    placeholder="Search bots by name or ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-4"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded px-3 py-2">
                  <option value="all">All Types</option>
                  <option value="upload">Upload</option>
                  <option value="text">Text</option>
                  <option value="webscrape">Webscrape</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredBots.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No bots found.</div>
        ) : (
          <div className="flex flex-col gap-8">
            {filteredBots.map((bot: any) => (
              <Card key={bot.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{bot.name}</span>
                    <span className="text-xs text-muted-foreground">({bot.id})</span>
                    <AddCollectionModal botId={bot.id} onAdded={fetchBots} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bot.datasets.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No collections found for this bot.</div>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {bot.datasets
                        .filter((ds: any) => typeFilter === "all" || (ds.type || "upload") === typeFilter)
                        .map((ds: any) => (
                          <div key={ds._id} className="flex items-center justify-between bg-muted rounded px-3 py-2 min-w-[260px] max-w-[320px] w-full">
                            <div className="flex items-center gap-3">
                              <FileIcon />
                              <div>
                                <div className="font-medium">{ds.collection || ds.name || ds.collection_name || 'Unnamed'}</div>
                                <div className="text-xs text-muted-foreground">{ds.collection_name}</div>
                                <div className="text-xs mt-1"><span className="font-semibold">Type:</span> {ds.type || 'upload'}</div>
                                {/* Collapsible URLs for web/webscrape */}
                                {(['web', 'webscrape', 'webscrap'].includes(ds.type) && Array.isArray(ds.urls) && ds.urls.length > 0) && (
                                  <UrlsModal urls={ds.urls[0]} />
                                )}
                              </div>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(bot.id, ds._id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 

function UrlsModal({ urls }: { urls: string[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filteredUrls = urls.filter(url => url.toLowerCase().includes(search.toLowerCase()));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-primary underline text-xs font-medium mb-1 focus:outline-none"
          onClick={() => setOpen(true)}
        >
          View URLs
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl min-w-[520px] p-0 overflow-hidden bg-muted">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Source URLs</DialogTitle>
        </DialogHeader>
        <div className="sticky top-0 z-10 bg-muted px-6 pt-2 pb-3 border-b">
          <input
            type="text"
            placeholder="Search URLs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 px-4 py-2 rounded-md border border-muted-foreground/30 shadow-sm text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            style={{ maxWidth: 480 }}
          />
        </div>
        <div className="overflow-y-auto px-0 py-0" style={{ maxHeight: '55vh' }}>
          {filteredUrls.length === 0 ? (
            <div className="text-muted-foreground text-base px-6 py-8">No URLs found.</div>
          ) : (
            <ul className="divide-y divide-muted-foreground/10">
              {filteredUrls.map((url) => (
                <li key={url} className="bg-background px-6 py-3">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-mono text-[15px] text-blue-800 hover:underline break-words"
                    style={{ wordBreak: 'break-all' }}
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 