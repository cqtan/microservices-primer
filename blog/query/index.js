const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  console.log(posts);

  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on Port 4002");

  // For event syncing
  const res = await axios.get("http://event-bus-srv:4005/events");

  for (let event of res.data) {
    console.log("Syncing event:", event.type);

    handleEvent(event.type, event.data);
  }
});

function handleEvent(type, data) {
  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    const comment = post.comments.find((c) => c.id === id);

    comment.status = status;
    comment.content = content;
  }
}
