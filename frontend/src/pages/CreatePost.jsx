import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createPost } from "../services/postService.js";

export default function CreatePost() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter content");
      return;
    }

    if (!image) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const formData = new FormData();
      formData.append("content", content);
      formData.append("image", image);
      formData.append("userId", user.id);
      formData.append("username", user.username);
      formData.append("avatar", user.avatar);

      const res = await createPost(formData);
      toast.success(res.msg);

      setContent("");
      setImage(null);
      setPreview(null);

      navigate("/feed");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/feed");
  };

  return (
    <main className="app-shell">
      <div className="app-topbar">
        <div className="topbar-inner">
          <div className="topbar-copy">
            <h1 className="topbar-title">Create Post</h1>
            <p className="topbar-subtitle">Share a photo and caption with your audience.</p>
          </div>
          <div className="topbar-actions">
            <button
              onClick={handleGoBack}
              className="btn btn-secondary app-button"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="content-wrap form-shell">
        <div className="surface-card">
          <h1 className="text-2xl font-bold mb-6">Create Post</h1>

          <form onSubmit={handleSubmit} className="stack-form">
            <div>
              <label className="field-label">
                Caption
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write something..."
                className="input resize-none"
                rows="4"
              />
            </div>

            <div>
              <label className="field-label">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input file-input"
              />
            </div>

            {preview && (
              <div className="mt-4">
                <p className="field-label">Preview</p>
                <div className="preview-frame">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full rounded-xl object-cover max-h-96"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
