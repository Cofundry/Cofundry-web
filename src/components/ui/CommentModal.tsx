import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

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
  onSubmit?: (text: string) => Promise<void>;
  comments: Comment[];
  currentUser?: string;
  currentUserAvatar?: string;
  projectId: string;
  loading?: boolean;
  refetchComments?: () => void;
}

export function CommentModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  comments, 
  currentUser, 
  currentUserAvatar, 
  projectId, 
  loading = false,
  refetchComments 
}: CommentModalProps) {
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !onSubmit) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(commentText);
      setCommentText("");
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to post comment');
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
      const endpoint = `/api/comments/${id}`;
      const body = { projectId, text: editText };
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        setEditingId(null);
        setEditText("");
        refetchComments?.();
        toast.success("Comment updated successfully!");
      } else {
        toast.error("Failed to update comment");
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error("Failed to update comment");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const endpoint = `/api/comments/${id}?projectId=${projectId}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      
      if (response.ok) {
        refetchComments?.();
        toast.success("Comment deleted successfully!");
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
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
      userName: comment.userName,
      userEmail: comment.userEmail,
      userAvatar: comment.userAvatar,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      userId: comment.userId
    };
  };

  // Check if current user can edit/delete a comment
  const canModifyComment = (comment: Comment) => {
    // This would need to be implemented based on your auth system
    return currentUser && (comment.userEmail === currentUser || comment.userId === currentUser);
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return commentDate.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] w-full max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Comments ({comments.length})
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Join the conversation about this project
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Loading comments...</span>
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">No comments yet</p>
              <p className="text-sm text-muted-foreground">Be the first to start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {comment.userName?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    
                    {editingId === comment._id ? (
                      <div className="space-y-2 mt-2">
                        <Textarea 
                          value={editText} 
                          onChange={(e) => setEditText(e.target.value)} 
                          className="min-h-[80px] resize-none" 
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEditSave(comment._id)} className="flex-1 sm:flex-none">
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="flex-1 sm:flex-none">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-foreground break-words leading-relaxed">
                          {comment.text}
                        </p>
                        
                        {canModifyComment(comment) && (
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEdit(comment._id, comment.text)}
                              className="h-8 px-2 text-xs"
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDelete(comment._id)}
                              className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {onSubmit && (
          <DialogFooter className="flex-shrink-0 border-t pt-4 px-6 pb-6">
            <form onSubmit={handleSubmit} className="w-full space-y-3">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your comment..."
                  className="min-h-[80px] resize-none flex-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!commentText.trim() || isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Posting...
                    </div>
                  ) : (
                    'Post Comment'
                  )}
                </Button>
              </div>
            </form>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};