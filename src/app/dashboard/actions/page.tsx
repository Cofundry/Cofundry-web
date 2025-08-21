"use client";
import { useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useGet from '@/lib/hooks/useGet';
import { Loader2, Frame, Info, Shield } from "lucide-react";
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ActionsDashboardPage() {
  // Fetch bots
  const { data, loading, error } = useGet({ url: "/api/dashboard/bots" }) as {
    data: { bots: any[] } | null;
    loading: boolean;
    error: any;
  };
  const [actions, setActions] = useState<Record<string, any[]>>({}); // { [botId]: Action[] }
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBot, setModalBot] = useState<any>(null);
  const defaultAction = { name: '', headers: '', api: '', apiKey: '', description: '', method: 'POST' };
  const [editingAction, setEditingAction] = useState<{ botId: string, index: number | null, data: any }>({ botId: '', index: null, data: defaultAction });
  const [actionsLoading, setActionsLoading] = useState<Record<string, boolean>>({});

  // Fetch actions for all bots on load
  useEffect(() => {
    if (!data || !data.bots) return;
    data.bots.forEach(async (bot) => {
      setActionsLoading(prev => ({ ...prev, [bot.id || bot._id]: true }));
      try {
        const res = await fetch(`/api/dashboard/bots/${bot.id || bot._id}/actions`);
        const json = await res.json();
        if (res.ok) {
          setActions(prev => ({ ...prev, [bot.id || bot._id]: json.actions || [] }));
        } else {
          setActions(prev => ({ ...prev, [bot.id || bot._id]: [] }));
        }
      } catch {
        setActions(prev => ({ ...prev, [bot.id || bot._id]: [] }));
      } finally {
        setActionsLoading(prev => ({ ...prev, [bot.id || bot._id]: false }));
      }
    });
  }, [data]);

  const getBotActions = useCallback((botId: string) => actions[botId] || [], [actions]);

  const openModal = (bot: any, actionIdx: number | null = null) => {
    setModalBot(bot);
    if (actionIdx !== null) {
      setEditingAction({ botId: bot.id, index: actionIdx, data: { ...getBotActions(bot.id)[actionIdx] } });
    } else {
      setEditingAction({ botId: bot.id, index: null, data: defaultAction });
    }
    setModalOpen(true);
  };

  // Save actions to backend
  const saveActions = async (botId: string, newActions: any[]) => {
    setActionsLoading(prev => ({ ...prev, [botId]: true }));
    try {
      const res = await fetch(`/api/dashboard/bots/${botId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions: newActions })
      });
      if (!res.ok) throw new Error('Failed to update actions');
      setActions(prev => ({ ...prev, [botId]: newActions }));
      toast.success('Actions updated successfully!');
    } catch (err) {
      toast.error('Failed to update actions.');
    } finally {
      setActionsLoading(prev => ({ ...prev, [botId]: false }));
    }
  };

  // Add or update action
  const handleSaveAction = async () => {
    if (!modalBot) return;
    const botId = modalBot.id || modalBot._id;
    const botActions = [...(actions[botId] || [])];
    if (editingAction.index !== null) {
      botActions[editingAction.index] = editingAction.data;
    } else {
      botActions.push(editingAction.data);
    }
    await saveActions(botId, botActions);
    setModalOpen(false);
  };

  // Delete action
  const handleDeleteAction = async (botId: string, idx: number) => {
    const botActions = [...(actions[botId] || [])];
    botActions.splice(idx, 1);
    await saveActions(botId, botActions);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center justify-center bg-primary/10 rounded-full p-2">
            <Frame className="w-7 h-7 text-primary" />
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Actions</h1>
        </div>
        <div className="border-b border-muted mb-8" />
        {/* Main Card for Actions List */}
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto" /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{String(error)}</div>
        ) : !data || data.bots.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No bots found.</div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-start">
            {data.bots.map(bot => {
              const botId = bot.id || bot._id;
              return (
                <Card
                  key={botId}
                  className="flex flex-col min-w-[320px] max-w-[400px] flex-1 hover:shadow-lg transition-shadow border bg-white/95 p-4 gap-3"
                >
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="flex items-center justify-between text-base font-semibold">
                      <span className="truncate max-w-[180px]">{bot.name}</span>
                      <Button size="sm" onClick={() => openModal(bot)} className="bg-primary text-white hover:bg-primary/90 px-3 py-1 h-8 text-xs">Add Action</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {actionsLoading[botId] ? (
                      <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
                    ) : getBotActions(botId).length === 0 ? (
                      <div className="text-muted-foreground text-center py-4 text-sm">No actions for this bot.</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {getBotActions(botId).map((action, idx) => (
                          <Card
                            key={idx}
                            className="p-3 flex flex-col md:flex-row md:items-center gap-3 bg-muted/60 border border-muted/30 rounded-lg shadow-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate flex items-center gap-2">
                                <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">{action.method || 'POST'}</span>
                                {action.name}
                              </div>
                              <div className="text-xs text-muted-foreground break-all">API: {action.api}</div>
                              <div className="text-xs text-muted-foreground break-all">API Key: {action.apiKey}</div>
                              <div className="text-xs text-muted-foreground">{action.description}</div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button variant="outline" size="sm" onClick={() => openModal(bot, idx)} className="px-2 py-1 h-7 text-xs">Edit</Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteAction(botId, idx)} className="px-2 py-1 h-7 text-xs">Delete</Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {/* Modal for Add/Edit Action */}
        <Dialog  open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-background/95 rounded-2xl shadow-xl border-0">
    <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-2">{editingAction.index !== null ? 'Edit Action' : 'Add Action'} <span className="text-primary">{modalBot?.name ? `for ${modalBot.name}` : ''}</span></DialogTitle>
                <p className="text-muted-foreground text-sm mb-4">Configure the API action for this bot. Fill in all required fields for best results.</p>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-3">
                  <Label className="mb-1">Name</Label>
                  <Input value={editingAction.data.name} onChange={e => setEditingAction(a => ({ ...a, data: { ...a.data, name: e.target.value } }))} placeholder="Action name" className="h-11 text-base" />
                </div>
                <div className="flex flex-col gap-3">
                  <Label className="mb-1">Method</Label>
                  <Select value={editingAction.data.method} onValueChange={val => setEditingAction(a => ({ ...a, data: { ...a.data, method: val } }))}>
                    <SelectTrigger className="w-full h-11 text-base">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-3 md:col-span-2">
                  <Label className="mb-1">API Endpoint</Label>
                  <Input value={editingAction.data.api} onChange={e => setEditingAction(a => ({ ...a, data: { ...a.data, api: e.target.value } }))} placeholder="https://api.example.com/endpoint" className="h-11 text-base" />
                </div>
                <Badge
          className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
          variant="secondary"
        >
        <Info/>   Please let the header empty if You are using Bearer Token
        </Badge>
                <div className="flex flex-col gap-3 md:col-span-2">
                <Input value={editingAction.data.headers} onChange={e => setEditingAction(a => ({ ...a, data: { ...a.data, headers: e.target.value } }))} placeholder="headers" className="h-11 text-base" />

                <div className="flex flex-col gap-3 md:col-span-2 relative">
  <Label className="mb-1">API Key</Label>
  <Input
    value={editingAction.data.apiKey}
    onChange={e => setEditingAction(a => ({ ...a, data: { ...a.data, apiKey: e.target.value } }))}
    placeholder="sk-..."
    className="h-11 text-base pr-10"
    type="password"
  />
  <span className="absolute right-3 top-10 text-muted-foreground">
    <Shield/>
  </span>
</div>   
                </div>
                <div className="flex flex-col gap-3 md:col-span-2">
                  <Label className="mb-1">Description</Label>
                  <Textarea value={editingAction.data.description} onChange={e => setEditingAction(a => ({ ...a, data: { ...a.data, description: e.target.value } }))} placeholder="Describe what this action does..." className="min-h-[80px] text-base" />
                </div>
              </div>
              <div className="border-t border-muted pt-5 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setModalOpen(false)} className="h-10 px-6">Cancel</Button>
                <Button onClick={handleSaveAction} className="h-10 px-8 font-semibold">{editingAction.index !== null ? 'Update Action' : 'Add Action'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 