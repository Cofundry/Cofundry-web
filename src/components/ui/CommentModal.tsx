import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Comment {
  _id: string;
  projectId?: string;
  saasId?: string;
  userId?: string;
  authorId?: string;
  userName?: string;
  authorName?: string;
  userEmail?: string;
  authorEmail?: string;
  userAvatar?: string;
  authorAvatar?: string;
  text?: string;
  content?: string;
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
  saasMode?: boolean;
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
  saasMode, 
  loading, 
  refetchComments 
}) => {
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim() || !onSubmit) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(comment);
      setComment("");
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleEditSave = async (id: string) => {
    try {
      const endpoint = saasMode ? `/api/saas/${projectId}/comments/${id}` : `/api/comments/${id}`;
      const body = saasMode ? { content: editText } : { projectId, text: editText };
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      const endpoint = saasMode ? `/api/saas/${projectId}/comments/${id}` : `/api/comments/${id}?projectId=${projectId}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      
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

  // Helper to get comment display data
  const getCommentDisplayData = (comment: Comment) => {
    return {
      id: comment._id,
      userName: comment.userName || comment.authorName || 'Anonymous User',
      userEmail: comment.userEmail || comment.authorEmail || '',
      userAvatar: comment.userAvatar || comment.authorAvatar || '',
      text: comment.text || comment.content || '',
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      userId: comment.userId || comment.authorId || ''
    };
  };

  // Check if current user can edit/delete a comment
  const canModifyComment = (comment: Comment) => {
    if (!currentUser) return false;
    const displayData = getCommentDisplayData(comment);
    return displayData.userName === currentUser || displayData.userEmail === currentUser;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 w-full max-w-2xl mx-4">
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-2 sticky top-0 bg-background border-b">
          <DialogTitle className="text-xl font-bold">Comments</DialogTitle>
        </DialogHeader>
        
        <div className="px-4 sm:px-6 py-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">💬</div>
              <p>No comments yet.</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => {
                const displayData = getCommentDisplayData(c);
                return (
                  <div key={c._id} className="flex gap-3 items-start border-b pb-4 last:border-b-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      {displayData.userAvatar ? (
                        <AvatarImage src={displayData.userAvatar} alt={displayData.userName} />
                      ) : (
                        <AvatarFallback>{getInitials(displayData.userName)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-foreground truncate">{displayData.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(displayData.createdAt)}
                        </span>
                      </div>
                      {editingId === c._id ? (
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Textarea 
                            value={editText} 
                            onChange={e => setEditText(e.target.value)} 
                            className="flex-1 min-h-[80px]" 
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditSave(c._id)}>
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground mt-1 break-words">{displayData.text}</p>
                      )}
                      {canModifyComment(c) && (
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEdit(c._id, displayData.text)}
                            className="h-8 px-2 text-xs"
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(c._id)}
                            className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {onSubmit && (
          <DialogFooter className="px-4 sm:px-6 pb-6 border-t bg-background sticky bottom-0">
            <div className="flex flex-col gap-3 w-full">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 min-h-[80px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  disabled={!comment.trim() || isSubmitting}
                  className="px-6"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
