import Post from "../models/Post.js";


export const createPost = async (req, res) => {
  try {
    const { content, userId, username, avatar } = req.body;

    if (!req.file) {
      return res.status(400).json({ msg: "Image is required" });
    }

    await Post.create({
      content,
      image: req.file.path,
      userId,
      username,
      avatar: avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    });

    res.json({
      msg: "Post uploaded. Waiting for approval."
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const getApprovedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ approved: true })
      .populate("userId", "username avatar")
      .populate("likes", "username")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ approved: false })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const approvePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    ).populate("userId", "username avatar");
    
    res.json({ msg: "Post approved", post });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const rejectPost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: "Post rejected and deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({ 
      msg: post.likes.includes(userId) ? "Liked" : "Unliked",
      likes: post.likes.length,
      liked: post.likes.includes(userId)
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId, userId, username, avatar, text } = req.body;
    const trimmedText = text?.trim();

    if (!postId || !userId || !username || !trimmedText) {
      return res.status(400).json({ msg: "Post, user, and comment text are required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    post.comments.push({
      userId,
      username,
      avatar: avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
      text: trimmedText,
    });

    await post.save();

    const latestComment = post.comments[post.comments.length - 1];

    res.json({
      msg: "Comment added",
      comment: latestComment,
      comments: post.comments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ userId })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: "Post deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};
