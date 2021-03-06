import nats from "node-nats-streaming";

// Jest to clean up logs after every event
console.clear();

// stan === client
const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("connected to NATS");

  const data = JSON.stringify({
    id: "123",
    title: "concert",
    price: 20,
  });

  stan.publish("ticket:created", data, () => {
    console.log("Event published!!");
  });
});
