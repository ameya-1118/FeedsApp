import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getPendingPosts, approvePost, rejectPost } from "../services/postService.js";
import { getAllUsers } from "../services/authService.js";

export default function Admin() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const fetchPendingPosts = async () => {
    try {
      setLoadingPosts(true);
      const data = await getPendingPosts();
      const postsList = Array.isArray(data) ? data : data?.value || [];
      setPosts(postsList);
    } catch (error) {
      console.error("Failed to fetch posts", error);
      toast.error("Failed to load pending posts");
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error(error.response?.data?.msg || "Failed to load users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (error) {
        console.error("Failed to parse user", error);
      }
    }

    fetchPendingPosts();
    fetchUsers();
  }, []);

  const handleApprove = async (postId) => {
    try {
      await approvePost(postId);
      toast.success("Post approved!");
      setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));
    } catch (error) {
      toast.error("Failed to approve post");
    }
  };

  const handleReject = async (postId) => {
    try {
      await rejectPost(postId);
      toast.success("Post rejected!");
      setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));
    } catch (error) {
      toast.error("Failed to reject post");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/login");
  };

  const handleMenuAction = (action) => {
    setMenuOpen(false);
    action();
  };

  return (
    <main className="app-shell">
      <div className="app-topbar">
        <div className="topbar-inner">
          <div className="topbar-copy">
            <h1 className="topbar-title">Admin Dashboard</h1>
            <p className="topbar-subtitle">Review posts and manage registered users.</p>
          </div>
          <div className="topbar-actions">
            <div className="topbar-menu">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="btn btn-soft app-button menu-trigger"
                aria-label="Open admin menu"
              >
                <img
                  src={currentUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                  alt={currentUser?.username || "Admin profile"}
                  className="menu-avatar"
                />
              </button>

              {menuOpen && (
                <div className="menu-dropdown">
                  <button
                    onClick={() => handleMenuAction(() => navigate("/profile"))}
                    className="menu-item"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => handleMenuAction(() => {
                      fetchPendingPosts();
                      fetchUsers();
                    })}
                    className="menu-item"
                  >
                    Refresh
                  </button>

                  <button
                    onClick={() => handleMenuAction(handleLogout)}
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

      <div className="content-wrap medium">
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab("posts")}
            className={`admin-tab ${activeTab === "posts" ? "is-active" : ""}`}
          >
            Pending Posts ({posts.length})
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`admin-tab ${activeTab === "users" ? "is-active" : ""}`}
          >
            Users ({users.length})
          </button>
        </div>

        {activeTab === "posts" ? (
          <>
            <h2 className="section-title mb-6">Pending Posts</h2>

            {loadingPosts ? (
              <p className="empty-state">Loading pending posts...</p>
            ) : posts.length === 0 ? (
              <p className="empty-state">No pending posts!</p>
            ) : (
              <div className="feed-stack">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="post-card"
                  >
                    <div className="post-header">
                      <img
                        src={post.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                        alt={post.username}
                        className="avatar"
                      />
                      <div className="post-meta">
                        <p className="post-user">{post.username}</p>
                        <p className="post-date">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="post-body">
                      <p className="mb-4">{post.content}</p>
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full rounded-2xl object-cover max-h-96"
                      />
                    </div>

                    <div className="post-footer flex gap-3 px-4 py-4 border-t border-white/10">
                      <button
                        onClick={() => handleApprove(post._id)}
                        className="btn btn-success"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(post._id)}
                        className="btn btn-danger"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="surface-card">
            <div className="section-heading">
              <h2 className="section-title">Registered Users</h2>
              <p className="section-meta">{users.length} users</p>
            </div>

            {loadingUsers ? (
              <p className="empty-state">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="empty-state">No users found.</p>
            ) : (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.username || "-"}</td>
                        <td>{user.email || "-"}</td>
                        <td>{user.phone || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
