import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
{
  content: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  username: String,

  avatar: String,

  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: []
  },

  comments: {
    type: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        username: {
          type: String,
          required: true
        },
        avatar: {
          type: String,
          default: "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
        },
        text: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },

  approved: {
    type: Boolean,
    default: false
  }
},
{ timestamps: true }
);

export default mongoose.model("Post", postSchema);
