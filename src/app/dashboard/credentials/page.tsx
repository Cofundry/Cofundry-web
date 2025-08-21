"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Key, Eye, EyeOff, Copy, Check, Edit, Trash2, MoreVertical, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DialogFooter } from '@/components/ui/dialog';

const PROVIDERS = [
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini","gpt-3.5-turbo"] },
  { id: "google", name: "Google AI", models: ["gemini-2.0-flash"] },
];

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ provider: "", model: "", apiKey: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<{ [id: string]: boolean }>({});
  const [editOpen, setEditOpen] = useState(false);
  const [editCredential, setEditCredential] = useState<any>(null);
  const [editForm, setEditForm] = useState({ provider: "", model: "", apiKey: "", description: "", status: "active" });
  const [editLoading, setEditLoading] = useState(false);

  // Fetch credentials from API
  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/credentials");
      const data = await res.json();
      setCredentials(Array.isArray(data.credentials) ? data.credentials : []);
    } catch (e) {
      console.error("Failed to load credentials.", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCredentials(); }, []);

  // Handle add credential
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: form.provider,
          model: form.model,
          apiKey: form.apiKey,
          description: form.description,
          status: "active"
        })
      });
      if (!res.ok) throw new Error("Failed to add credential");
      setForm({ provider: "", model: "", apiKey: "", description: "" });
      toast.success('Credential added successfully.');
      fetchCredentials();
      setTimeout(() => {
        setAddOpen(false);
      }, 1200);
    } catch (e) {
      toast.error('Failed to add credential.');
    }
    setSubmitting(false);
  };

  // Toggle API key visibility for a credential
  const handleToggleApiKey = (id: string) => {
    setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy API key to clipboard
  const handleCopyApiKey = async (apiKey: string, id: string) => {
    await navigator.clipboard.writeText(apiKey);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const openEditModal = (credential: any) => {
    setEditCredential(credential);
    setEditForm({
      provider: credential.provider,
      model: credential.model,
      apiKey: credential.apiKey,
      description: credential.description || "",
      status: credential.status || "active"
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editCredential) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/dashboard/credentials/${editCredential._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setCredentials((prev) => prev.map((c) => c._id === editCredential._id ? { ...c, ...editForm } : c));
        setEditOpen(false);
        toast.success('Credential updated successfully.');
      } else {
        toast.error('Failed to update credential.');
      }
    } catch (err) {
      toast.error('Error updating credential.');
    }
    setEditLoading(false);
  };

  const handleDelete = async (credential: any) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) return;
    const res = await fetch(`/api/dashboard/credentials/${credential._id}`, { method: 'DELETE' });
    if (res.ok) {
      setCredentials((prev) => prev.filter((c) => c._id !== credential._id));
      toast.success('Credential deleted successfully.');
    } else {
      toast.error('Failed to delete credential.');
    }
  };

  return (
    <div className=" bg-gray-50 min-h-screen    p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center bg-primary/10 rounded-full p-2">
          <Key className="w-7 h-7 text-primary" />
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Credentials</h1>
      </div>
      <div className="border-b border-muted mb-8" />
      <div className="flex items-center justify-between mb-8 gap-4">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Credential</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Credential</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-5 mt-2">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={form.provider} onValueChange={v => setForm(f => ({ ...f, provider: v, model: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.provider && (
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={form.model} onValueChange={v => setForm(f => ({ ...f, model: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.find(p => p.id === form.provider)?.models.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="text" value={form.apiKey} onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <Button type="submit" disabled={submitting || !form.provider || !form.model || !form.apiKey} className="w-full mt-2">{submitting ? <Spinner /> : "Add Credential"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mb-6 flex items-center gap-2">
        <Input
          placeholder="Filter by provider or model..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : credentials.length === 0 ? (
        <Card className="mb-4">
          <CardContent className="py-10 text-center text-muted-foreground text-lg">No credentials found.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials
            .filter(cred =>
              !filter ||
              cred.provider?.toLowerCase().includes(filter.toLowerCase()) ||
              cred.model?.toLowerCase().includes(filter.toLowerCase())
            )
            .map(cred => {
              const id = cred._id || cred.id;
              const isVisible = showApiKey[id];
              return (
                <Card key={id}>
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg font-semibold capitalize">{cred.provider}</CardTitle>
                      <Badge variant="secondary">{cred.model}</Badge>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Badge variant={cred.status === "active" ? "default" : cred.status === "inactive" ? "outline" : "secondary"}>
                        {cred.status || "active"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(cred)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(cred)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 pt-0">
                    <div className="flex items-center gap-2">
                      <CardDescription className="break-all text-base font-mono text-muted-foreground">
                        {isVisible ? cred.apiKey : "*".repeat(cred.apiKey?.length || 8)}
                      </CardDescription>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={isVisible ? "Hide API Key" : "Show API Key"}
                        onClick={() => handleToggleApiKey(id)}
                        className="h-7 w-7"
                      >
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Copy API Key"
                        onClick={() => handleCopyApiKey(cred.apiKey, id)}
                        className="h-7 w-7"
                      >
                        {copiedId === id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    {cred.description && <div className="text-sm text-muted-foreground mt-1">{cred.description}</div>}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Credential</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleEditSubmit(); }}>
            <div className="space-y-4">
              <div>
                <Label>Provider</Label>
                <Select value={editForm.provider} onValueChange={v => setEditForm(f => ({ ...f, provider: v, model: "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editForm.provider && (
                <div>
                  <Label>Model</Label>
                  <Select value={editForm.model} onValueChange={v => setEditForm(f => ({ ...f, model: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.find(p => p.id === editForm.provider)?.models.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>API Key</Label>
                <Input value={editForm.apiKey} onChange={e => setEditForm(f => ({ ...f, apiKey: e.target.value }))} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <Label>Status</Label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded px-2 py-2">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editLoading}>Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
