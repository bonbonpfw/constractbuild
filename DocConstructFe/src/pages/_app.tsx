import React, { useEffect } from "react";
import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";
import Layout from "../components/shared/Layout";
import GlobalStyle from "../styles/globalStyles";
import theme from "../styles/theme";
import "../styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function MyApp({ Component, pageProps }: AppProps) {
  const noLayoutRoutes = ["/login"];
  const router = useRouter();
  const { pathname } = router;

  const content = <Component {...pageProps} />;

  const wrapped = noLayoutRoutes.includes(pathname) ? (
    content
  ) : (
    <Layout>{content}</Layout>
  );

  useEffect(() => {
    const token = getCookie("auth_token");
    const isLoginPage = router.pathname === "/login";

    if (!token && !isLoginPage) {
      (async () => {
        await router.replace("/login");
      })();
      return;
    }

    if (token && isLoginPage) {
      (async () => {
        await router.replace("/projects");
      })();
    }
  }, [router.pathname]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {wrapped}
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ThemeProvider>
  );
}

export default MyApp;
