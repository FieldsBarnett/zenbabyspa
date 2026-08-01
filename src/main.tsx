import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import App from "./App.tsx";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light">
      <ConvexBetterAuthProvider
        client={convex}
        authClient={
          authClient as unknown as Parameters<
            typeof ConvexBetterAuthProvider
          >[0]["authClient"]
        }
      >
        <App />
      </ConvexBetterAuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
