import axios from "axios";
import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  return currentUser ? (
    <h1>You are signed in!</h1>
  ) : (
    <h1>You are not signed in...</h1>
  );
};

// Nextjs way of performing SSR calls
LandingPage.getInitialProps = async (context) => {
  if (typeof window === "undefined") {
    const client = buildClient(context);
    const { data } = await client.get("/api/users/currentuser");

    return data;
  } else {
    // we are in the browser! Happens during react-router
    // requests can be made with a base url of ''
    const { data } = await axios.get("/api/users/currentuser");
    return data;
  }

  return {};
};

export default LandingPage;
