const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const events = [];

app.post("/events", (req, res) => {
  const event = req.body;

  events.push(event);

  // Using Docker's ClusterIP port instead of localhost
  axios.post("http://posts-clusterip-srv:4000/events", event).catch((err) => {
    console.log("4000 errored");
  });
  axios.post("http://comments-srv:4001/events", event).catch((err) => {
    console.log("4001 errored");
  });
  axios.post("http://query-srv :4002/events", event).catch((err) => {
    console.log("4002 errored");
  });
  axios.post("http://moderation-srv:4003/events", event).catch((err) => {
    console.log("4003 errored");
  });

  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log("listening on port 4005");
});
