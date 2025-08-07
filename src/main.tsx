import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { LanguageProvider } from './context/LanguageContext.tsx';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { BrowserRouter } from "react-router-dom";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
    <LanguageProvider>
    <App />
    </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
