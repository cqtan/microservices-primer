import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

// Jest to clean up logs after every event
console.clear();

// Creates a listener with a random clientId
// so that we can have mutliple Listeners (horizontal scaling)
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  stan.on("close", () => {
    console.log("NATS connection closed!!");
    process.exit(); // Close client a bit more gracefully
  });

  const options = stan.subscriptionOptions().setManualAckMode(true);

  // in case of horizontal scaling, we sometimes do not want identical listeners receiving the event
  // this is where Queue-Groups come in (aka qGroup)
  const subscription = stan.subscribe(
    "ticket:created",
    "orders-service-queue-group",
    options
  );

  // message = event + data
  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    }

    msg.ack();
  });
});

process.on("SIGINT", () => stan.close()); // On interrupt event trigger stan.on("close")
process.on("SIGTERM", () => stan.close()); // On terminate event trigger stan.on("close")
