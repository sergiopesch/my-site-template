import { ThemeProvider } from "next-themes";
import '..styles/globals.css';
import RootLayout from "./layout";

function MyWebTemplate({ Component, pageProps }: { Component: React.ComponentType, pageProps: any }) {
  return (
    <ThemeProvider attribute="class">
      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>
    </ThemeProvider>
  );
}

export default MyWebTemplate;