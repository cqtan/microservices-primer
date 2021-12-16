const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

app.post("/events", (req, res) => {
  const event = req.body;

  axios.post("http://localhost:4000/events", event).catch((err) => {
    console.log("4000 errored");
  });
  axios.post("http://localhost:4001/events", event).catch((err) => {
    console.log("4001 errored");
  });
  axios.post("http://localhost:4002/events", event).catch((err) => {
    console.log("4002 errored");
  });
  axios.post("http://localhost:4003/events", event).catch((err) => {
    console.log("4003 errored");
  });

  res.send({ status: "OK" });
});

app.listen(4005, () => {
  console.log("listening on port 4005");
});
