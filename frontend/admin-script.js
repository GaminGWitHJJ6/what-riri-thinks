const blogList = document.getElementById("blog-list");
let currentPosts = [];

const channel = new BroadcastChannel("riri-blog");

function loadPosts() {
  fetch("http://localhost:3001/posts?_=" + new Date().getTime())
    .then(res => res.json())
    .then(posts => {
      currentPosts = posts;
      blogList.innerHTML = "";

      if (posts.length === 0) {
        blogList.innerHTML = `
          <div class="fade-in" style="text-align: center; color: #888; font-style: italic; margin-top: 50px; font-size: 1.2rem;">
            No stories just yet — but something good is always on the way.
          </div>
        `;
        return;
      }

      posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "blog-card";

        const commentsHTML = (post.comments || []).map(
          c => `<li><strong>${c.name || 'Anonymous'}:</strong> ${c.text}</li>`
        ).join("");

        div.innerHTML = `
          <h2>${post.title}</h2>
          <p>${post.content}</p>

          <hr>
          <h4>Comments:</h4>
          <ul>${commentsHTML}</ul>

          <input id="name-${post.id}" placeholder="Your Name">
          <input id="comment-${post.id}" placeholder="Your Comment">
          <button onclick="comment('${post.id}')">Comment</button>

          <div class="card-buttons">
            <button onclick="editBlog('${post.id}', '${post.title}', \`${post.content.replace(/`/g, '\\`')}\`)">Edit</button>
            <button onclick="deleteBlog('${post.id}')">Delete</button>
          </div>
        `;

        blogList.appendChild(div);
      });
    })
    .catch(err => console.error("Failed to load posts:", err));
}

loadPosts(); // Initial load

function postBlog() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  if (!title || !content) return alert("Please fill both fields");

  fetch("http://localhost:3001/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content })
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById("title").value = "";
      document.getElementById("content").value = "";
      console.log("Blog posted, refreshing...");
      setTimeout(() => {
        loadPosts();
        channel.postMessage("update");
      }, 100);
    })
    .catch(err => console.error("Failed to post blog:", err));
}

function comment(postId) {
  const name = document.getElementById(`name-${postId}`).value;
  const text = document.getElementById(`comment-${postId}`).value;

  if (!text) return alert("Write something!");

  fetch(`http://localhost:3001/comments/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, text })
  })
    .then(res => res.json())
    .then(() => {
      console.log("Comment posted, refreshing...");
      setTimeout(() => {
        loadPosts();
        channel.postMessage("update");
      }, 100);
    })
    .catch(err => console.error("Failed to post comment:", err));
}

function deleteBlog(id) {
  if (!confirm("Delete this blog post?")) return;

  fetch(`http://localhost:3001/posts/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(() => {
      console.log("Blog deleted, refreshing...");
      setTimeout(() => {
        loadPosts();
        channel.postMessage("update");
      }, 100);
    })
    .catch(err => console.error("Failed to delete blog:", err));
}

function editBlog(id, oldTitle, oldContent) {
  const newTitle = prompt("New Title:", oldTitle);
  const newContent = prompt("New Content:", oldContent);

  if (!newTitle || !newContent) return;

  fetch(`http://localhost:3001/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle, content: newContent })
  })
    .then(res => res.json())
    .then(() => {
      console.log("Blog updated, refreshing...");
      setTimeout(() => {
        loadPosts();
        channel.postMessage("update");
      }, 100);
    })
    .catch(err => console.error("Failed to update blog:", err));
}

// 🔁 Listen for updates from index.html
channel.addEventListener("message", (event) => {
  if (event.data === "update") {
    console.log("Received update from viewer — reloading posts...");
    loadPosts();
  }
});
