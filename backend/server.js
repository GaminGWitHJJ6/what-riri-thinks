const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const DB_PATH = __dirname + "/db.json";

// Get all posts
app.get("/posts", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  res.json(data.posts);
});

// Add a new post
app.post("/posts", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  const newPost = {
    ...req.body,
    id: Date.now().toString(),
    comments: []
  };
  data.posts.unshift(newPost);
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  res.status(201).json({ message: "Post added" });
});

// Add a comment to a post
app.post("/comments/:postId", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  const post = data.posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  post.comments.push({
    ...req.body,
    time: new Date().toISOString()
  });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  res.status(201).json({ message: "Comment added" });
});

// Delete a blog post
app.delete("/posts/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  data.posts = data.posts.filter(p => p.id !== req.params.id);
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  res.json({ message: "Post deleted" });
});

// Edit a blog post
app.put("/posts/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  const post = data.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  post.title = req.body.title;
  post.content = req.body.content;
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  res.json({ message: "Post updated" });
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
