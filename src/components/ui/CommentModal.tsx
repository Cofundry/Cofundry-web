import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Comment {
  _id: string;
  projectId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (comment: string) => void;
  comments: Comment[];
  currentUser?: string;
  currentUserAvatar?: string;
  projectId: string;
  loading?: boolean;
  refetchComments?: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  comments, 
  currentUser, 
  currentUserAvatar, 
  projectId, 
  loading, 
  refetchComments 
}) => {
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleSubmit = () => {
    if (comment.trim() && onSubmit) {
      onSubmit(comment);
      setComment("");
    }
  };

  const handleEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleEditSave = async (id: string) => {
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, text: editText }),
      });
      
      if (response.ok) {
        toast.success("Comment edited successfully!");
        setEditingId(null);
        setEditText("");
        if (typeof refetchComments === 'function') refetchComments();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to edit comment");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error("Failed to edit comment");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/comments/${id}?projectId=${projectId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast.success("Comment deleted successfully!");
        if (typeof refetchComments === 'function') refetchComments();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  // Helper for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold">Comments</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No comments yet.</div>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-3 items-start border-b pb-4 last:border-b-0">
                  <Avatar className="h-10 w-10">
                    {c.userAvatar ? (
                      <AvatarImage src={c.userAvatar} alt={c.userName} />
                    ) : (
                      <AvatarFallback>{getInitials(c.userName)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{c.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {editingId === c._id ? (
                      <div className="flex gap-2 mt-1">
                        <Textarea value={editText} onChange={e => setEditText(e.target.value)} className="flex-1" />
                        <Button size="sm" onClick={() => handleEditSave(c._id)}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground mt-1">{c.text}</p>
                    )}
                    {currentUser && (c.userName === currentUser || c.userEmail === currentUser) && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(c._id, c.text)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(c._id)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {onSubmit && (
          <DialogFooter className="px-6 pb-6">
            <div className="flex gap-2 w-full">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSubmit} disabled={!comment.trim()}>
                Post
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
