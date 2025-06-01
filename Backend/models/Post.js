// Backend/models/Post.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // patient user
    text: { type: String, required: true },
    doctorReply: { type: String }, // Optional reply by doctor
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor', 
    },
    title: { 
        type: String,
        trim: true,
        maxlength: 150,
    },
    content: { 
        type: String,
        required: [true, "Post content cannot be empty."],
        trim: true,
    },
    imageURL: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    comments: [commentSchema], 
}, { 
    timestamps: true 
});

postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
