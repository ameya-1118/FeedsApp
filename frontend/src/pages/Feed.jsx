import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Heart, MessageCircle, Send } from "lucide-react";
import { getApprovedPosts, likePost, addComment } from "../services/postService.js";

export default function Feed() {
  const navigate = useNavigate();
  const captionPreviewLength = 120;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCaptions, setExpandedCaptions] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [submittingComments, setSubmittingComments] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [headerHidden, setHeaderHidden] = useState(false);
  const commentInputRefs = useRef({});
  const lastScrollY = useRef(0);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to parse user", error);
      }
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const postsData = await getApprovedPosts();
      const data = Array.isArray(postsData)
        ? postsData
        : postsData?.value || postsData?.posts || [];

      setPosts(data);
    } catch (error) {
      console.error("Feed fetch failed", error);
      toast.error("Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    const handleFocus = () => {
      setLoading(true);
      fetchPosts();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 24) {
        setHeaderHidden(false);
      } else if (currentScrollY > lastScrollY.current) {
        setHeaderHidden(true);
      } else {
        setHeaderHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLike = async (postId) => {
    if (!userId) {
      toast.error("Please login first");
      return;
    }

    try {
      const response = await likePost(postId, userId);

      setPosts((currentPosts) => currentPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              likes: response.liked
                ? [...(post.likes || []), userId]
                : (post.likes || []).filter((id) => id !== userId),
            }
          : post
      ));

      toast.success(response.msg);
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/login");
  };

  const handleMenuAction = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const toggleCaption = (postId) => {
    setExpandedCaptions((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
  };

  const handleCommentChange = (postId, value) => {
    setCommentDrafts((current) => ({
      ...current,
      [postId]: value,
    }));
  };

  const handleAddComment = async (postId) => {
    const text = commentDrafts[postId]?.trim();

    if (!currentUser?.id) {
      toast.error("Please login first");
      return;
    }

    if (!text) {
      toast.error("Write a comment first");
      return;
    }

    try {
      setSubmittingComments((current) => ({
        ...current,
        [postId]: true,
      }));

      const response = await addComment({
        postId,
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        text,
      });

      setPosts((currentPosts) => currentPosts.map((post) =>
        post._id === postId
          ? { ...post, comments: response.comments }
          : post
      ));

      setCommentDrafts((current) => ({
        ...current,
        [postId]: "",
      }));

      toast.success(response.msg);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to add comment");
    } finally {
      setSubmittingComments((current) => ({
        ...current,
        [postId]: false,
      }));
    }
  };

  const handleCommentClick = (postId) => {
    const willOpen = !openComments[postId];

    setOpenComments((current) => ({
      ...current,
      [postId]: willOpen,
    }));

    if (willOpen) {
      setTimeout(() => {
        commentInputRefs.current[postId]?.focus();
      }, 0);
    }
  };

  const handleShare = async (postId) => {
    const shareUrl = `${window.location.origin}/feed#post-${postId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Feedsss Post",
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("Post link copied");
    } catch (error) {
      toast.error("Failed to share post");
    }
  };

  return (
    <main className="app-shell">
      <div className={`app-topbar ${headerHidden ? "is-hidden" : ""}`}>
        <div className="topbar-inner">
          <div className="topbar-copy">
            <h1 className="topbar-title">Feedsss</h1>
            <p className="topbar-subtitle">
              Swipe through the latest posts with a brighter, polished feed.
            </p>
          </div>

          <div className="topbar-actions">
            <div className="topbar-menu">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="btn btn-soft app-button menu-trigger"
                aria-label="Open profile menu"
              >
                <img
                  src={currentUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                  alt={currentUser?.username || "Profile"}
                  className="menu-avatar"
                />
              </button>

              {menuOpen && (
                <div className="menu-dropdown">
                  <button
                    onClick={() => handleMenuAction("/profile")}
                    className="menu-item"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => handleMenuAction("/create-post")}
                    className="menu-item"
                  >
                    Create Post
                  </button>

                  <button
                    onClick={handleLogout}
                    className="menu-item menu-item-danger"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="content-wrap narrow">
        {loading ? (
          <p className="empty-state">
            Loading posts...
          </p>
        ) : posts.length === 0 ? (
          <p className="empty-state">
            No approved posts yet.
          </p>
        ) : (
          <div className="feed-stack">
            {posts.map((post) => {
              const hasLiked = post.likes?.some((like) =>
                typeof like === "string" ? like === userId : like._id === userId
              );
              const likeCount = post.likes?.length || 0;
              const commentCount = post.comments?.length || 0;
              const caption = post.content || "";
              const isExpanded = expandedCaptions[post._id];
              const isLongCaption = caption.length > captionPreviewLength;
              const visibleCaption = isLongCaption && !isExpanded
                ? `${caption.slice(0, captionPreviewLength).trim()}...`
                : caption;
              const isCommentsOpen = openComments[post._id];

              return (
                <div
                  key={post._id}
                  id={`post-${post._id}`}
                  className="post-card"
                >
                  <div className="post-header">
                    <img
                      src={post.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                      alt={post.username}
                      className="avatar"
                    />

                    <div className="post-meta">
                      <p className="post-user">
                        {post.username}
                      </p>

                      <p className="post-date">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <img
                    src={post.image}
                    alt="post"
                    className="post-media"
                  />

                  <div className="post-body">
                    <div className="post-actions">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`icon-action ${hasLiked ? "is-liked" : ""}`}
                        aria-label={hasLiked ? "Unlike post" : "Like post"}
                      >
                        <Heart size={18} fill={hasLiked ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => handleCommentClick(post._id)}
                        className="icon-action"
                        aria-label="Add comment"
                      >
                        <MessageCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleShare(post._id)}
                        className="icon-action"
                        aria-label="Share post"
                      >
                        <Send size={18} />
                      </button>
                    </div>

                    {likeCount > 0 && (
                      <p className="post-likes">
                        {likeCount} {likeCount === 1 ? "like" : "likes"}
                      </p>
                    )}
                   
                    {commentCount > 0 && (
                      <p className="post-comments-count">
                        {commentCount} {commentCount === 1 ? "comment" : "comments"}
                      </p>
                    )}
                    

                    <p className="post-caption">
                      <span className="post-caption-user">
                        {post.username}
                      </span>
                      <span className="post-caption-text">
                        {" "}{visibleCaption}
                      </span>
                    </p>

                    {isLongCaption && (
                      <button
                        onClick={() => toggleCaption(post._id)}
                        className="caption-toggle"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}

                    {isCommentsOpen && (
                      <div className="comments-section">
                        <div className="comment-form">
                          <input
                            type="text"
                            ref={(element) => {
                              commentInputRefs.current[post._id] = element;
                            }}
                            value={commentDrafts[post._id] || ""}
                            onChange={(e) => handleCommentChange(post._id, e.target.value)}
                            placeholder="Add a comment..."
                            className="comment-input"
                          />

                          <button
                            onClick={() => handleAddComment(post._id)}
                            className="comment-submit"
                          >
                            {submittingComments[post._id] ? "Posting..." : "Post"}
                          </button>
                        </div>

                        {commentCount > 0 && (
                          <div className="comment-list">
                            {post.comments.map((comment, index) => (
                              <div
                                key={comment._id || `${post._id}-${comment.createdAt || index}`}
                                className="comment-item"
                              >
                                <img
                                  src={comment.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                                  alt={comment.username}
                                  className="comment-avatar"
                                />

                                <div className="comment-copy">
                                  <p className="comment-text">
                                    <span className="comment-user">{comment.username}</span>
                                    <span className="comment-body"> {comment.text}</span>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
