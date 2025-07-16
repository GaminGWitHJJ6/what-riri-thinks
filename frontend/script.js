console.log("script.js is loaded!");
const blogList = document.getElementById("blog-list");
let currentPosts = [];

const channel = new BroadcastChannel("riri-blog");

function loadPosts() {
  fetch("https://what-riri-thinks.onrender.com/posts?_=" + new Date().getTime())
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
        `;

        blogList.appendChild(div);
      });
    })
    .catch(err => console.error("Failed to load posts:", err));
}

loadPosts(); // Initial load

function comment(postId) {
  const name = document.getElementById(`name-${postId}`).value;
  const text = document.getElementById(`comment-${postId}`).value;

  if (!text) return alert("Write something!");

  fetch(`https://what-riri-thinks.onrender.com/comments/${postId}`, {
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

// Listen for updates from admin
channel.addEventListener("message", (event) => {
  if (event.data === "update") {
    console.log("Received update from admin — reloading posts...");
    loadPosts();
  }
});
