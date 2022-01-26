import axios from "axios";

const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  // axios.get("/api/users/currentuser").catch((err) => {
  //   console.log(err.message);
  // });

  return <h1>Landing Page</h1>;
};

LandingPage.getInitialProps = async ({ req }) => {
  if (typeof window === "undefined") {
    // we are on the server, e.g. due to page refresh
    // requests should be made to http://<SERIVCE_NAME>.NAMESPACE.svc.cluster.local
    const { data } = await axios.get(
      "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
      {
        // headers: {
        //   Host: "ticketing.com", // needed since Ingress does not assume domain name
        // },
        headers: req.headers, // Better to simply pass all request headers (includes cookies)
      }
    );

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
