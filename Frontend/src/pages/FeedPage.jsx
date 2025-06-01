//Explorer page
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, Heart, MessageCircle, Share2 } from "lucide-react";
import { Badge } from '@/components/ui/badge'; // If displaying speciality
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

// Helper for initials
const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(' ');
  if (names.length === 1) return names[0][0]?.toUpperCase() || "?";
  return (names[0][0]?.toUpperCase() || "") + (names[names.length - 1][0]?.toUpperCase() || "");
}

// Helper for formatting dates
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    } catch (e) {
        return dateString;
    }
}

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    fetchFeedPosts();
  }, []);

  const fetchFeedPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('/api/posts/feed', { headers }); 
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch feed posts.');
      
      setPosts(data.data || []);
    } catch (err) {
      console.error("Failed to fetch feed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to like posts');
        return;
      }

      const res = await fetch(`/api/posts/like/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Like failed');

      // Update the posts state with the new like status
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const isLiked = !post.isLiked;
          const likes = isLiked 
            ? [...post.likes, postId]
            : post.likes.filter(id => id !== postId);
          return { ...post, isLiked, likes };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error liking post:', err.message);
      toast.error(err.message);
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to comment');
        return;
      }

      const res = await fetch(`/api/posts/comment/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Comment failed');

      // Clear the comment input
      setCommentText({ ...commentText, [postId]: '' });
      
      // Refresh the posts to show the new comment
      fetchFeedPosts();
      toast.success('Comment added successfully');
    } catch (err) {
      console.error('Error adding comment:', err.message);
      toast.error(err.message);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Community Feed</h1>
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Community Feed</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Feed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Community Feed</h1>

      {posts.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-16">
          <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium">No posts available yet.</p>
          <p className="text-sm text-gray-400">Check back later for updates from our doctors.</p>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => {
          const authorName = post.author ? `${post.author.Fname || ''} ${post.author.Lname || ''}`.trim() : 'Unknown Doctor';
          const authorInitials = getInitials(authorName);
          const authorSpeciality = post.author?.speciality?.[0] || 'General Practitioner';
          const authorProfilePic = post.author?.profilePicture;

          return (
            <Card key={post._id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-start space-x-4 pb-3">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  {authorProfilePic ? (
                    <AvatarImage src={authorProfilePic} alt={authorName} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {authorInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{authorName}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {authorSpeciality}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {formatDate(post.createdAt)}
                    </CardDescription>
                  </div>
                  {post.title && (
                    <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {post.imageURL && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                      <img
                        src={post.imageURL}
                        alt={post.title || 'Post image'}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col items-start gap-4 w-full pt-4 border-t">
                <div className="flex items-center gap-6 w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{Array.isArray(post.likes) ? post.likes.length : 0}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments?.length || 0}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Comments Section */}
                <div className="w-full space-y-4">
                  {post.comments?.map((comment) => (
                    <div key={comment._id} className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(comment.user?.Fname || 'Anonymous')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {comment.user?.Fname || 'Anonymous'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {comment.text}
                        </p>
                        {comment.doctorReply && (
                          <div className="mt-2 pl-4 border-l-2 border-primary/20">
                            <p className="text-xs font-medium text-primary">
                              {authorName} (Doctor)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {comment.doctorReply}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 w-full">
                    <Input
                      placeholder="Add a comment..."
                      value={commentText[post._id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleComment(post._id)}
                      disabled={!commentText[post._id]?.trim()}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeedPage;