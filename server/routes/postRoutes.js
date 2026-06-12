import express from "express";
import upload from "../middleware/upload.js";

import {
  createPost,
  getApprovedPosts,
  getPendingPosts,
  approvePost,
  rejectPost,
  likePost,
  addComment,
  getPostsByUser,
  deletePost
} from "../controllers/postController.js";

const router = express.Router();

router.post(
  "/create",
  upload.single("image"),
  createPost
);

router.get("/", getApprovedPosts);

router.get("/pending", getPendingPosts);

router.put("/approve/:id", approvePost);

router.delete("/reject/:id", rejectPost);

router.post("/like", likePost);

router.post("/comment", addComment);

router.get("/user/:userId", getPostsByUser);

router.delete("/:id", deletePost);

export default router;
