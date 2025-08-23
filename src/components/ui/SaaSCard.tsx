"use client";

import { useState, useEffect } from "react";
import { SaaS } from "@/lib/models/SaaS";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Heart, MessageCircle, ExternalLink, Calendar, User } from "lucide-react";
import { CommentModal } from "@/components/ui/CommentModal";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SaaSCardProps {
  saas: SaaS;
  onVoteChange?: (votes: number, todayVotes: number) => void;
  showVoteButton?: boolean;
}

export default function SaaSCard({ saas, onVoteChange, showVoteButton = true }: SaaSCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [votes, setVotes] = useState(saas.votes || 0);
  const [todayVotes, setTodayVotes] = useState(saas.todayVotes || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState<Array<{
    _id: string;
    saasId: string;
    authorId: string;
    authorName: string;
    authorEmail: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string; avatar?: string } | null>(null);
  const router = useRouter();

  // Load comments on mount
  useEffect(() => {
    if (saas._id) {
      fetchComments();
    }
  }, [saas._id]);

  // Load current user on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser({ name: data.user?.name, email: data.user?.email, avatar: data.user?.avatar });
        }
      } catch (err) {}
    }
    load();
  }, []);

  const handleVote = async () => {
    if (isVoting) return;
    
    // Check if user is authenticated
    try {
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        toast.error('Please log in to vote');
        router.push('/login');
        return;
      }
    } catch (error) {
      toast.error('Please log in to vote');
      router.push('/login');
      return;
    }
    
    setIsVoting(true);
    try {
      const response = await fetch(`/api/saas/${saas._id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVotes(data.votes);
        setTodayVotes(data.todayVotes);
        setHasVoted(true);
        onVoteChange?.(data.votes, data.todayVotes);
        toast.success('Vote recorded!');
      } else {
        const error = await response.json();
        if (error.error === 'You have already voted for this SaaS') {
          setHasVoted(true);
          toast.info('You have already voted for this SaaS');
        } else {
          toast.error(error.error || 'Failed to vote');
        }
      }
    } catch (error) {
      toast.error('Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleComment = () => {
    // Check if user is authenticated before opening comment modal
    if (!currentUser) {
      toast.error('Please log in to comment');
      router.push('/login');
      return;
    }
    setCommentOpen(true);
  };

  const handleVisit = () => {
    if (saas.url) {
      window.open(saas.url, '_blank');
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchComments = async () => {
    if (!saas._id) return;
    
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/saas/${saas._id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    }
    setLoadingComments(false);
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Avatar className="h-12 w-12">
                {saas.logo ? (
                  <img src={saas.logo} alt={saas.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-sm font-semibold text-primary">
                    {(saas.name || 'S').slice(0,2).toUpperCase()}
                  </div>
                )}
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {saas.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground truncate">
                by {saas.authorName}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2">
            <Badge variant="secondary" className="text-xs">
              {saas.category}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {formatDate(saas.createdAt)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
          {saas.description}
        </p>

        {saas.features && saas.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {saas.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {saas.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{saas.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-3 mt-auto">
          {/* Stats row */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Heart className={`w-4 h-4 ${hasVoted ? 'text-red-500 fill-current' : ''}`} />
                <span>{votes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{todayVotes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{comments.length}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {showVoteButton && (
              <Button
                onClick={handleVote}
                disabled={isVoting || hasVoted}
                variant={hasVoted ? "outline" : "default"}
                size="sm"
                className="flex items-center space-x-1 flex-1 sm:flex-none"
              >
                <Heart className={`w-4 h-4 ${hasVoted ? 'text-red-500 fill-current' : ''}`} />
                <span className="hidden sm:inline">{hasVoted ? 'Voted' : 'Vote'}</span>
              </Button>
            )}
            
            <Button
              onClick={handleComment}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 flex-1 sm:flex-none"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Comment</span>
            </Button>

            {saas.url && (
              <Button
                onClick={handleVisit}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 flex-1 sm:flex-none"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Visit</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <CommentModal
        open={commentOpen}
        onOpenChange={setCommentOpen}
        onSubmit={async (text: string) => {
          try {
            const res = await fetch(`/api/saas/${saas._id}/comments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: text })
            });
            if (res.ok) {
              toast.success('Comment added successfully!');
              fetchComments();
            } else {
              const err = await res.json();
              toast.error(err.error || 'Failed to add comment');
            }
          } catch (err) {
            toast.error('Failed to add comment');
          }
        }}
        comments={comments.map(comment => ({
          _id: comment._id,
          projectId: comment.saasId,
          userId: comment.authorId,
          userName: comment.authorName,
          userEmail: comment.authorEmail,
          userAvatar: comment.authorAvatar,
          text: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt
        }))}
        currentUser={currentUser?.name || currentUser?.email}
        currentUserAvatar={currentUser?.avatar}
        projectId={saas._id || ''}
        loading={loadingComments}
        refetchComments={async () => fetchComments()}
      />
    </Card>
  );
}
