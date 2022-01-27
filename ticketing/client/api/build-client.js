import axios from "axios";

// Custom axios so that we can route requests to Pods through Ingress
// overcomes issue of having to know domain names of each Pod: Let Ingress handle that instead
export default ({ req }) => {
  if (typeof window === "undefined") {
    // We are on the server
    // requests should be made to http://<SERIVCE_NAME>.NAMESPACE.svc.cluster.local

    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    // We must be on the browser
    // Happens during react-router
    return axios.create({
      baseUrl: "/",
    });
  }
};
