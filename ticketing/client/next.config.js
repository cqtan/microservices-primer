// Make sure that this client Pod has these configurations before Skaffold creates the Pod
module.exports = {
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 300; // workaround for fast reload within Pods
    return config;
  },
};
