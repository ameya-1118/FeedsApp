import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getUserPosts } from "../services/postService.js";

export default function Profile() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchUserPosts(parsedUser.id);
  }, []);

  const fetchUserPosts = async (userId) => {
    try {
      setLoading(true);
      const data = await getUserPosts(userId);
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch user posts", error);
      toast.error("Could not load profile posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/login");
  };

  const handleGoFeed = () => {
    navigate("/feed");
  };

  return (
    <main className="app-shell">
      <div className="app-topbar">
        <div className="topbar-inner">
          <div className="topbar-copy">
            <h1 className="topbar-title">Profile</h1>
            <p className="topbar-subtitle">Your posts and activity</p>
          </div>
          <div className="topbar-actions">
            <button
              onClick={handleGoFeed}
              className="btn btn-secondary app-button"
            >
              Feed
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-light app-button"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="content-wrap medium">
        {user ? (
          <div className="profile-card profile-hero">
            <img
              src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
              alt={user.username}
              className="avatar hero-avatar"
            />
            <div>
              <h2 className="text-3xl font-bold">{user.username}</h2>
              <p className="muted-copy">{user.email}</p>
              <div className="profile-stats">
                <span className="stat-pill">{posts.length} post{posts.length === 1 ? "" : "s"}</span>
                <span className="stat-pill">{user.role}</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="surface-card">
          <div className="section-heading">
            <h3 className="section-title">Posts</h3>
            <p className="section-meta">{loading ? "Fetching..." : `${posts.length} post${posts.length === 1 ? "" : "s"}`}</p>
          </div>

          {loading ? (
            <p className="empty-state">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="empty-state">No posts yet. Create one from the feed.</p>
          ) : (
            <div className="grid-cards">
              {posts.map((post) => (
                <div key={post._id} className="mini-card">
                  <img
                    src={post.image}
                    alt={post.content}
                    className="w-full h-64 object-cover"
                  />
                  <div className="mini-card-body">
                    <div className="flex items-center justify-between mb-3 gap-3">
                      <p className="muted-copy text-sm">{new Date(post.createdAt).toLocaleDateString()}</p>
                      <span className={`status-pill ${post.approved ? "live" : "pending"}`}>
                        {post.approved ? "Live" : "Pending"}
                      </span>
                    </div>
                    <p className="text-sm text-white">{post.content}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm muted-copy">
                      <span>Likes {post.likes?.length || 0}</span>
                      <span>@ {post.username}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
