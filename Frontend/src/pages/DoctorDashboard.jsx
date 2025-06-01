import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader,CardFooter, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Send, Trash2, MessageSquare, Info, Heart, MessageCircle, Share2, Reply } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { toast } from "react-toastify";

const getAuthToken = () => localStorage.getItem('token');

const FeedCreator = ({ onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [postLoading, setPostLoading] = useState(false);
    const [postError, setPostError] = useState(null);
    const [postSuccess, setPostSuccess] = useState(null);

    // Add character counter for content
    const contentLength = content.length;
    const maxContentLength = 5000; // Maximum length for content

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setPostError("Post content cannot be empty.");
            return;
        }

        setPostLoading(true);
        setPostError(null);
        setPostSuccess(null);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            const data = await response.json();
            if (data.success) {
                setPostSuccess('Post created successfully!');
                setTitle('');
                setContent('');
                setImage(null);
                setImagePreview('');
                onPostCreated();
            }
        } catch (error) {
            setPostError(error.message || 'Failed to create post');
        } finally {
            setPostLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto bg-background/90 border border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">Create New Post</CardTitle>
                <CardDescription className="text-muted-foreground">Share your medical insights with patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handlePostSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium text-muted-foreground">
                            Title (Optional)
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter post title"
                            className="border border-border/50 focus:border-primary focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-sm font-medium text-muted-foreground">
                            Content
                        </Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your medical insights..."
                            className="min-h-[200px] border border-border/50 focus:border-primary focus:ring-primary resize-none"
                            maxLength={maxContentLength}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {contentLength}/{maxContentLength} characters
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-sm font-medium text-muted-foreground">
                            Image (Optional)
                        </Label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="flex items-center gap-2"
                            >
                                <label htmlFor="image" className="cursor-pointer">
                                    <Send className="h-4 w-4" />
                                    Select Image
                                </label>
                            </Button>
                            {image && (
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-0 right-0 p-1 bg-black/50 rounded-bl-md">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-destructive/20"
                                            onClick={() => {
                                                setImage(null);
                                                setImagePreview('');
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Supported formats: JPG, PNG, GIF (Max 5MB)
                        </p>
                    </div>
                    <div className="flex justify-end gap-4">
                        <Button 
                            type="submit" 
                            disabled={postLoading || !content.trim()}
                            className="flex items-center gap-2"
                        >
                            {postLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Post
                                </>
                            )}
                        </Button>
                    </div>
                    {postError && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription className="text-sm">{postError}</AlertDescription>
                        </Alert>
                    )}
                    {postSuccess && (
                        <Alert variant="default" className="mt-4">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription className="text-sm">{postSuccess}</AlertDescription>
                        </Alert>
                    )}
                </form>
            </CardContent>
        </Card>
    );
};

const DoctorPostList = ({ initialPosts = [], onDelete }) => {
    if (!initialPosts || initialPosts.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-muted-foreground">
                    <p className="text-2xl mb-2">No Posts Yet</p>
                    <p className="text-sm">Start sharing your medical insights with patients</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {initialPosts.map(post => (
                <Card 
                    key={post._id} 
                    className="bg-background/90 border border-border/50 hover:shadow-lg transition-shadow duration-300"
                >
                    {post.imageURL && (
                        <div className="relative w-full aspect-video overflow-hidden rounded-md">
                            <img
                                src={post.imageURL}
                                alt={post.title || "Post image"}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs text-white">
                                {post.title || "Post Image"}
                            </div>
                        </div>
                    )}
                    <CardHeader className="pt-4 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                                {post.author?.profilePicture ? (
                                    <AvatarImage src={post.author.profilePicture} />
                                ) : (
                                    <AvatarFallback>
                                        {post.author ? 
                                            `${(post.author.Fname || '')[0] || ''}${(post.author.Lname || '')[0] || ''}` : 
                                            'DR'
                                        }
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div>
                                <div className="font-semibold">
                                    {post.author ? 
                                        `${post.author.Fname || ''} ${post.author.Lname || ''}` : 
                                        'Unknown Doctor'
                                    }
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {post.author?.speciality}
                                </div>
                            </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-primary">
                            {post.title || "Untitled Post"}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span>Posted on:</span>
                                <span className="font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-sm leading-relaxed line-clamp-4">{post.content}</p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                            <div className="text-xs text-muted-foreground">
                                <span className="mr-2">{post.likes.length} likes</span>
                                <span>{post.comments.length} comments</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex items-center gap-1"
                                >
                                    <Send className="h-3 w-3" />
                                    Share
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex items-center gap-1"
                                >
                                    <MessageSquare className="h-3 w-3" />
                                    Comment
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button 
                            variant="destructive-outline"
                            size="sm"
                            onClick={() => onDelete(post._id)}
                            className="flex items-center gap-1"
                        >
                            <Trash2 className="h-3 w-3" />
                            Delete
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

// Helper for initials
const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || "?";
    return (names[0][0]?.toUpperCase() || "") + (names[names.length - 1][0]?.toUpperCase() || "");
};

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
};

const DoctorDashboard = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentText, setCommentText] = useState({});
    const [replyText, setReplyText] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        fetchDoctorPosts();
    }, []);

    const fetchDoctorPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/posts/my-posts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch posts.');
            
            setPosts(data.data || []);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = () => {
        fetchDoctorPosts();
    };

    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('You must be logged in to like.');

            const res = await fetch(`/api/posts/like/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Like failed');

            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        isLiked: !post.isLiked,
                        likes: post.isLiked ? post.likes.filter(id => id !== postId) : [...post.likes, postId]
                    };
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
            if (!token) throw new Error('You must be logged in to comment.');

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

            setCommentText({ ...commentText, [postId]: '' });
            fetchDoctorPosts();
            toast.success('Comment added successfully');
        } catch (err) {
            console.error('Error adding comment:', err.message);
            toast.error(err.message);
        }
    };

    const handleReply = async (postId, commentId) => {
        const text = replyText[commentId];
        if (!text?.trim()) return;
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('You must be logged in to reply.');
                return;
            }

            const res = await fetch(`/api/posts/comment/reply/${postId}/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ replyText: text }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Reply failed');

            setReplyText({ ...replyText, [commentId]: '' });
            setReplyingTo(null);
            fetchDoctorPosts();
            toast.success('Reply added successfully');
        } catch (err) {
            console.error('Error adding reply:', err.message);
            toast.error(err.message);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Your Feed</h1>
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
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Your Feed</h1>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Feed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">Your Feed</h1>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Side - Feed Creator */}
                <div className="w-full md:w-1/2">
                    <div className="sticky top-8">
                        <FeedCreator onPostCreated={handlePostCreated} />
                    </div>
                </div>

                {/* Right Side - Posts Feed */}
                <div className="w-full md:w-1/2">
                    {posts.length === 0 && !loading ? (
                        <div className="text-center text-gray-500 mt-16">
                            <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-lg font-medium">No posts available yet.</p>
                            <p className="text-sm text-gray-400">Start sharing your medical insights with the community.</p>
                        </div>
                    ) : (
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
                                        <div className="flex items-center gap-2">
                                            <CardDescription className="text-xs">
                                                {formatDate(post.createdAt)}
                                            </CardDescription>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to delete this post?')) {
                                                        try {
                                                            const token = localStorage.getItem('token');
                                                            const response = await fetch(`/api/posts/${post._id}`, {
                                                                method: 'DELETE',
                                                                headers: {
                                                                    'Authorization': `Bearer ${token}`
                                                                }
                                                            });
                                                            
                                                            if (!response.ok) {
                                                                throw new Error('Failed to delete post');
                                                            }
                                                            
                                                            // Remove the post from the local state
                                                            setPosts(posts.filter(p => p._id !== post._id));
                                                            toast.success('Post deleted successfully');
                                                        } catch (error) {
                                                            console.error('Error deleting post:', error);
                                                            toast.error('Failed to delete post');
                                                        }
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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
                                        <div key={comment._id} className="space-y-2">
                                            <div className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg">
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
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="mt-2 text-xs"
                                                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                                    >
                                                        <Reply className="h-3 w-3 mr-1" />
                                                        Reply
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Replies */}
                                            {comment.doctorReply && (
                                                <div className="ml-8 flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback>
                                                            {getInitials(authorName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium">
                                                            {authorName} (You)
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {comment.doctorReply}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Reply Input */}
                                            {replyingTo === comment._id && (
                                                <div className="ml-8 mt-2">
                                                    <Textarea
                                                        placeholder="Write your reply..."
                                                        value={replyText[comment._id] || ''}
                                                        onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                                                        className="mb-2"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setReplyingTo(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleReply(post._id, comment._id)}
                                                            disabled={!replyText[comment._id]?.trim()}
                                                        >
                                                            Reply
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;