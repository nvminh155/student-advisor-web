import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/auth-context.tsx";
import { DocumentContractProvider } from "./contexts/document-contract-context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <DocumentContractProvider>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </DocumentContractProvider>
    </BrowserRouter>
  </StrictMode>
);
