import "bootstrap/dist/css/bootstrap.css";

export default ({ Component, pageProps }) => {
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
};
