// Backend/controller/postController.js
import Post from '../models/Post.js';
import doctorModel from '../models/doctorModel.js'; // Needed to populate author info
import userModel from '../models/userModel.js'; // Fix the import to use correct filename
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
// --- Create a new Post ---
export const createPost = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        // Ensure only doctors can create posts (middleware should ideally handle this)
        if (req.user.role !== 'doctor') {
             return res.status(403).json({ success: false, message: "Only doctors can create posts." });
        }
        console.log('User:', req.user);

        const doctorId = req.user.id;
        const { title, content } = req.body;
        const file = req.file;
        if (!title || !content || !content.trim() === '' ) {
            return res.status(400).json({ success: false, message: "Post content cannot be empty." });
        }
        console.log('File:', req.file);
        let image = null;

        if (req.file) {
            try {
                console.log('Starting Cloudinary upload...');
                
                // Use Cloudinary's direct upload method
                // Convert Buffer to base64 string
                const base64Data = req.file.buffer.toString('base64');
                
                // Create data URL
                const dataURL = 'data:' + req.file.mimetype + ';base64,' + base64Data;
                
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(
                    dataURL,
                    {
                        folder: 'post_images',
                        resource_type: 'image',
                        transformation: [{ width: 800, height: 800, crop: 'limit' }]
                    }
                );

                console.log('Cloudinary upload success:', result);
                const imageURL = result.secure_url; // Use imageURL instead of image
                console.log('Image URL:', imageURL);

                // Create post with image URL
                const newPost = new Post({
                    author: doctorId,
                    title: title ? title.trim() : undefined,
                    content: content.trim(),
                    imageURL: imageURL // Use the correct field name from the schema
                });

                await newPost.save();
                const populatedPost = await Post.findById(newPost._id)
                    .populate('author', 'Fname Lname speciality profilePicture');

                res.status(201).json({ 
                    success: true, 
                    message: "Post created successfully.", 
                    data: populatedPost 
                });

                return; // Return early since we've already sent the response
            } catch (error) {
                console.error('Error uploading image:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: "Failed to upload image: " + error.message 
                });
            }
        }
        
        const newPost = new Post({
            author: doctorId,
            title: title ? title.trim() : undefined,
            content: content.trim(),
            imageURL: image // Use the correct field name from the schema
        });

        await newPost.save();

        // Populate author details before sending back (optional, but good practice)
        const populatedPost = await Post.findById(newPost._id).populate('author', 'Fname Lname speciality'); 

        res.status(201).json({ 
            success: true, 
            message: "Post created successfully.", 
            data: populatedPost 
        });

    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ success: false, message: "Server error creating post." });
    }
};

// --- Get Posts by Logged-in Doctor ---
export const getMyPosts = async (req, res) => {
     try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const doctorId = req.user.id;

        const myPosts = await Post.find({ author: doctorId })
                                .sort({ createdAt: -1 }); // Show newest first

        res.status(200).json({ success: true, data: myPosts });

    } catch (error) {
        console.error("Error fetching doctor's posts:", error);
        res.status(500).json({ success: false, message: "Server error fetching posts." });
    }
};

// --- Update Doctor's Own Post ---
export const updateMyPost = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const doctorId = req.user.id;
        const postId = req.params.id; // Get post ID from route parameter
        const { title, content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, message: "Post content cannot be empty." });
        }
        
        // Find the post ensuring it belongs to the logged-in doctor
        const post = await Post.findOne({ _id: postId, author: doctorId });

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found or you don't have permission to edit." });
        }

        post.title = title ? title.trim() : post.title; // Keep old title if new one is empty
        post.content = content.trim();
        
        const updatedPost = await post.save();
        const populatedPost = await Post.findById(updatedPost._id).populate('author', 'Fname Lname speciality'); 

        res.status(200).json({ 
            success: true, 
            message: "Post updated successfully.", 
            data: populatedPost 
        });

    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ success: false, message: "Server error updating post." });
    }
};

// --- Delete Doctor's Own Post ---
export const deleteMyPost = async (req, res) => {
     try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const doctorId = req.user.id;
        const postId = req.params.id; // Get post ID from route parameter

        // Find and delete the post ensuring it belongs to the logged-in doctor
        const result = await Post.deleteOne({ _id: postId, author: doctorId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Post not found or you don't have permission to delete." });
        }

        res.status(200).json({ success: true, message: "Post deleted successfully." });

    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ success: false, message: "Server error deleting post." });
    }
};

// --- Get All Posts for Public Feed (Example) ---
export const getAllFeedPosts = async (req, res) => {
    try {
        console.log('Fetching feed posts...');
        
        // Get all posts with populated author and comments
        const posts = await Post.find()
            .populate('author', 'Fname Lname speciality profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'name email image',
                    model: 'user'
                }
            })
            .sort({ createdAt: -1 })
            .limit(20);

        console.log(`Found ${posts.length} posts`);

        // Get the current user's ID (could be either doctor or regular user)
        const userId = req.user?.id;
        
        // Transform posts to include like status and ensure proper data structure
        const postsWithLikeStatus = posts.map(post => {
            const postObj = post.toObject();
            return {
                ...postObj,
                isLiked: userId ? postObj.likes.includes(userId) : false,
                likes: postObj.likes || [],
                comments: postObj.comments || []
            };
        });

        console.log('Successfully processed posts');
        
        res.status(200).json({ 
            success: true, 
            data: postsWithLikeStatus 
        });
    } catch (error) {
        console.error("Error fetching feed posts:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error fetching feed posts.",
            error: error.message 
        });
    }
};

export const likePost = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Please login to like posts." });
        }

        const userId = req.user.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found." });

        const alreadyLiked = post.likes.includes(userId);
        if (alreadyLiked) {
            post.likes.pull(userId); // Unlike
        } else {
            post.likes.push(userId); // Like
        }

        await post.save();
        res.status(200).json({ 
            success: true, 
            message: alreadyLiked ? "Post unliked." : "Post liked.",
            likes: post.likes
        });

    } catch (error) {
        console.error("Error liking/unliking post:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

export const addComment = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Please login to comment." });
        }

        const userId = req.user.id;
        const postId = req.params.id;
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ success: false, message: "Comment text is required." });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found." });

        // Add the comment
        post.comments.push({
            user: userId,
            text: text.trim()
        });

        await post.save();

        // Populate the new comment with user details
        const populatedPost = await Post.findById(postId)
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'name email image',
                    model: 'user'
                }
            });

        res.status(201).json({
            success: true,
            message: "Comment added successfully.",
            comments: populatedPost.comments
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

export const replyToComment = async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: "Only doctors can reply to comments." });
        }

        const { postId, commentId } = req.params;
        const { replyText } = req.body;

        if (!replyText || replyText.trim() === '') {
            return res.status(400).json({ success: false, message: "Reply text is required." });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found." });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "Comment not found." });

        comment.doctorReply = replyText.trim();

        await post.save();
        res.status(200).json({ success: true, message: "Reply added." });

    } catch (error) {
        console.error("Error replying to comment:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};