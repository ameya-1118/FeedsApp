import API from "./api.js";

export const getApprovedPosts = async () => {
  const response = await API.get("/posts");
  return response.data;
};

export const getPendingPosts = async () => {
  const response = await API.get("/posts/pending");
  return response.data;
};

export const createPost = async (formData) => {
  const response = await API.post("/posts/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const approvePost = async (postId) => {
  const response = await API.put(`/posts/approve/${postId}`);
  return response.data;
};

export const rejectPost = async (postId) => {
  const response = await API.delete(`/posts/reject/${postId}`);
  return response.data;
};

export const likePost = async (postId, userId) => {
  const response = await API.post("/posts/like", { postId, userId });
  return response.data;
};

export const addComment = async (commentData) => {
  const response = await API.post("/posts/comment", commentData);
  return response.data;
};

export const getUserPosts = async (userId) => {
  const response = await API.get(`/posts/user/${userId}`);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await API.delete(`/posts/${postId}`);
  return response.data;
};
